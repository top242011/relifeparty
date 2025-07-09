'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

// Define types for better readability and type safety
type Meeting = {
    id: string;
    title: string;
    date: string;
    description: string;
};

type MeetingFile = {
    id: string;
    meeting_id: string;
    file_name: string;
    file_url: string;
};

// FIX: Defined a specific type for the page's props to resolve the build error.
type EditMeetingPageProps = {
    params: { id: string };
};

export default function EditMeetingPage({ params }: EditMeetingPageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<MeetingFile[]>([]);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

    useEffect(() => {
        const fetchMeeting = async () => {
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .eq('id', params.id)
                .single();

            if (data) {
                setMeeting(data);
                setTitle(data.title);
                setDate(data.date);
                setDescription(data.description);

                const { data: filesData, error: filesError } = await supabase
                    .from('meeting_files')
                    .select('*')
                    .eq('meeting_id', params.id);
                
                if (filesData) {
                    setFiles(filesData);
                }
            }
        };
        fetchMeeting();
    }, [params.id, supabase]);

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

        const { data: meetingData, error: meetingError } = await supabase
            .from('meetings')
            .update({ title, date, description })
            .eq('id', params.id)
            .select()
            .single();

        if (meetingError) {
            console.error('Error updating meeting:', meetingError);
            return;
        }

        if (filesToRemove.length > 0) {
            const { error: deleteError } = await supabase
                .from('meeting_files')
                .delete()
                .in('id', filesToRemove);
            if (deleteError) console.error('Error deleting files:', deleteError);
        }

        const handleFileUpload = async (file: File): Promise<string> => {
            const filePath = `meetings/${params.id}/${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('meeting-files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('meeting-files')
                .getPublicUrl(filePath);
            
            return urlData.publicUrl;
        };

        if (filesToUpload.length > 0) {
            const uploadedFileUrls = await Promise.all(
                filesToUpload.map(handleFileUpload)
            );

            const newFiles = uploadedFileUrls.map((url, index) => ({
                meeting_id: params.id,
                file_name: filesToUpload[index].name,
                file_url: url,
            }));

            const { error: insertError } = await supabase
                .from('meeting_files')
                .insert(newFiles);
            
            if (insertError) console.error('Error inserting new files:', insertError);
        }

        router.push('/admin/meetings');
        router.refresh();
    };

    if (!meeting) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container p-4 mx-auto">
            <h1 className="mb-4 text-2xl font-bold">Edit Meeting</h1>
            <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Files</label>
                    <div className="mb-2">
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between py-1">
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{file.file_name}</a>
                                <button type="button" onClick={() => removeExistingFile(file.id)} className="px-2 py-1 text-white bg-red-500 rounded">Remove</button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
                    Update Meeting
                </button>
            </form>
        </div>
    );
}
