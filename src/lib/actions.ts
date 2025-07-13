// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState } from './definitions';

// --- Helper ---
const getSupabase = () => createClient();

// --- Zod Schemas ---
const BaseSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
});

const PolicySchema = BaseSchema.extend({
  title: z.string().min(1, 'กรุณากรอกชื่อนโยบาย'),
});

const CommitteeSchema = BaseSchema.extend({
  name: z.string().min(1, 'กรุณากรอกชื่อคณะกรรมาธิการ'),
});

const EventSchema = BaseSchema.extend({
  title: z.string().min(1, 'กรุณากรอกชื่อกิจกรรม'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด'),
  eventDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  location: z.string().optional(),
});

const NewsSchema = BaseSchema.extend({
    title: z.string().min(1, 'กรุณากรอกหัวข้อข่าว'),
    content: z.string().min(1, 'กรุณากรอกเนื้อหาข่าว'),
    publishDate: z.string().min(1, 'กรุณาเลือกวันที่เผยแพร่'),
    imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')),
});

const PersonnelSchema = BaseSchema.extend({
    name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
    position: z.string().min(1, 'กรุณากรอกตำแหน่ง'),
    bio: z.string().optional(),
    image_url: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')),
    is_active: z.boolean(),
    role: z.string(),
    campus: z.string(),
});

const MeetingSchema = BaseSchema.extend({
    topic: z.string().min(1, 'กรุณากรอกหัวข้อการประชุม'),
    date: z.string().min(1, 'กรุณาเลือกวันที่ประชุม'),
    scope: z.string(),
});

const MotionSchema = BaseSchema.extend({
    title: z.string().min(1, 'กรุณากรอกชื่อญัตติ'),
    details: z.string().optional(),
    meeting_id: z.string().optional().nullable(),
    proposer_id: z.string().optional().nullable(),
});


// --- Generic Create/Update/Delete Functions ---

async function handleFormAction<T extends z.ZodType<any, any>>(
    formData: FormData,
    schema: T,
    tableName: string,
    redirectPath: string,
    action: 'create' | 'update'
): Promise<FormState> {
    const supabase = getSupabase();
    const rawFormData = Object.fromEntries(formData.entries());
    const dataToValidate: { [key: string]: any } = { ...rawFormData };

    if (tableName === 'personnel') {
        dataToValidate.is_active = rawFormData.is_active === 'on';
    }

    const validatedFields = schema.safeParse(dataToValidate);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบ' };
    }

    const { id, ...data } = validatedFields.data;

    try {
        let error;
        if (action === 'create') {
            ({ error } = await supabase.from(tableName).insert(data));
        } else {
            if (!id) return { message: 'ไม่พบ ID สำหรับการอัปเดต' };
            ({ error } = await supabase.from(tableName).update(data).eq('id', id));
        }
        if (error) throw error;
    } catch (e: any) {
        return { message: `Database Error: ${e.message}` };
    }

    revalidatePath(redirectPath);
    if (action === 'update' && id) {
        revalidatePath(`${redirectPath}/${id}/edit`);
    }
    redirect(redirectPath);
}

async function deleteItem(formData: FormData, tableName: string, revalidatePathUrl: string) {
    const supabase = getSupabase();
    const id = formData.get('id')?.toString();
    if (!id) throw new Error('ID is required for deletion');
    
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(`Database Error: ${error.message}`);
    
    revalidatePath(revalidatePathUrl);
    return { success: true };
}


// --- Exported Server Actions ---

export const createPolicy = (prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema.omit({ id: true }), 'policies', '/admin/policies', 'create');
export const updatePolicy = (prevState: FormState, formData: FormData) => handleFormAction(formData, PolicySchema, 'policies', '/admin/policies', 'update');
export const deletePolicy = (formData: FormData) => deleteItem(formData, 'policies', '/admin/policies');

export const createCommittee = (prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema.omit({ id: true }), 'committees', '/admin/committees', 'create');
export const updateCommittee = (prevState: FormState, formData: FormData) => handleFormAction(formData, CommitteeSchema, 'committees', '/admin/committees', 'update');
export const deleteCommittee = (formData: FormData) => deleteItem(formData, 'committees', '/admin/committees');

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

// --- โค้ดที่เพิ่มเข้ามาสำหรับระบบลงมติ ---

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
