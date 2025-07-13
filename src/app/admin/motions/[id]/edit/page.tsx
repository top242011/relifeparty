// src/app/admin/motions/[id]/edit/page.tsx
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditMotionForm from './EditMotionForm';
import type { Motion } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditMotionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // ดึงข้อมูลญัตติรายการเดียวบน Server Component
  const { data: motion, error } = await supabase
    .from('motions')
    .select('*')
    .eq('id', id)
    .single();

  // ถ้าเกิด error หรือไม่พบข้อมูล ให้แสดงหน้า 404
  if (error || !motion) {
    notFound();
  }
  
  // ส่งข้อมูลที่ดึงได้ไปยัง Client Component
  return <EditMotionForm motion={motion as Motion} />;
}
