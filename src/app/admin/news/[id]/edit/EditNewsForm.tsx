// src/app/admin/news/[id]/edit/EditNewsForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { updateNews } from '@/lib/actions';
import type { FormState, News } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';

export default function EditNewsForm({ news }: { news: News }) {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updateNews, initialState);

  return (
    <>
      <h1 className="mb-4 text-dark-blue">แก้ไขข่าวสาร</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <input type="hidden" name="id" value={news.id} />

          <div className="mb-3">
            <label htmlFor="title" className="form-label">หัวข้อข่าว</label>
            <input type="text" className="form-control" id="title" name="title" defaultValue={news.title} required />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">เนื้อหาข่าว</label>
            <textarea className="form-control" id="content" name="content" rows={5} defaultValue={news.content} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="publishDate" className="form-label">วันที่เผยแพร่</label>
            <input type="date" className="form-control" id="publishDate" name="publishDate" defaultValue={new Date(news.publishDate).toISOString().split('T')[0]} required />
          </div>
          <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">URL รูปภาพ (ถ้ามี)</label>
            <input type="url" className="form-control" id="imageUrl" name="imageUrl" defaultValue={news.imageUrl || ''} />
          </div>

          {state.message && (
            <div className="alert alert-danger mt-3" role="alert">{state.message}</div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/news" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" pendingLabel="กำลังบันทึก..." />
          </div>
        </form>
      </div>
    </>
  );
}
