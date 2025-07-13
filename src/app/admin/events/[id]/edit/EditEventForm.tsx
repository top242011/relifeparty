// src/app/admin/events/[id]/edit/EditEventForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { updateEvent } from '@/lib/actions';
import type { FormState, Event } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';

export default function EditEventForm({ event }: { event: Event }) {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updateEvent, initialState);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">แก้ไขกิจกรรม</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <input type="hidden" name="id" value={event.id} />
          
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อกิจกรรม</label>
            <input 
              type="text" 
              className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`}
              id="title" 
              name="title" 
              defaultValue={event.title}
              required 
            />
             <div id="title-error" aria-live="polite" aria-atomic="true">
                {state.errors?.title && state.errors.title.map((error: string) => (
                    <p className="mt-2 text-danger" key={error}>{error}</p>
                ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">รายละเอียด</label>
            <textarea 
              className={`form-control ${state.errors?.description ? 'is-invalid' : ''}`}
              id="description" 
              name="description" 
              rows={4} 
              defaultValue={event.description}
              required
            ></textarea>
            <div id="description-error" aria-live="polite" aria-atomic="true">
                {state.errors?.description && state.errors.description.map((error: string) => (
                    <p className="mt-2 text-danger" key={error}>{error}</p>
                ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="eventDate" className="form-label">วันที่จัดกิจกรรม</label>
            <input 
              type="date" 
              className={`form-control ${state.errors?.eventDate ? 'is-invalid' : ''}`}
              id="eventDate" 
              name="eventDate" 
              defaultValue={new Date(event.eventDate).toISOString().split('T')[0]}
              required 
            />
            <div id="eventDate-error" aria-live="polite" aria-atomic="true">
                {state.errors?.eventDate && state.errors.eventDate.map((error: string) => (
                    <p className="mt-2 text-danger" key={error}>{error}</p>
                ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">สถานที่ (ถ้ามี)</label>
            <input 
              type="text" 
              className="form-control" 
              id="location" 
              name="location"
              defaultValue={event.location || ''}
            />
          </div>

          {state.message && (
            <div className="alert alert-danger mt-3" role="alert">
                {state.message}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/events" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  );
}
