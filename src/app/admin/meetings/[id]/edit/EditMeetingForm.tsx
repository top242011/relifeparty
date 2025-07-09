// src/app/admin/meetings/[id]/edit/EditMeetingForm.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../../utils/supabase/client';

// Define types for data structures
type Meeting = {
    id: string;
    topic: string; // Changed from title to topic to match table
    date: string;
    description: string | null; // Can be null
};

type MeetingFile = {
    id: string;
    meeting_id: string;
    file_name: string;
    file_url: string;
};

// Define props for the form component, now it only needs the ID.
type EditMeetingFormProps = {
    meetingId: string;
};

export default function EditMeetingForm({ meetingId }: EditMeetingFormProps): JSX.Element {
    const supabase = createClient();
    const router = useRouter();
    
    // State for the form fields
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [files, setFiles] = useState<MeetingFile[]>([]);
    
    // State for managing UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for file handling
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

    // Use useCallback to memoize the data fetching function
    const fetchMeetingData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch meeting details
            const { data: meetingData, error: meetingError } = await supabase
                .from('meetings')
                .select('*')
                .eq('id', meetingId)
                .single();

            if (meetingError) throw meetingError;
            setMeeting(meetingData);

            // Fetch associated files
            const { data: filesData, error: filesError } = await supabase
                .from('meeting_files')
                .select('*')
                .eq('meeting_id', meetingId);

            if (filesError) throw filesError;
            setFiles(filesData || []);

        } catch (err) { // FIX: Changed type from 'any' to 'unknown' for type safety
            console.error("Failed to fetch meeting data:", err);
            // FIX: Add type guard to safely access error properties
            if (err instanceof Error) {
                setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
            } else {
                setError('เกิดข้อผิดพลาดที่ไม่รู้จักขณะโหลดข้อมูล');
            }
        } finally {
            setLoading(false);
        }
    }, [meetingId, supabase]);

    // Fetch data when the component mounts
    useEffect(() => {
        fetchMeetingData();
    }, [fetchMeetingData]);

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
        if (!meeting) return;

        // 1. Update meeting details
        const { error: meetingError } = await supabase
            .from('meetings')
            .update({ topic: meeting.topic, date: meeting.date, description: meeting.description })
            .eq('id', meeting.id);

        if (meetingError) {
            alert('Failed to update meeting.');
            return;
        }

        // 2. Remove files marked for deletion
        if (filesToRemove.length > 0) {
            await supabase.from('meeting_files').delete().in('id', filesToRemove);
        }

        // 3. Upload new files
        if (filesToUpload.length > 0) {
            for (const file of filesToUpload) {
                const filePath = `meetings/${meeting.id}/${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('meeting-files')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    alert(`Failed to upload ${file.name}.`);
                    continue; // Continue to next file
                }

                const { data: urlData } = supabase.storage.from('meeting-files').getPublicUrl(filePath);
                await supabase.from('meeting_files').insert({
                    meeting_id: meeting.id,
                    file_name: file.name,
                    file_url: urlData.publicUrl,
                });
            }
        }
        
        alert('อัปเดตข้อมูลการประชุมสำเร็จ!');
        router.push('/admin/meetings');
        router.refresh();
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูลการประชุม...</p></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }
    
    if (!meeting) {
        return <div className="alert alert-warning">ไม่พบข้อมูลการประชุม</div>;
    }

    return (
        <div className="container p-4 mx-auto">
            <h1 className="mb-4 text-2xl font-bold">แก้ไขข้อมูลการประชุม</h1>
            <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">หัวข้อการประชุม</label>
                    <input
                        type="text"
                        value={meeting.topic}
                        onChange={(e) => setMeeting({ ...meeting, topic: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">วันที่</label>
                    <input
                        type="date"
                        value={new Date(meeting.date).toISOString().split('T')[0]}
                        onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">รายละเอียดเพิ่มเติม</label>
                    <textarea
                        value={meeting.description || ''}
                        onChange={(e) => setMeeting({ ...meeting, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">ไฟล์แนบ</label>
                    <div className="mb-2">
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between py-1">
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{file.file_name}</a>
                                <button type="button" onClick={() => removeExistingFile(file.id)} className="px-2 py-1 text-sm text-white bg-red-500 rounded">ลบ</button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full file-input file-input-bordered"
                    />
                </div>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                    บันทึกการเปลี่ยนแปลง
                </button>
            </form>
        </div>
    );
}
