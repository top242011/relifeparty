// src/app/admin/policies/[id]/edit/EditPolicyForm.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updatePolicy } from '@/lib/actions'; // Import the corrected action
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import type { Policy, FormState } from '@/lib/definitions';
import toast from 'react-hot-toast';

export default function EditPolicyForm({ policy }: { policy: Policy }) {
  const router = useRouter();
  const initialState: FormState = { message: null, errors: {}, success: false };

  // This correctly creates a new function with the policy's ID pre-filled as the first argument.
  // The new function's signature is now (prevState, formData) => ..., which is what useFormState expects.
  const updatePolicyWithId = updatePolicy.bind(null, policy.id);

  const [state, dispatch] = useFormState(updatePolicyWithId, initialState);

  // useEffect for showing toast notifications based on the form state
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'บันทึกข้อมูลสำเร็จ!');
      // Optional: redirect after a delay to let the user see the toast
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="container mt-4">
      <h1>แก้ไขนโยบาย</h1>
      <div className="card">
        <div className="card-body">
          {/* The form now calls the `dispatch` function from useFormState */}
          <form action={dispatch}>
            {/* No hidden input for ID is needed anymore */}

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
                <SubmitButton label="บันทึกการแก้ไข" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
