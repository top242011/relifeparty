// src/app/admin/meetings/[id]/edit/EditMeetingForm.tsx
'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../../utils/supabase/client';
import type { Meeting, MeetingFile } from '@/lib/definitions';
import Link from 'next/link';

// กำหนด Props ที่จะรับจาก Server Component
interface EditMeetingFormProps {
    meeting: Meeting;
    initialFiles: MeetingFile[];
};

export default function EditMeetingForm({ meeting, initialFiles }: EditMeetingFormProps): JSX.Element {
    const supabase = createClient();
    const router = useRouter();
    
    // State สำหรับจัดการฟอร์ม ใช้ข้อมูลที่ได้รับจาก props เป็นค่าเริ่มต้น
    const [topic, setTopic] = useState(meeting.topic);
    const [date, setDate] = useState(new Date(meeting.date).toISOString().split('T')[0]);
    const [description, setDescription] = useState(meeting.description || '');
    const [files, setFiles] = useState<MeetingFile[]>(initialFiles);
    
    // State สำหรับจัดการไฟล์
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFilesToUpload(Array.from(e.target.files));
        }
    };

    const removeExistingFile = (fileId: string) => {
        setFiles(files.filter(f => f.id !== fileId));
        setFilesToRemove([...filesToRemove, fileId]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const { error: meetingError } = await supabase
            .from('meetings')
            .update({ topic, date, description })
            .eq('id', meeting.id);

        if (meetingError) {
            setMessage('แก้ไขข้อมูลการประชุมไม่สำเร็จ: ' + meetingError.message);
            setSaving(false);
            return;
        }

        if (filesToRemove.length > 0) {
            await supabase.from('meeting_files').delete().in('id', filesToRemove);
        }

        if (filesToUpload.length > 0) {
            for (const file of filesToUpload) {
                const filePath = `meetings/${meeting.id}/${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('meeting-files')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) {
                    setMessage(`อัปโหลดไฟล์ ${file.name} ไม่สำเร็จ`);
                    continue;
                }

                const { data: urlData } = supabase.storage.from('meeting-files').getPublicUrl(filePath);
                await supabase.from('meeting_files').insert({
                    meeting_id: meeting.id,
                    file_name: file.name,
                    file_url: urlData.publicUrl,
                });
            }
        }
        
        setMessage('อัปเดตข้อมูลการประชุมสำเร็จ!');
        router.push('/admin/meetings');
        router.refresh();
        setSaving(false);
    };

    return (
        <div className="container py-4">
            <h1 className="mb-4">บันทึกผลการประชุม</h1>
            <form onSubmit={handleSubmit} className="card shadow-sm p-4">
                <div className="mb-3">
                    <label className="form-label">หัวข้อการประชุม</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="form-control" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">วันที่</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">รายละเอียดเพิ่มเติม/สรุปการประชุม</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" rows={5} />
                </div>
                <div className="mb-4">
                    <label className="form-label">ไฟล์แนบ</label>
                    <div className="mb-2">
                        {files.length > 0 ? (
                            files.map(file => (
                                <div key={file.id} className="d-flex align-items-center justify-content-between p-2 border rounded mb-1">
                                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">{file.file_name}</a>
                                    <button type="button" onClick={() => removeExistingFile(file.id)} className="btn btn-danger btn-sm">ลบ</button>
                                </div>
                            ))
                        ) : <p className="text-muted">ไม่มีไฟล์แนบ</p>}
                    </div>
                    <input type="file" multiple onChange={handleFileChange} className="form-control" />
                </div>
                
                {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Link href="/admin/meetings" className="btn btn-secondary">ยกเลิก</Link>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
            </form>
        </div>
    );
}
