// src/app/admin/motions/[id]/edit/EditMotionForm.tsx
// This is the Client Component, responsible for UI and user interaction.

'use client';

import { updateMotionResult } from '@/lib/actions'; // This action is now robust
import type { Motion } from '@/lib/definitions';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditMotionForm({ motion }: { motion: Motion }) {

  const handleUpdateResult = async (result: 'ผ่าน' | 'ไม่ผ่าน' | 'รอลงมติ') => {
    const response = await updateMotionResult(motion.id, result);
    if (response.success) {
        toast.success(response.message || 'อัปเดตสำเร็จ!');
        // No need to router.refresh() as revalidatePath in the action handles it
    } else {
        toast.error(response.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <>
      <h1 className="mb-4">แก้ไขญัตติ: {motion.title}</h1>
      <div className="card shadow-sm p-4">
        {/* This form can be used in the future to edit title/details */}
        <form>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อญัตติ</label>
            <input
              id="title"
              type="text"
              className="form-control"
              defaultValue={motion.title}
              readOnly // For now, it's read-only
            />
          </div>
          <div className="mb-3">
            <label htmlFor="details" className="form-label">รายละเอียด</label>
            <textarea
              id="details"
              className="form-control"
              rows={4}
              defaultValue={motion.details || ''}
              readOnly // For now, it's read-only
            ></textarea>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-4 mt-4">
        <h5 className="mb-3">สรุปผลการลงมติ</h5>
        <p>ผลปัจจุบัน: <span className="fw-bold">{motion.result || 'รอลงมติ'}</span></p>
        <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" onClick={() => handleUpdateResult('รอลงมติ')}>ตั้งเป็น "รอลงมติ"</button>
            <button className="btn btn-danger" onClick={() => handleUpdateResult('ไม่ผ่าน')}>ยืนยันผล: "ไม่ผ่าน"</button>
            <button className="btn btn-success" onClick={() => handleUpdateResult('ผ่าน')}>ยืนยันผล: "ผ่าน"</button>
        </div>
      </div>
       <div className="mt-4">
          <Link href="/admin/motions" className="btn btn-secondary">กลับไปหน้ารายการ</Link>
      </div>
    </>
  );
}
