// src/app/admin/policies/[id]/edit/EditPolicyForm.tsx

'use client';

import { useFormState } from 'react-dom';
import { updatePolicy } from '@/lib/actions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import type { Policy, FormState } from '@/lib/definitions';

export default function EditPolicyForm({ policy }: { policy: Policy }) {
  const initialState: FormState = { message: null, errors: {} };
  
  // --- จุดที่แก้ไข ---
  // ลบ .bind ออก และส่ง Server Action 'updatePolicy' เข้าไปตรงๆ
  // React จะจัดการส่ง state และ formData ให้โดยอัตโนมัติ
  const [state, dispatch] = useFormState(updatePolicy, initialState);

  return (
    <div className="container mt-4">
      <h1>แก้ไขนโยบาย</h1>
      <div className="card">
        <div className="card-body">
          <form action={dispatch}>
            {/* Input ที่ซ่อนไว้เพื่อส่ง ID ยังคงจำเป็นเหมือนเดิม */}
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
            
            {state.message && (
                <div className="alert alert-danger mt-3" role="alert">
                    {state.message}
                </div>
            )}

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
