// src/app/admin/committees/[id]/edit/EditCommitteeForm.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateCommittee } from '@/lib/actions';
import type { FormState, Committee } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditCommitteeForm({ committee }: { committee: Committee }) {
  const router = useRouter();
  const initialState: FormState = { message: null, errors: {}, success: false };
  // Bind the committee ID to the update action
  const updateCommitteeWithId = updateCommittee.bind(null, committee.id);
  const [state, dispatch] = useFormState(updateCommitteeWithId, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'บันทึกข้อมูลสำเร็จ!');
      // Optional: redirect after a delay
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <>
      <h1 className="mb-4">แก้ไขคณะกรรมาธิการ</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          {/* We no longer need a hidden input for ID because we bound it in the action */}
          
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
              defaultValue={committee.description || ''}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/committees" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" />
          </div>
        </form>
      </div>
    </>
  );
}
