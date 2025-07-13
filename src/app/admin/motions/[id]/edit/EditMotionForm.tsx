// src/app/admin/motions/[id]/edit/EditMotionForm.tsx
'use client';

import { useState } from 'react';
import type { Motion } from '@/lib/definitions';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EditMotionFormProps {
  motion: Motion;
  // หากต้องการส่งข้อมูลผู้ลงคะแนนมาด้วย ก็เพิ่ม props ที่นี่
}

export default function EditMotionForm({ motion }: EditMotionFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState(motion.title);
  const [details, setDetails] = useState(motion.details || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('motions')
      .update({ title, details })
      .eq('id', motion.id);

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } else {
      setMessage('บันทึกข้อมูลสำเร็จ!');
      router.push('/admin/motions');
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">แก้ไขญัตติ</h1>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">ชื่อญัตติ</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="details" className="form-label">รายละเอียด</label>
          <textarea
            id="details"
            className="form-control"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          ></textarea>
        </div>

        {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link href="/admin/motions" className="btn btn-secondary">ยกเลิก</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
      {/* ส่วนของการบันทึกผลโหวต สามารถเพิ่มเข้ามาตรงนี้ได้ในอนาคต */}
    </div>
  );
}
