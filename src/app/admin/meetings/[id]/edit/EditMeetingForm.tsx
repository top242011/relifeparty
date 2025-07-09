'use client';

import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../../utils/supabase/client';

// Define types for data structures
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

// Define props for the form component
type EditMeetingFormProps = {
    initialMeeting: Meeting;
    initialFiles: MeetingFile[];
};

export default function EditMeetingForm({ initialMeeting, initialFiles }: EditMeetingFormProps): JSX.Element {
    const supabase = createClient();
    const router = useRouter();
    
    // Initialize state with the data passed from the server component
    const [title, setTitle] = useState(initialMeeting.title);
    const [date, setDate] = useState(initialMeeting.date);
    const [description, setDescription] = useState(initialMeeting.description);
    const [files, setFiles] = useState<MeetingFile[]>(initialFiles);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

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

        const { error: meetingError } = await supabase
            .from('meetings')
            .update({ title, date, description })
            .eq('id', initialMeeting.id);

        if (meetingError) {
            console.error('Error updating meeting:', meetingError);
            alert('Failed to update meeting.');
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
            const filePath = `meetings/${initialMeeting.id}/${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('meeting-files')
                .upload(filePath, file, { upsert: true }); // Use upsert to overwrite if needed

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
            try {
                const uploadedFileUrls = await Promise.all(
                    filesToUpload.map(handleFileUpload)
                );

                const newFiles = uploadedFileUrls.map((url, index) => ({
                    meeting_id: initialMeeting.id,
                    file_name: filesToUpload[index].name,
                    file_url: url,
                }));

                const { error: insertError } = await supabase
                    .from('meeting_files')
                    .insert(newFiles);
                
                if (insertError) throw insertError;

            } catch (error) {
                console.error('Error during file upload process:', error);
                alert('An error occurred during file upload.');
                return;
            }
        }

        // Refresh the page to see changes
        router.push('/admin/meetings');
        router.refresh();
    };

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
