// src/app/admin/committees/create/page.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createCommittee } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateCommitteePage() {
  const router = useRouter();
  const initialState: FormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useFormState(createCommittee, initialState);

  useEffect(() => {
    if (state.success) {
      // Server Action จะจัดการ redirect เองเมื่อสร้างสำเร็จ
      // เราแค่แสดง toast ที่นี่
      toast.success(state.message || 'สร้างข้อมูลสำเร็จ!');
    } else if (state.message) {
      // แสดง error toast ถ้ามีข้อความผิดพลาดจาก server
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <>
      <h1 className="mb-4">เพิ่มคณะกรรมาธิการใหม่</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">ชื่อคณะกรรมาธิการ</label>
            <input 
                type="text" 
                className={`form-control ${state.errors?.name ? 'is-invalid' : ''}`}
                id="name" 
                name="name" 
                required 
            />
            <div id="name-error" aria-live="polite" aria-atomic="true">
                {state.errors?.name && state.errors.name.map((error: string) => (
                    <p className="mt-2 text-sm text-danger" key={error}>{error}</p>
                ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">คำอธิบายหน้าที่</label>
            <textarea 
                className="form-control" 
                id="description" 
                name="description"
                rows={3}
            ></textarea>
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/committees" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกข้อมูล" />
          </div>
        </form>
      </div>
    </>
  );
}
