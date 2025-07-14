// src/app/admin/events/create/page.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createEvent } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const initialState: FormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useFormState(createEvent, initialState);

  useEffect(() => {
    // Server Action handles redirection on success.
    // We only need to handle the error case here.
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">เพิ่มกิจกรรมใหม่</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อกิจกรรม</label>
            <input type="text" className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`} id="title" name="title" required />
            {state.errors?.title && <div className="invalid-feedback">{state.errors.title[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">รายละเอียด</label>
            <textarea className={`form-control ${state.errors?.description ? 'is-invalid' : ''}`} id="description" name="description" rows={4} required></textarea>
            {state.errors?.description && <div className="invalid-feedback">{state.errors.description[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="eventDate" className="form-label">วันที่จัดกิจกรรม</label>
            <input type="date" className={`form-control ${state.errors?.eventDate ? 'is-invalid' : ''}`} id="eventDate" name="eventDate" required />
            {state.errors?.eventDate && <div className="invalid-feedback">{state.errors.eventDate[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">สถานที่ (ถ้ามี)</label>
            <input type="text" className="form-control" id="location" name="location" />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/events" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกกิจกรรม" />
          </div>
        </form>
      </div>
    </>
  );
}
