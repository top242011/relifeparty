// src/app/admin/meetings/[id]/edit/EditMeetingForm.tsx
'use client';

import { useState, useTransition } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import type { Meeting, MeetingFile, AttendanceRecordWithPersonnel } from '@/lib/definitions';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { updateAttendance } from '@/lib/actions';

// 1. อัปเดต Interface ให้รับ prop ที่จำเป็นทั้งหมด
interface EditMeetingFormProps {
    meeting: Meeting;
    initialFiles: MeetingFile[]; // (สำหรับฟีเจอร์ไฟล์แนบในอนาคต)
    initialAttendance: AttendanceRecordWithPersonnel[]; 
};

export default function EditMeetingForm({ meeting, initialFiles, initialAttendance }: EditMeetingFormProps): JSX.Element {
    const [isPending, startTransition] = useTransition();
    
    // 2. ใช้ initialAttendance ที่ได้รับมาเป็นค่าเริ่มต้นของ State
    const [attendance, setAttendance] = useState(initialAttendance);

    // ฟังก์ชันสำหรับอัปเดตสถานะใน UI ทันทีเมื่อผู้ใช้เลือก
    const handleStatusChange = (personnelId: string, newStatus: string) => {
        setAttendance(currentAttendance => 
            currentAttendance.map(record => 
                record.personnel_id === personnelId ? { ...record, status: newStatus as any } : record
            )
        );
    };

    // ฟังก์ชันสำหรับส่งข้อมูลฟอร์มไปให้ Server Action
    const handleAttendanceSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateAttendance(meeting.id, formData);
            if (result.success) {
                toast.success(result.message || 'บันทึกสำเร็จ!');
            } else {
                toast.error(result.message || 'เกิดข้อผิดพลาด');
            }
        });
    };

    return (
        <div className="container py-4">
            <h1 className="mb-4">บันทึกผลการประชุม: {meeting.topic}</h1>
            <p className="text-muted">วันที่: {new Date(meeting.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
            
            {/* 3. สร้างฟอร์มสำหรับบันทึกการเข้าประชุม */}
            <form action={handleAttendanceSubmit}>
                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">บันทึกการเข้าประชุม</h5>
                        <button type="submit" className="btn btn-primary" disabled={isPending}>
                            {isPending ? 'กำลังบันทึก...' : 'บันทึกการเข้าประชุม'}
                        </button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ชื่อ-นามสกุล</th>
                                        <th>ศูนย์</th>
                                        <th style={{width: '200px'}}>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record.personnel_id}>
                                            <td>{record.personnel.name}</td>
                                            <td>{record.personnel.campus}</td>
                                            <td>
                                                <select
                                                    name={`status-${record.personnel_id}`}
                                                    className="form-select"
                                                    value={record.status}
                                                    onChange={(e) => handleStatusChange(record.personnel_id, e.target.value)}
                                                >
                                                    <option value="เข้าประชุม">เข้าประชุม</option>
                                                    <option value="ลา">ลา</option>
                                                    <option value="ขาด">ขาด</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>

            <div className="mt-4">
                <Link href="/admin/meetings" className="btn btn-secondary">กลับไปหน้ารายการ</Link>
            </div>
        </div>
    );
}
