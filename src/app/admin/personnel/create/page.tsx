// src/app/admin/personnel/create/page.tsx
'use client'

import { useFormState } from 'react-dom';
import { createPersonnel } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function CreatePersonnelPage() {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPersonnel, initialState);

  // Use useEffect to show toast messages based on form state
  useEffect(() => {
    if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <h1 className="mb-4">เพิ่มบุคลากรใหม่</h1>
      <div className="card shadow-sm p-4">
        {/* The form now calls the new createPersonnel action */}
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
            <input type="text" id="name" name="name" className={`form-control ${state.errors?.name ? 'is-invalid' : ''}`} required />
            {state.errors?.name && <div className="invalid-feedback">{state.errors.name[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="position" className="form-label">ตำแหน่งในพรรค</label>
            <input type="text" id="position" name="position" className={`form-control ${state.errors?.position ? 'is-invalid' : ''}`} defaultValue="-" required />
            {state.errors?.position && <div className="invalid-feedback">{state.errors.position[0]}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="role" className="form-label">บทบาท</label>
              <select id="role" name="role" className="form-select" defaultValue="MP">
                <option value="MP">ส.ส.</option>
                <option value="Executive">กรรมการบริหาร</option>
                <option value="Both">เป็นทั้งสองอย่าง</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="campus" className="form-label">สังกัดศูนย์</label>
              <select id="campus" name="campus" className="form-select" defaultValue="Rangsit">
                <option value="Rangsit">รังสิต</option>
                <option value="Tha Prachan">ท่าพระจันทร์</option>
                <option value="Lampang">ลำปาง</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">ประวัติโดยย่อ</label>
            <textarea className="form-control" id="bio" name="bio" rows={4}></textarea>
          </div>
          
          {/* --- UPDATED: Changed from URL input to File input --- */}
          <div className="mb-3">
            <label htmlFor="image_file" className="form-label">รูปภาพ</label>
            <input 
              type="file" 
              className="form-control" 
              id="image_file" 
              name="image_file"
              accept="image/png, image/jpeg, image/webp" 
            />
            <div className="form-text">
              อัปโหลดไฟล์รูปภาพ (PNG, JPG, WebP)
            </div>
          </div>
          
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="is_active" 
              name="is_active"
              defaultChecked={true} 
            />
            <label className="form-check-label" htmlFor="is_active">
              ดำรงตำแหน่ง (Active)
            </label>
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกข้อมูล" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  );
}
