// src/app/admin/personnel/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Select, { MultiValue } from 'react-select';
import Image from 'next/image';
import Link from 'next/link'; // Import Link

// --- Type Definitions ---
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

export default function EditPersonnelPage({ params }: { params: { id: string } }): JSX.Element {
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
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: personnelData, error: personnelError } = await supabase
                .from('personnel')
                .select('*')
                .eq('id', params.id)
                .single();

            if (personnelError) {
                console.error('Error fetching personnel:', personnelError);
                setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร');
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
        setSaving(true);
        setMessage('');

        let imageUrl = personnel.image_url;

        if (file) {
            try {
                imageUrl = await handleFileUpload(file);
            } catch(error) {
                setMessage('อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
                setSaving(false);
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
            setMessage('แก้ไขข้อมูลไม่สำเร็จ: ' + error.message);
        } else {
            setMessage('แก้ไขข้อมูลสำเร็จ!');
            router.push('/admin/personnel');
            router.refresh();
        }
        setSaving(false);
    };

    if (loading) {
        return <p>กำลังโหลดข้อมูล...</p>;
    }

    if (!personnel) {
        return <div className="alert alert-danger">ไม่พบข้อมูลบุคลากร</div>
    }

    const committeeOptions: SelectOption[] = committees.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="container py-4">
            <h1 className="mb-4">แก้ไขข้อมูลบุคลากร</h1>
            <div className="card shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="form-control" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="position" className="form-label">ตำแหน่ง</label>
                            <input type="text" id="position" value={position} onChange={(e) => setPosition(e.target.value)} className="form-control" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="bio" className="form-label">ประวัติ</label>
                            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="form-control" rows={4} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="committees" className="form-label">สังกัดคณะกรรมาธิการ</label>
                            <Select
                                id="committees"
                                isMulti
                                options={committeeOptions}
                                value={selectedCommittees}
                                onChange={setSelectedCommittees}
                                classNamePrefix="select" // Use this for easier styling if needed
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="form-label">รูปภาพ</label>
                            {personnel.image_url && 
                                <div className="mb-3">
                                    <Image src={personnel.image_url} alt={name} width={128} height={128} className="rounded" style={{objectFit: 'cover'}} />
                                </div>
                            }
                            <input type="file" id="image" onChange={handleFileChange} className="form-control" />
                        </div>

                        {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
