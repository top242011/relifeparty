// src/app/admin/policies/[id]/edit/EditPolicyForm.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation'; // 1. Import useRouter
import { updatePolicy } from '@/lib/actions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import type { Policy, FormState } from '@/lib/definitions';
import toast from 'react-hot-toast';

export default function EditPolicyForm({ policy }: { policy: Policy }) {
  const router = useRouter(); // 2. ประกาศใช้งาน router
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updatePolicy, initialState);

  // 3. ใช้ useEffect เพื่อ "ดักจับ" การเปลี่ยนแปลงของ state
  useEffect(() => {
    if (state.success) {
      // ถ้าสำเร็จ
      toast.success(state.message || 'บันทึกข้อมูลสำเร็จ!');
      // หน่วงเวลา 1.5 วินาทีเพื่อให้ผู้ใช้เห็น Toast ก่อน redirect
      setTimeout(() => {
        router.push('/admin/policies');
      }, 1500);
    } else if (state.message) {
      // ถ้ามี error message
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="container mt-4">
      <h1>แก้ไขนโยบาย</h1>
      <div className="card">
        <div className="card-body">
          <form action={dispatch}>
            <input type="hidden" name="id" value={policy.id} />

            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                ชื่อนโยบาย
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`}
                defaultValue={policy.title || ''}
                required
              />
              <div id="title-error" aria-live="polite" aria-atomic="true">
                {state.errors?.title &&
                  state.errors.title.map((error: string) => (
                    <p className="mt-2 text-danger" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                รายละเอียด (ถ้ามี)
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows={4}
                defaultValue={policy.description || ''}
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
                <Link href="/admin/policies" className="btn btn-secondary">
                    ยกเลิก
                </Link>
                <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
