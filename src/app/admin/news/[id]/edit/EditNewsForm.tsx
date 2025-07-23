// src/app/admin/news/[id]/edit/EditNewsForm.tsx
// This is the Client Component, responsible for UI and form state.

'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updateNews } from '@/lib/actions';
import type { FormState, News } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditNewsForm({ news }: { news: News }) {
  const initialState: FormState = { message: null, errors: {}, success: false };

  // Bind the news ID to the server action
  const updateNewsWithId = updateNews.bind(null, news.id);
  const [state, dispatch] = useFormState(updateNewsWithId, initialState);

  useEffect(() => {
    // Server action handles redirection, we only show toasts here
    if (state.success) {
      toast.success(state.message || 'บันทึกข้อมูลสำเร็จ!');
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">แก้ไขข่าวสาร</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">หัวข้อข่าว</label>
            <input type="text" className={`form-control ${state.errors?.title ? 'is-invalid' : ''}`} id="title" name="title" defaultValue={news.title} required />
            {state.errors?.title && <div className="invalid-feedback">{state.errors.title[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">เนื้อหาข่าว</label>
            <textarea className={`form-control ${state.errors?.content ? 'is-invalid' : ''}`} id="content" name="content" rows={5} defaultValue={news.content} required></textarea>
            {state.errors?.content && <div className="invalid-feedback">{state.errors.content[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="publishDate" className="form-label">วันที่เผยแพร่</label>
            <input type="date" className={`form-control ${state.errors?.publishDate ? 'is-invalid' : ''}`} id="publishDate" name="publishDate" defaultValue={new Date(news.publishDate).toISOString().split('T')[0]} required />
            {state.errors?.publishDate && <div className="invalid-feedback">{state.errors.publishDate[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">URL รูปภาพ (ถ้ามี)</label>
            <input type="url" className={`form-control ${state.errors?.imageUrl ? 'is-invalid' : ''}`} id="imageUrl" name="imageUrl" defaultValue={news.imageUrl || ''} />
            {state.errors?.imageUrl && <div className="invalid-feedback">{state.errors.imageUrl[0]}</div>}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/news" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" />
          </div>
        </form>
      </div>
    </>
  );
}
