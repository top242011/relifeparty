// src/lib/actions.ts

'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState } from './definitions';

// Supabase Client สำหรับ Server-side
const createSupabaseServerClient = () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookies().get(name)?.value;
                },
            },
        }
    );
}

// กำหนด Schema สำหรับตรวจสอบข้อมูลนโยบายด้วย Zod
const PolicySchema = z.object({
  id: z.string(),
  // แก้ไข: รวมการตรวจสอบว่าเป็น string และไม่ว่างไว้ใน .min()
  // และใช้ข้อความ error ที่ชัดเจนและตรงประเด็น
  title: z.string().min(1, { message: 'กรุณากรอกชื่อนโยบาย' }),
  description: z.string().optional(),
});

const CreatePolicySchema = PolicySchema.omit({ id: true });
const UpdatePolicySchema = PolicySchema;


// --- Policy Actions ---

export async function createPolicy(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createSupabaseServerClient();

  const validatedFields = CreatePolicySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
    };
  }

  try {
    const { error } = await supabase.from('policies').insert(validatedFields.data);
    if (error) throw new Error(error.message);
  } catch (e: any) {
    return { message: `Database Error: ไม่สามารถสร้างนโยบายได้. ${e.message}` };
  }

  revalidatePath('/admin/policies');
  redirect('/admin/policies');
}

export async function updatePolicy(prevState: FormState, formData: FormData): Promise<FormState> {
    const supabase = createSupabaseServerClient();

    const validatedFields = UpdatePolicySchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
        };
    }

    const { id, ...dataToUpdate } = validatedFields.data;

    try {
        const { error } = await supabase
            .from('policies')
            .update(dataToUpdate)
            .eq('id', id);

        if (error) throw new Error(error.message);
    } catch (e: any) {
        return { message: `Database Error: ไม่สามารถอัปเดตนโยบายได้. ${e.message}` };
    }

    revalidatePath('/admin/policies');
    revalidatePath(`/admin/policies/${id}/edit`);
    redirect('/admin/policies');
}

export async function deletePolicy(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
      throw new Error('ID is required for deletion');
    }
    
    try {
        const { error } = await supabase.from('policies').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบนโยบายได้ (${error.message})`);
        }
        revalidatePath('/admin/policies');
        return { success: true };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

/**
 * Server Action สำหรับลบคณะกรรมาธิการ (Committee)
 */
export async function deleteCommittee(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        const { error } = await supabase.from('committees').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบข้อมูลได้ (${error.message})`);
        }
        revalidatePath('/admin/committees'); // สั่งให้หน้า committees โหลดข้อมูลใหม่
        return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---

/**
 * Server Action สำหรับลบกิจกรรม (Event)
 */
export async function deleteEvent(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        // เปลี่ยน 'committees' เป็น 'events'
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบกิจกรรมได้ (${error.message})`);
        }
        revalidatePath('/admin/events'); // สั่งให้หน้า events โหลดข้อมูลใหม่
        return { success: true, message: 'ลบกิจกรรมสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---

/**
 * Server Action สำหรับลบการประชุม (Meeting)
 */
export async function deleteMeeting(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        // เปลี่ยน table name เป็น 'meetings'
        const { error } = await supabase.from('meetings').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบการประชุมได้ (${error.message})`);
        }
        revalidatePath('/admin/meetings'); // สั่งให้หน้า meetings โหลดข้อมูลใหม่
        return { success: true, message: 'ลบการประชุมสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---

/**
 * Server Action สำหรับลบญัตติ (Motion)
 */
export async function deleteMotion(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        // เปลี่ยน table name เป็น 'motions'
        const { error } = await supabase.from('motions').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบญัตติได้ (${error.message})`);
        }
        revalidatePath('/admin/motions'); // สั่งให้หน้า motions โหลดข้อมูลใหม่
        return { success: true, message: 'ลบญัตติสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---

/**
 * Server Action สำหรับลบข่าว (News)
 */
export async function deleteNews(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        // เปลี่ยน table name เป็น 'news'
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบข่าวได้ (${error.message})`);
        }
        revalidatePath('/admin/news'); // สั่งให้หน้า news โหลดข้อมูลใหม่
        return { success: true, message: 'ลบข่าวสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---

/**
 * Server Action สำหรับลบบุคลากร (Personnel)
 * หมายเหตุ: โค้ดนี้จะลบแค่ข้อมูลในตาราง แต่ยังไม่ได้ลบไฟล์รูปภาพใน Storage
 * หากต้องการลบรูปภาพด้วย จะต้องเพิ่ม logic ในการเรียกใช้ storage API
 */
export async function deletePersonnel(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const id = formData.get('id')?.toString();

    if (!id) {
        throw new Error('ID is required for deletion');
    }
    
    try {
        // เปลี่ยน table name เป็น 'personnel'
        const { error } = await supabase.from('personnel').delete().eq('id', id);
        if (error) {
            throw new Error(`Database Error: ไม่สามารถลบบุคลากรได้ (${error.message})`);
        }
        revalidatePath('/admin/personnel'); // สั่งให้หน้า personnel โหลดข้อมูลใหม่
        return { success: true, message: 'ลบบุคลากรสำเร็จ' };
    } catch (e) {
        console.error(e);
        throw new Error('Server Error: เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}
// --- END: โค้ดที่เพิ่มเข้ามา ---