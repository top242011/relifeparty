// src/app/admin/news/create/page.tsx
'use client'

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createNews } from '@/lib/actions'; // --- FIX: Import the Server Action ---
import type { FormState } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateNewsPage() {
  // --- FIX: Use useFormState instead of multiple useState hooks ---
  const initialState: FormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useFormState(createNews, initialState);

  // --- FIX: Use useEffect to show toast notifications based on form state ---
  useEffect(() => {
    // Server Action handles redirection on success.
    // We only need to handle the error case here.
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">เพิ่มข่าวสารใหม่</h1>
      <div className="card shadow-sm p-4">
        {/* --- FIX: The form now calls the `dispatch` function from useFormState --- */}
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">หัวข้อข่าว</label>
            <input 
              type="text" 
              className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`} 
              id="title" 
              name="title" 
              required 
            />
            {state.errors?.title && <div className="invalid-feedback">{state.errors.title[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">เนื้อหาข่าว</label>
            <textarea 
              className={`form-control ${state.errors?.content ? 'is-invalid' : ''}`} 
              id="content" 
              name="content" 
              rows={5} 
              required
            ></textarea>
            {state.errors?.content && <div className="invalid-feedback">{state.errors.content[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="publishDate" className="form-label">วันที่เผยแพร่</label>
            <input 
              type="date" 
              className={`form-control ${state.errors?.publishDate ? 'is-invalid' : ''}`} 
              id="publishDate" 
              name="publishDate" 
              required 
            />
            {state.errors?.publishDate && <div className="invalid-feedback">{state.errors.publishDate[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">URL รูปภาพ (ถ้ามี)</label>
            <input 
              type="url" 
              className={`form-control ${state.errors?.imageUrl ? 'is-invalid' : ''}`} 
              id="imageUrl" 
              name="imageUrl" 
            />
             {state.errors?.imageUrl && <div className="invalid-feedback">{state.errors.imageUrl[0]}</div>}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/news" className="btn btn-secondary">ยกเลิก</Link>
            {/* --- FIX: Use the reusable SubmitButton component --- */}
            <SubmitButton label="บันทึกข่าวสาร" />
          </div>
        </form>
      </div>
    </>
  )
}
