// src/app/admin/motions/create/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createMotion } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import { createClient } from '../../../../../utils/supabase/client';
import Link from 'next/link';
import SubmitButton from '@/components/admin/SubmitButton';

interface Meeting { id: string; topic: string; date: string; }
interface Personnel { id: string; name: string; }

export default function CreateMotionPage() {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createMotion, initialState);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: meetingsData } = await supabase.from('meetings').select('id, topic, date').order('date', { ascending: false });
      const { data: personnelData } = await supabase.from('personnel').select('id, name').eq('is_active', true).order('name');
      setMeetings(meetingsData || []);
      setPersonnel(personnelData || []);
    }
    fetchData();
  }, []);

  return (
    <>
      <h1 className="mb-4">เสนอญัตติใหม่</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อญัตติ</label>
            <input type="text" className="form-control" id="title" name="title" required />
          </div>
          <div className="mb-3">
            <label htmlFor="details" className="form-label">รายละเอียด</label>
            <textarea className="form-control" id="details" name="details" rows={5}></textarea>
          </div>
           <div className="row">
              <div className="col-md-6 mb-3">
                  <label htmlFor="meeting_id" className="form-label">เสนอในการประชุม</label>
                  <select id="meeting_id" name="meeting_id" className="form-select">
                      <option value="">-- ไม่ระบุ --</option>
                      {meetings.map(m => <option key={m.id} value={m.id}>{new Date(m.date).toLocaleDateString('th-TH')} - {m.topic}</option>)}
                  </select>
              </div>
              <div className="col-md-6 mb-3">
                  <label htmlFor="proposer_id" className="form-label">ผู้เสนอ</label>
                  <select id="proposer_id" name="proposer_id" className="form-select">
                      <option value="">-- ไม่ระบุ --</option>
                      {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
          </div>

          {state.message && (
            <div className="alert alert-danger mt-3" role="alert">{state.message}</div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/motions" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกญัตติ" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  )
}
