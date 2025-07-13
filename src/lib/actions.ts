// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState } from './definitions';

// --- Zod Schemas (No changes) ---
const BaseSchema = z.object({
  id: z.string(), // ID is now required for validation in update actions
  description: z.string().optional(),
});
const PolicySchema = BaseSchema.extend({ title: z.string().min(1, 'กรุณากรอกชื่อนโยบาย') });
const CommitteeSchema = BaseSchema.extend({ name: z.string().min(1, 'กรุณากรอกชื่อคณะกรรมาธิการ') });
// ... other schemas ...
const MeetingSchema = z.object({ id: z.string().optional(), topic: z.string().min(1, 'กรุณากรอกหัวข้อการประชุม'), date: z.string().min(1, 'กรุณาเลือกวันที่ประชุม'), scope: z.string() });
const PersonnelSchema = z.object({ id: z.string().optional(), name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'), position: z.string().min(1, 'กรุณากรอกตำแหน่ง'), bio: z.string().optional(), image_url: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')), is_active: z.boolean(), role: z.string(), campus: z.string() });
const MotionSchema = z.object({ id: z.string().optional(), title: z.string().min(1, 'กรุณากรอกชื่อญัตติ'), details: z.string().optional(), meeting_id: z.string().optional().nullable(), proposer_id: z.string().optional().nullable() });
const EventSchema = z.object({ id: z.string().optional(), title: z.string().min(1, 'กรุณากรอกชื่อกิจกรรม'), description: z.string().min(1, 'กรุณากรอกรายละเอียด'), eventDate: z.string().min(1, 'กรุณาเลือกวันที่'), location: z.string().optional() });
const NewsSchema = z.object({ id: z.string().optional(), title: z.string().min(1, 'กรุณากรอกหัวข้อข่าว'), content: z.string().min(1, 'กรุณากรอกเนื้อหาข่าว'), publishDate: z.string().min(1, 'กรุณาเลือกวันที่เผยแพร่'), imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')) });


// --- Generic Action Handler (No changes) ---
async function handleFormAction<T extends z.ZodType<any, any>>(
    formData: FormData,
    schema: T,
    tableName: string,
    redirectPath: string,
    action: 'create' | 'update'
): Promise<FormState> {
    const supabase = createClient();
    const rawFormData = Object.fromEntries(formData.entries());
    
    const dataToValidate: { [key: string]: any } = { ...rawFormData };
    if (tableName === 'personnel') {
        dataToValidate.is_active = rawFormData.is_active === 'on';
    }

    const validatedFields = schema.safeParse(dataToValidate);

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน' };
    }

    const { id, ...data } = validatedFields.data;
    let error;

    try {
        if (action === 'create') {
            ({ error } = await supabase.from(tableName).insert(data).select('id').single());
        } else {
            if (!id) return { success: false, message: 'ไม่พบ ID สำหรับการอัปเดต' };
            ({ error } = await supabase.from(tableName).update(data).eq('id', id));
        }
        if (error) throw error;
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath(redirectPath);
    if (action === 'update' && id) {
        revalidatePath(`${redirectPath}/${id}/edit`);
    } else if (action === 'create' && redirectPath === '/admin/meetings') {
        const newMeetingId = error ? null : (data as any).id;
        if(newMeetingId) redirect(`${redirectPath}/${newMeetingId}/edit`);
    }

    if (action === 'create' && redirectPath !== '/admin/meetings') {
        redirect(redirectPath);
    }
    
    return { success: true, message: action === 'create' ? 'สร้างข้อมูลสำเร็จ!' : 'อัปเดตข้อมูลสำเร็จ!' };
}

// --- Specific Actions ---

// Create actions remain the same
export const createCommittee = (prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema.omit({ id: true }), 'committees', '/admin/committees', 'create');
// ... other create actions

/**
 * CORRECTED UPDATE ACTION
 * This action now accepts the ID as the first parameter, making it compatible with .bind().
 * The `prevState` and `formData` parameters follow, matching the signature expected by useFormState
 * after the ID has been bound.
 */
export const updateCommittee = async (id: string, prevState: FormState, formData: FormData) => {
  // Manually add the bound ID to the formData so it can be included in the validation process.
  formData.set('id', id);
  return handleFormAction(formData, CommitteeSchema, 'committees', '/admin/committees', 'update');
};

// You can apply the same pattern for other update actions if you wish to use .bind() with them
export const updatePolicy = async (id: string, prevState: FormState, formData: FormData) => {
    formData.set('id', id);
    return handleFormAction(formData, PolicySchema, 'policies', '/admin/policies', 'update');
};

// ... other actions ...

export const deleteCommittee = async (formData: FormData) => {
    const supabase = createClient();
    const id = formData.get('id')?.toString();
    if (!id) return { success: false, message: 'ID is required for deletion' };
    
    const { error } = await supabase.from('committees').delete().eq('id', id);
    if (error) return { success: false, message: `Database Error: ${error.message}` };
    
    revalidatePath('/admin/committees');
    redirect('/admin/committees'); // Redirect after successful deletion
};

// ... (rest of the file remains the same)
export const createPolicy = (prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema.omit({ id: true }), 'policies', '/admin/policies', 'create');
export const deletePolicy = (formData: FormData) => deleteItem(formData, 'policies', '/admin/policies');
export const createEvent = (prevState: FormState, formData: FormData) => handleFormAction(formData, EventSchema.omit({ id: true }), 'events', '/admin/events', 'create');
export const updateEvent = (prevState: FormState, formData: FormData) => handleFormAction(formData, EventSchema, 'events', '/admin/events', 'update');
export const deleteEvent = (formData: FormData) => deleteItem(formData, 'events', '/admin/events');
export const createNews = (prevState: FormState, formData: FormData) => handleFormAction(formData, NewsSchema.omit({ id: true }), 'news', '/admin/news', 'create');
export const updateNews = (prevState: FormState, formData: FormData) => handleFormAction(formData, NewsSchema, 'news', '/admin/news', 'update');
export const deleteNews = (formData: FormData) => deleteItem(formData, 'news', '/admin/news');
export const createPersonnel = (prevState: FormState, formData: FormData) => handleFormAction(formData, PersonnelSchema.omit({ id: true }), 'personnel', '/admin/personnel', 'create');
export const deletePersonnel = (formData: FormData) => deleteItem(formData, 'personnel', '/admin/personnel');
export const createMeeting = (prevState: FormState, formData: FormData) => handleFormAction(formData, MeetingSchema.omit({ id: true }), 'meetings', '/admin/meetings', 'create');
export const deleteMeeting = (formData: FormData) => deleteItem(formData, 'meetings', '/admin/meetings');
export const createMotion = (prevState: FormState, formData: FormData) => handleFormAction(formData, MotionSchema.omit({ id: true }), 'motions', '/admin/motions', 'create');
export const deleteMotion = (formData: FormData) => deleteItem(formData, 'motions', '/admin/motions');
async function deleteItem(formData: FormData, tableName: string, revalidatePathUrl: string) {
    const supabase = createClient();
    const id = formData.get('id')?.toString();
    if (!id) throw new Error('ID is required for deletion');
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(`Database Error: ${error.message}`);
    revalidatePath(revalidatePathUrl);
    return { success: true, message: 'ลบข้อมูลสำเร็จ' };
}
export async function updateMotionResult(motionId: string, result: 'ผ่าน' | 'ไม่ผ่าน' | 'รอลงมติ') {
  'use server';
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('motions')
      .update({ result: result })
      .eq('id', motionId);
    if (error) throw error;
    revalidatePath('/admin/motions');
    revalidatePath(`/admin/motions/${motionId}/edit`);
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
    .map(([key, status]) => {
      const personnel_id = key.replace('status-', '');
      return {
        meeting_id: meetingId,
        personnel_id: personnel_id,
        status: status as string,
      };
    });
  if (recordsToUpsert.length === 0) {
    return { success: false, message: 'ไม่พบข้อมูลการเข้าประชุมที่จะบันทึก' };
  }
  try {
    const { error } = await supabase
      .from('attendance_records')
      .upsert(recordsToUpsert, { onConflict: 'meeting_id, personnel_id' });
    if (error) throw error;
    revalidatePath(`/admin/meetings/${meetingId}/edit`);
    return { success: true, message: 'บันทึกข้อมูลการเข้าประชุมสำเร็จ!' };
  } catch (e: any) {
    return { success: false, message: `Database Error: ${e.message}` };
  }
}
