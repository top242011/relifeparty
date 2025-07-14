// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// --- FIXED: Imported the 'Personnel' type ---
import type { FormState, Personnel } from '../lib/definitions';

// --- Zod Schemas ---
const BaseSchemaWithId = z.object({
  id: z.string(),
  description: z.string().optional(),
});
const PolicySchema = BaseSchemaWithId.extend({ title: z.string().min(1, 'กรุณากรอกชื่อนโยบาย') });
const CommitteeSchema = BaseSchemaWithId.extend({ name: z.string().min(1, 'กรุณากรอกชื่อคณะกรรมาธิการ') });
const EventSchema = BaseSchemaWithId.extend({ title: z.string().min(1, 'กรุณากรอกชื่อกิจกรรม'), description: z.string().min(1, 'กรุณากรอกรายละเอียด'), eventDate: z.string().min(1, 'กรุณาเลือกวันที่'), location: z.string().optional() });
const NewsSchema = BaseSchemaWithId.extend({ title: z.string().min(1, 'กรุณากรอกหัวข้อข่าว'), content: z.string().min(1, 'กรุณากรอกเนื้อหาข่าว'), publishDate: z.string().min(1, 'กรุณาเลือกวันที่เผยแพร่'), imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')) });
const MeetingSchema = z.object({ id: z.string().optional(), topic: z.string().min(1, 'กรุณากรอกหัวข้อการประชุม'), date: z.string().min(1, 'กรุณาเลือกวันที่ประชุม'), scope: z.string() });
const MotionSchema = z.object({ id: z.string().optional(), title: z.string().min(1, 'กรุณากรอกชื่อญัตติ'), details: z.string().optional(), meeting_id: z.string().optional().nullable(), proposer_id: z.string().optional().nullable() });

// --- Updated Personnel Schema for File Uploads ---
const PersonnelFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'กรุณากรอกชื่อ-นามสกุล' }),
  position: z.string().min(1, { message: 'กรุณากรอกตำแหน่ง' }),
  bio: z.string().optional().nullable(),
  is_active: z.boolean(),
  role: z.string(),
  campus: z.string(),
  committees: z.array(z.string()).optional(),
});


// --- Helper function for file upload ---
async function uploadImage(supabase: any, file: File): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }
    const filePath = `personnel/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('personnel-images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw new Error('อัปโหลดรูปภาพไม่สำเร็จ');
    }

    const { data } = supabase.storage.from('personnel-images').getPublicUrl(filePath);
    return data.publicUrl;
}


// --- createPersonnel Action with File Upload ---
export async function createPersonnel(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    
    const committeeValues = formData.getAll('committees').map(String);

    const validatedFields = PersonnelFormSchema.safeParse({
        name: formData.get('name'),
        position: formData.get('position'),
        bio: formData.get('bio'),
        is_active: formData.get('is_active') === 'on',
        role: formData.get('role'),
        campus: formData.get('campus'),
        committees: committeeValues,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
        };
    }

    const imageFile = formData.get('image_file') as File;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImage(supabase, imageFile);
        }

        const { error } = await supabase.from('personnel').insert({
            ...validatedFields.data,
            image_url: imageUrl,
        });

        if (error) throw error;

    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath('/admin/personnel', 'layout');
    redirect('/admin/personnel');
}

// --- updatePersonnel Action with File Upload ---
export async function updatePersonnel(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient();

    const committeeValues = formData.getAll('committees').map(String);

    const validatedFields = PersonnelFormSchema.safeParse({
        id: id,
        name: formData.get('name'),
        position: formData.get('position'),
        bio: formData.get('bio'),
        is_active: formData.get('is_active') === 'on',
        role: formData.get('role'),
        campus: formData.get('campus'),
        committees: committeeValues,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
        };
    }

    const imageFile = formData.get('image_file') as File;
    // The type 'Personnel' is now correctly imported, so this line will work.
    const dataToUpdate: Partial<Personnel> & { image_url?: string | null } = { ...validatedFields.data };


    try {
        if (imageFile && imageFile.size > 0) {
            const newImageUrl = await uploadImage(supabase, imageFile);
            dataToUpdate.image_url = newImageUrl;
        }

        const { error } = await supabase.from('personnel').update(dataToUpdate).eq('id', id);

        if (error) throw error;

    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath('/admin/personnel', 'layout');
    revalidatePath(`/admin/personnel/${id}/edit`, 'page');
    redirect('/admin/personnel');
}


// --- Other Actions (Unchanged) ---
async function handleFormAction<T extends z.ZodType<any, any>>(
    formData: FormData,
    schema: T,
    tableName: string,
    redirectPath: string,
    action: 'create' | 'update'
): Promise<FormState> {
    const supabase = createClient();
    const rawFormData = Object.fromEntries(formData.entries());
    
    const validatedFields = schema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน' };
    }

    const { id, ...data } = validatedFields.data;
    let result;

    try {
        if (action === 'create') {
            result = await supabase.from(tableName).insert(data).select('id').single();
        } else {
            if (!id) return { success: false, message: 'ไม่พบ ID สำหรับการอัปเดต' };
            result = await supabase.from(tableName).update(data).eq('id', id);
        }
        if (result.error) throw result.error;
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath(redirectPath, 'layout');

    if (action === 'create' && tableName === 'meetings') {
        const newMeetingId = result.data?.id;
        if (newMeetingId) {
            redirect(`${redirectPath}/${newMeetingId}/edit`);
        }
    } else {
      redirect(redirectPath);
    }
    
    return { success: true, message: action === 'create' ? 'สร้างข้อมูลสำเร็จ!' : 'อัปเดตข้อมูลสำเร็จ!' };
}
// Create Actions
export const createPolicy = (prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema.omit({ id: true }), 'policies', '/admin/policies', 'create');
export const createCommittee = (prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema.omit({ id: true }), 'committees', '/admin/committees', 'create');
export const createEvent = (prevState: FormState, formData: FormData) => handleFormAction(formData, EventSchema.omit({ id: true }), 'events', '/admin/events', 'create');
export const createNews = (prevState: FormState, formData: FormData) => handleFormAction(formData, NewsSchema.omit({ id: true }), 'news', '/admin/news', 'create');
export const createMeeting = (prevState: FormState, formData: FormData) => handleFormAction(formData, MeetingSchema.omit({ id: true }), 'meetings', '/admin/meetings', 'create');
export const createMotion = (prevState: FormState, formData: FormData) => handleFormAction(formData, MotionSchema.omit({ id: true }), 'motions', '/admin/motions', 'create');

// Update Actions
export const updatePolicy = async (id: string, prevState: FormState, formData: FormData) => {
    formData.set('id', id);
    return handleFormAction(formData, PolicySchema, 'policies', '/admin/policies', 'update');
};
export const updateCommittee = async (id: string, prevState: FormState, formData: FormData) => {
  formData.set('id', id);
  return handleFormAction(formData, CommitteeSchema, 'committees', '/admin/committees', 'update');
};
export const updateEvent = async (id: string, prevState: FormState, formData: FormData) => {
    formData.set('id', id);
    return handleFormAction(formData, EventSchema, 'events', '/admin/events', 'update');
};
export const updateNews = async (id: string, prevState: FormState, formData: FormData) => {
    formData.set('id', id);
    return handleFormAction(formData, NewsSchema, 'news', '/admin/news', 'update');
};

// Delete Actions
async function deleteItem(formData: FormData, tableName: string, revalidatePathUrl: string) {
    const supabase = createClient();
    const id = formData.get('id')?.toString();
    if (!id) throw new Error('ID is required for deletion');
    
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(`Database Error: ${error.message}`);
    
    revalidatePath(revalidatePathUrl, 'layout');
    return { success: true, message: 'ลบข้อมูลสำเร็จ' };
}
export const deletePolicy = (formData: FormData) => deleteItem(formData, 'policies', '/admin/policies').then(() => redirect('/admin/policies'));
export const deleteCommittee = (formData: FormData) => deleteItem(formData, 'committees', '/admin/committees').then(() => redirect('/admin/committees'));
export const deleteEvent = (formData: FormData) => deleteItem(formData, 'events', '/admin/events').then(() => redirect('/admin/events'));
export const deleteNews = (formData: FormData) => deleteItem(formData, 'news', '/admin/news').then(() => redirect('/admin/news'));
export const deletePersonnel = (formData: FormData) => deleteItem(formData, 'personnel', '/admin/personnel').then(() => redirect('/admin/personnel'));
export const deleteMeeting = (formData: FormData) => deleteItem(formData, 'meetings', '/admin/meetings').then(() => redirect('/admin/meetings'));
export const deleteMotion = (formData: FormData) => deleteItem(formData, 'motions', '/admin/motions').then(() => redirect('/admin/motions'));


// Other specific actions
export async function updateMotionResult(motionId: string, result: 'ผ่าน' | 'ไม่ผ่าน' | 'รอลงมติ') {
  'use server';
  const supabase = createClient();
  try {
    const { error } = await supabase.from('motions').update({ result }).eq('id', motionId);
    if (error) throw error;
    revalidatePath('/admin/motions', 'layout');
    return { success: true, message: 'อัปเดตผลการลงมติสำเร็จ!' };
  } catch (e: any) {
    return { success: false, message: `Database Error: ${e.message}` };
  }
}

export async function updateAttendance(meetingId: string, formData: FormData) {
  'use server';
  const supabase = createClient();
  const rawData = Object.fromEntries(formData.entries());
  const recordsToUpsert = Object.entries(rawData)
    .filter(([key]) => key.startsWith('status-'))
    .map(([key, status]) => ({
        meeting_id: meetingId,
        personnel_id: key.replace('status-', ''),
        status: status as string,
    }));

  if (recordsToUpsert.length === 0) {
    return { success: false, message: 'ไม่พบข้อมูลการเข้าประชุมที่จะบันทึก' };
  }

  try {
    const { error } = await supabase.from('attendance_records').upsert(recordsToUpsert, { onConflict: 'meeting_id, personnel_id' });
    if (error) throw error;
    revalidatePath(`/admin/meetings/${meetingId}/edit`);
    return { success: true, message: 'บันทึกข้อมูลการเข้าประชุมสำเร็จ!' };
  } catch (e: any) {
    return { success: false, message: `Database Error: ${e.message}` };
  }
}
