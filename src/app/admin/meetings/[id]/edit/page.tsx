// src/app/admin/meetings/[id]/edit/page.tsx
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditMeetingForm from './EditMeetingForm';
import type { Meeting, MeetingFile } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditMeetingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // ดึงข้อมูลการประชุมและไฟล์แนบทั้งหมดบน Server Component
  const [meetingResult, filesResult] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).single(),
    supabase.from('meeting_files').select('*').eq('meeting_id', id)
  ]);

  const { data: meeting, error: meetingError } = meetingResult;
  const { data: files, error: filesError } = filesResult;

  // ถ้าไม่พบข้อมูลการประชุมหลัก ให้แสดงหน้า 404 Not Found
  if (meetingError || !meeting) {
    notFound();
  }

  // หากดึงไฟล์ไม่สำเร็จ ให้แสดง log แต่ยังคงทำงานต่อไปได้
  if (filesError) {
      console.error("Error fetching meeting files:", filesError.message);
  }
  
  // ส่งข้อมูลที่ดึงได้ทั้งหมดไปยัง Client Component (EditMeetingForm) เป็น props
  return <EditMeetingForm meeting={meeting as Meeting} initialFiles={files || []} />;
}
