// src/app/admin/events/[id]/edit/EditEventForm.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateEvent } from '@/lib/actions';
import type { FormState, Event } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

// **FIX:** Ensure this line has "export default"
export default function EditEventForm({ event }: { event: Event }) {
  const router = useRouter();
  const initialState: FormState = { message: null, errors: {}, success: false };

  const [state, dispatch] = useFormState(
    async (prevState: FormState, formData: FormData) => {
      return updateEvent(event.id, prevState, formData);
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'บันทึกข้อมูลสำเร็จ!');
      setTimeout(() => router.push('/admin/events'), 1500);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">แก้ไขกิจกรรม</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อกิจกรรม</label>
            <input type="text" className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`} id="title" name="title" defaultValue={event.title} required />
            {state.errors?.title && <div className="invalid-feedback">{state.errors.title[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">รายละเอียด</label>
            <textarea className={`form-control ${state.errors?.description ? 'is-invalid' : ''}`} id="description" name="description" rows={4} defaultValue={event.description} required></textarea>
            {state.errors?.description && <div className="invalid-feedback">{state.errors.description[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="eventDate" className="form-label">วันที่จัดกิจกรรม</label>
            <input type="date" className={`form-control ${state.errors?.eventDate ? 'is-invalid' : ''}`} id="eventDate" name="eventDate" defaultValue={new Date(event.eventDate).toISOString().split('T')[0]} required />
            {state.errors?.eventDate && <div className="invalid-feedback">{state.errors.eventDate[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">สถานที่ (ถ้ามี)</label>
            <input type="text" className="form-control" id="location" name="location" defaultValue={event.location || ''} />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/events" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" />
          </div>
        </form>
      </div>
    </>
  );
}
