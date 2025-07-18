// src/app/admin/policies/create/page.tsx

'use client';

import { useFormState } from 'react-dom';
import { createPolicy } from '@/lib/actions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import type { FormState } from '@/lib/definitions';

export default function CreatePolicyPage() {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPolicy, initialState);

  return (
    <div className="container mt-4">
      <h1>สร้างนโยบายใหม่</h1>
      <div className="card">
        <div className="card-body">
          <form action={dispatch}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                ชื่อนโยบาย
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`}
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
              ></textarea>
            </div>
            
            {state.message && (
                <div className="alert alert-danger" role="alert">
                    {state.message}
                </div>
            )}

            <div className="d-flex justify-content-end gap-2">
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
