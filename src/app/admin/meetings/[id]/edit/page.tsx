// src/app/admin/meetings/[id]/edit/page.tsx
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditMeetingForm from './EditMeetingForm';
import { fetchAttendanceData } from '@/lib/data'; // 1. Import ฟังก์ชันใหม่
import type { Meeting, MeetingFile, AttendanceRecordWithPersonnel } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditMeetingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // 2. ดึงข้อมูลทั้งหมดพร้อมกัน (การประชุม, ไฟล์, และการเข้าประชุม)
  const [meetingResult, filesResult, attendanceResult] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).single(),
    supabase.from('meeting_files').select('*').eq('meeting_id', id),
    fetchAttendanceData(id) // 3. เรียกใช้ฟังก์ชันดึงข้อมูลการเข้าประชุม
  ]);

  const { data: meeting, error: meetingError } = meetingResult;
  const { data: files, error: filesError } = filesResult;

  if (meetingError || !meeting) {
    notFound();
  }
  if (filesError) {
      console.error("Error fetching meeting files:", filesError.message);
  }
  
  // 4. ส่งข้อมูลทั้งหมด รวมถึง initialAttendance ไปให้ Client Component
  return (
    <EditMeetingForm 
      meeting={meeting as Meeting} 
      initialFiles={files || []}
      initialAttendance={attendanceResult || []}
    />
  );
}
