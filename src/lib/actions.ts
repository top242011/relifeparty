// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState, Personnel } from '../lib/definitions';

// --- Zod Schemas (no changes) ---
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

const PersonnelFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'กรุณากรอกชื่อ-นามสกุล' }),
  party_position: z.string().optional().nullable(),
  student_council_position: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_party_member: z.boolean(),
  is_mp: z.boolean(),
  is_executive: z.boolean(),
  campus: z.string(),
  faculty: z.string().optional().nullable(),
  year: z.coerce.number().optional().nullable(),
  gender: z.string().optional().nullable(),
  committees: z.array(z.string()).optional(),
});


// --- Generic Action Handler for simple forms ---
// --- FIX: Modified to accept an optional ID for update actions ---
async function handleFormAction<T extends z.ZodType<any, any>>(
    formData: FormData,
    schema: T,
    tableName: string,
    redirectPath: string,
    action: 'create' | 'update',
    idToUpdate?: string
): Promise<FormState> {
    const supabase = createClient();
    const rawFormData = Object.fromEntries(formData.entries());
    
    // --- FIX: Manually add the ID to the form data object before validation ---
    if (action === 'update' && idToUpdate) {
      rawFormData.id = idToUpdate;
    }

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
        
        if (result.error) {
            return { success: false, message: `Database Error: ${result.error.message}` };
        }
    } catch (e: any) {
        return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath(redirectPath, 'layout');

    if (action === 'create' && tableName === 'meetings') {
        const newMeetingId = result.data?.id;
        if (newMeetingId) {
            redirect(`${redirectPath}/${newMeetingId}/edit`);
        }
    } else {
      const successMessage = action === 'create' ? 'สร้างข้อมูลสำเร็จ!' : 'อัปเดตข้อมูลสำเร็จ!';
      redirect(`${redirectPath}?message=${encodeURIComponent(successMessage)}`);
    }
    
    return { success: true, message: 'ดำเนินการสำเร็จ!' };
}

// --- Helper function for file upload (no changes) ---
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

// --- Personnel Actions (Error handling re-verified) ---
export async function createPersonnel(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    
    const isPartyMember = formData.get('is_party_member') === 'on';
    const isMp = formData.get('is_mp') === 'on';
    const isExecutive = formData.get('is_executive') === 'on';
    
    let studentCouncilPosition = formData.get('student_council_position');
    if (!isMp && !isExecutive && studentCouncilPosition === '') {
        studentCouncilPosition = '-';
    }

    const validatedFields = PersonnelFormSchema.safeParse({
        name: formData.get('name'),
        party_position: formData.get('party_position'),
        student_council_position: studentCouncilPosition,
        bio: formData.get('bio'),
        is_active: formData.get('is_active') === 'on',
        is_party_member: isPartyMember,
        is_mp: isMp,
        is_executive: isExecutive,
        campus: formData.get('campus'),
        faculty: formData.get('faculty'),
        year: formData.get('year'),
        gender: formData.get('gender'),
        committees: formData.getAll('committees').map(String),
    });

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'ข้อมูลไม่ถูกต้อง' };
    }

    const imageFile = formData.get('image_file') as File;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) { imageUrl = await uploadImage(supabase, imageFile); }
        const { error } = await supabase.from('personnel').insert({ ...validatedFields.data, image_url: imageUrl });
        
        if (error) {
            return { success: false, message: `Database Error: ${error.message}` };
        }
    } catch (e: any) {
        return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/admin/personnel', 'layout');
    redirect('/admin/personnel?message=สร้างบุคลากรสำเร็จ!');
}

export async function updatePersonnel(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    
    const isPartyMember = formData.get('is_party_member') === 'on';
    const isMp = formData.get('is_mp') === 'on';
    const isExecutive = formData.get('is_executive') === 'on';

    let studentCouncilPosition = formData.get('student_council_position');
    if (!isMp && !isExecutive && studentCouncilPosition === '') {
        studentCouncilPosition = '-';
    }

    const validatedFields = PersonnelFormSchema.safeParse({
        id: id,
        name: formData.get('name'),
        party_position: formData.get('party_position'),
        student_council_position: studentCouncilPosition,
        bio: formData.get('bio'),
        is_active: formData.get('is_active') === 'on',
        is_party_member: isPartyMember,
        is_mp: isMp,
        is_executive: isExecutive,
        campus: formData.get('campus'),
        faculty: formData.get('faculty'),
        year: formData.get('year'),
        gender: formData.get('gender'),
        committees: formData.getAll('committees').map(String),
    });

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'ข้อมูลไม่ถูกต้อง' };
    }

    const imageFile = formData.get('image_file') as File;
    const { id: personnelId, ...dataToUpdate } = validatedFields.data;

    try {
        let imageUrl: string | null | undefined = undefined; 
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImage(supabase, imageFile);
        }

        const updatePayload = {
            ...dataToUpdate,
            ...(imageUrl !== undefined && { image_url: imageUrl }),
        };

        const { error } = await supabase.from('personnel').update(updatePayload).eq('id', id);
        
        if (error) {
            return { success: false, message: `Database Error: ${error.message}` };
        }
    } catch (e: any) {
        return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/admin/personnel', 'layout');
    revalidatePath(`/admin/personnel/${id}/edit`, 'page');
    redirect(`/admin/personnel?message=แก้ไขข้อมูลบุคลากรสำเร็จ!`);
}


// --- Actions for other modules ---

// Create Actions
export const createPolicy = (prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema.omit({ id: true }), 'policies', '/admin/policies', 'create');
export const createCommittee = (prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema.omit({ id: true }), 'committees', '/admin/committees', 'create');
export const createEvent = (prevState: FormState, formData: FormData) => handleFormAction(formData, EventSchema.omit({ id: true }), 'events', '/admin/events', 'create');
export const createNews = (prevState: FormState, formData: FormData) => handleFormAction(formData, NewsSchema.omit({ id: true }), 'news', '/admin/news', 'create');
export const createMeeting = (prevState: FormState, formData: FormData) => handleFormAction(formData, MeetingSchema.omit({ id: true }), 'meetings', '/admin/meetings', 'create');
export const createMotion = (prevState: FormState, formData: FormData) => handleFormAction(formData, MotionSchema.omit({ id: true }), 'motions', '/admin/motions', 'create');

// --- FIX: Update actions now pass the ID as the final argument to handleFormAction ---
export const updatePolicy = (id: string, prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema, 'policies', '/admin/policies', 'update', id);
export const updateCommittee = (id: string, prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema, 'committees', '/admin/committees', 'update', id);
export const updateEvent = (id: string, prevState: FormState, formData: FormData) => handleFormAction(formData, EventSchema, 'events', '/admin/events', 'update', id);
export const updateNews = (id: string, prevState: FormState, formData: FormData) => handleFormAction(formData, NewsSchema, 'news', '/admin/news', 'update', id);

// Generic Delete Action (no changes from previous fix)
async function deleteItem(formData: FormData, tableName: string, revalidatePathUrl: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const id = formData.get('id')?.toString();
    
    if (!id) {
        return { success: false, message: 'ไม่พบ ID สำหรับการลบ' };
    }
    
    try {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            return { success: false, message: `Database Error: ${error.message}` };
        }
        
        revalidatePath(revalidatePathUrl, 'layout');
        return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    } catch (e: any) {
        return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }
}

// Delete Actions (no changes from previous fix)
export const deletePolicy = async (formData: FormData) => {
    const result = await deleteItem(formData, 'policies', '/admin/policies');
    const redirectUrl = result.success ? `/admin/policies?message=${encodeURIComponent(result.message)}` : `/admin/policies?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deleteCommittee = async (formData: FormData) => {
    const result = await deleteItem(formData, 'committees', '/admin/committees');
    const redirectUrl = result.success ? `/admin/committees?message=${encodeURIComponent(result.message)}` : `/admin/committees?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deleteEvent = async (formData: FormData) => {
    const result = await deleteItem(formData, 'events', '/admin/events');
    const redirectUrl = result.success ? `/admin/events?message=${encodeURIComponent(result.message)}` : `/admin/events?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deleteNews = async (formData: FormData) => {
    const result = await deleteItem(formData, 'news', '/admin/news');
    const redirectUrl = result.success ? `/admin/news?message=${encodeURIComponent(result.message)}` : `/admin/news?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deleteMeeting = async (formData: FormData) => {
    const result = await deleteItem(formData, 'meetings', '/admin/meetings');
    const redirectUrl = result.success ? `/admin/meetings?message=${encodeURIComponent(result.message)}` : `/admin/meetings?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deleteMotion = async (formData: FormData) => {
    const result = await deleteItem(formData, 'motions', '/admin/motions');
    const redirectUrl = result.success ? `/admin/motions?message=${encodeURIComponent(result.message)}` : `/admin/motions?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};
export const deletePersonnel = async (formData: FormData) => {
    const result = await deleteItem(formData, 'personnel', '/admin/personnel');
    const redirectUrl = result.success ? `/admin/personnel?message=${encodeURIComponent(result.message)}` : `/admin/personnel?error=${encodeURIComponent(result.message)}`;
    redirect(redirectUrl);
};

// --- Other specific actions (no changes from previous fix) ---
export async function updateMotionResult(motionId: string, result: 'ผ่าน' | 'ไม่ผ่าน' | 'รอลงมติ') {
  'use server';
  const supabase = createClient();
  try {
    const { error } = await supabase.from('motions').update({ result }).eq('id', motionId);
    if (error) {
        return { success: false, message: `Database Error: ${error.message}` };
    }
    revalidatePath('/admin/motions', 'layout');
    revalidatePath(`/admin/motions/${motionId}/edit`, 'page');
    return { success: true, message: 'อัปเดตผลการลงมติสำเร็จ!' };
  } catch (e: any) {
    return { success: false, message: `An unexpected error occurred: ${e.message}` };
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
    return { success: true, message: 'ไม่มีข้อมูลการเข้าประชุมให้อัปเดต' };
  }

  try {
    const { error } = await supabase.from('attendance_records').upsert(recordsToUpsert, { onConflict: 'meeting_id, personnel_id' });
    if (error) {
        return { success: false, message: `Database Error: ${error.message}` };
    }
    revalidatePath(`/admin/meetings/${meetingId}/edit`);
    return { success: true, message: 'บันทึกข้อมูลการเข้าประชุมสำเร็จ!' };
  } catch (e: any) {
    return { success: false, message: `Database Error: ${e.message}` };
  }
}
