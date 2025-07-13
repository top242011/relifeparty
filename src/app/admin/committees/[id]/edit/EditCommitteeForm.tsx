// src/app/admin/committees/[id]/edit/EditCommitteeForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { updateCommittee } from '@/lib/actions';
import type { FormState, Committee } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';

export default function EditCommitteeForm({ committee }: { committee: Committee }) {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updateCommittee, initialState);

  return (
    <>
      <h1 className="mb-4">แก้ไขคณะกรรมาธิการ</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <input type="hidden" name="id" value={committee.id} />

          <div className="mb-3">
            <label htmlFor="name" className="form-label">ชื่อคณะกรรมาธิการ</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${state.errors?.name ? 'is-invalid' : ''}`}
              defaultValue={committee.name}
              required
            />
            <div id="name-error" aria-live="polite" aria-atomic="true">
                {state.errors?.name && state.errors.name.map((error: string) => (
                    <p className="mt-2 text-danger" key={error}>{error}</p>
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
              defaultValue={committee.description || ''}
            ></textarea>
          </div>

          {state.message && (
            <div className="alert alert-danger mt-3" role="alert">
                {state.message}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/committees" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  );
}
