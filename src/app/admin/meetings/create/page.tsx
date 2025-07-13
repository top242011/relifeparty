// src/app/admin/meetings/create/page.tsx
'use client'

import { useFormState } from 'react-dom';
import { createMeeting } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import Link from 'next/link';
import SubmitButton from '@/components/admin/SubmitButton';

export default function CreateMeetingPage() {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createMeeting, initialState);

  return (
    <>
      <h1 className="mb-4">เพิ่มการประชุมใหม่</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">วันที่ประชุม</label>
            <input type="date" className="form-control" id="date" name="date" required />
          </div>
          <div className="mb-3">
            <label htmlFor="topic" className="form-label">หัวข้อการประชุมหลัก</label>
            <textarea className="form-control" id="topic" name="topic" rows={3} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="scope" className="form-label">ขอบเขตการประชุม</label>
            <select id="scope" name="scope" className="form-select" defaultValue="General Assembly">
              <option value="General Assembly">การประชุมสภาใหญ่ (ทุกศูนย์)</option>
              <option value="Rangsit">ประชุมเฉพาะศูนย์รังสิต</option>
              <option value="Tha Prachan">ประชุมเฉพาะศูนย์ท่าพระจันทร์</option>
              <option value="Lampang">ประชุมเฉพาะศูนย์ลำปาง</option>
            </select>
          </div>

          {state.message && (
            <div className="alert alert-danger mt-3" role="alert">{state.message}</div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/meetings" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกและไปต่อ" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  )
}
