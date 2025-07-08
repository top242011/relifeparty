// src/app/admin/policies/create/page.tsx
'use client'; // Client Component เพราะมีการจัดการ State และ Interaction กับฟอร์ม

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from 'utils/supabase/client'; // ใช้ Client-side Supabase Client
import AdminNavbar from 'src/components/admin/AdminNavbar'; // Import AdminNavbar
import Link from 'next/link';

export default function CreatePolicyPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('เสนอแล้ว'); // Default status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from('policies')
        .insert([
          {
            title,
            content,
            "publishDate": publishDate || null, // Convert empty string to null for DATE type
            "imageUrl": imageUrl || null, // Convert empty string to null
            status,
          },
        ])
        .select(); // Select the inserted data

      if (error) {
        throw error;
      }

      setMessage('เพิ่มนโยบายสำเร็จ!');
      router.push('/admin/policies'); // Redirect กลับไปหน้ารายการนโยบาย
    } catch (err: any) {
      setMessage(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">เพิ่มนโยบายใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label text-dark-blue">ชื่อนโยบาย</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label text-dark-blue">รายละเอียดนโยบาย</label>
              <textarea
                className="form-control"
                id="content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={loading}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="publishDate" className="form-label text-dark-blue">วันที่เผยแพร่</label>
              <input
                type="date"
                className="form-control"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label text-dark-blue">URL รูปภาพ (จาก Google Drive)</label>
              <input
                type="url"
                className="form-control"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label text-dark-blue">สถานะ</label>
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="เสนอแล้ว">เสนอแล้ว</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="สำเร็จ">สำเร็จ</option>
                <option value="ถูกระงับ">ถูกระงับ</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-dark-blue me-2"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกนโยบาย'}
            </button>
            <Link href="/admin/policies" className="btn btn-secondary">
              ยกเลิก
            </Link>
          </form>
          {message && (
            <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}
        </div>
      </main>
      <footer className="footer mt-auto py-3 bg-light border-top">
        <div className="container text-center text-muted">
          &copy; {new Date().getFullYear()} Relife Party Admin
        </div>
      </footer>
    </div>
  );
}
