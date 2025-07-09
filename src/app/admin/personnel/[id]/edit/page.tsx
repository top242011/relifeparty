'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Select, { MultiValue } from 'react-select';

interface SelectOption {
  value: string;
  label: string;
}

type Personnel = {
    id: string;
    name: string;
    position: string;
    bio: string;
    image_url: string;
    committees: string[];
};

type Committee = {
    id: string;
    name: string;
};

// FIX: Aligned the props type with Next.js's expected PageProps structure.
type PageProps = {
    params: { id: string };
};

export default function EditPersonnelPage({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [personnel, setPersonnel] = useState<Personnel | null>(null);
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [selectedCommittees, setSelectedCommittees] = useState<MultiValue<SelectOption>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: personnelData, error: personnelError } = await supabase
                .from('personnel')
                .select('*')
                .eq('id', params.id)
                .single();

            if (personnelError) {
                console.error('Error fetching personnel:', personnelError);
            } else if (personnelData) {
                setPersonnel(personnelData);
                setName(personnelData.name);
                setPosition(personnelData.position);
                setBio(personnelData.bio);
            }

            const { data: committeesData, error: committeesError } = await supabase
                .from('committees')
                .select('id, name');

            if (committeesError) {
                console.error('Error fetching committees:', committeesError);
            } else if (committeesData) {
                setCommittees(committeesData);
                if (personnelData?.committees) {
                    const initialSelected = committeesData
                        .filter(c => personnelData.committees.includes(c.id))
                        .map(c => ({ value: c.id, label: c.name }));
                    setSelectedCommittees(initialSelected);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [params.id, supabase]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async (fileToUpload: File): Promise<string> => {
        const filePath = `personnel/${Date.now()}_${fileToUpload.name}`;
        const { error } = await supabase.storage
            .from('personnel-images')
            .upload(filePath, fileToUpload);
        
        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        const { data } = supabase.storage.from('personnel-images').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!personnel) return;

        let imageUrl = personnel.image_url;

        if (file) {
            try {
                imageUrl = await handleFileUpload(file);
            } catch(e) {
                alert('Image upload failed');
                return;
            }
        }

        const { error } = await supabase
            .from('personnel')
            .update({
                name,
                position,
                bio,
                image_url: imageUrl,
                committees: selectedCommittees.map((c: SelectOption) => c.value),
            })
            .eq('id', params.id);

        if (error) {
            console.error('Error updating personnel:', error);
            alert('Failed to update personnel: ' + error.message);
        } else {
            router.push('/admin/personnel');
            router.refresh();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!personnel) return <div>Personnel not found.</div>;

    const committeeOptions: SelectOption[] = committees.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="container p-4 mx-auto">
            <h1 className="mb-4 text-2xl font-bold">Edit Personnel</h1>
            <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full input input-bordered" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Position</label>
                    <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full input input-bordered" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full textarea textarea-bordered" />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Committees</label>
                    <Select
                        isMulti
                        options={committeeOptions}
                        value={selectedCommittees}
                        onChange={setSelectedCommittees}
                        className="w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Image</label>
                    {personnel.image_url && <img src={personnel.image_url} alt={name} className="w-32 h-32 mb-4" />}
                    <input type="file" onChange={handleFileChange} className="w-full file-input file-input-bordered" />
                </div>
                <button type="submit" className="btn btn-primary">Update Personnel</button>
            </form>
        </div>
    );
}
