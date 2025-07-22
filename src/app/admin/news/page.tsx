import Link from 'next/link';
// --- FIX: Remove direct imports from supabase/ssr and cookies ---
// import { cookies } from 'next/headers';
// import { createServerClient } from '@supabase/ssr';
import { createClient } from '../../../../utils/supabase/server'; // --- FIX: Import the centralized client ---
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteNews } from '@/lib/actions';

interface NewsArticle {
  id: string;
  title: string;
  publishDate: string;
}

export default async function AdminNewsPage() {
  // --- FIX: Use the centralized createClient function ---
  const supabase = createClient();

  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('publishDate', { ascending: false });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">จัดการข่าวสาร</h1>
        <Link href="/admin/news/create" className="btn btn-primary">
          + เพิ่มข่าวใหม่
        </Link>
      </div>

      {error ? (
        <div className="alert alert-danger">เกิดข้อผิดพลาด: {error.message}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>หัวข้อข่าว</th>
                    <th>วันที่เผยแพร่</th>
                    <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {news?.map((article: NewsArticle) => (
                    <tr key={article.id}>
                      <td>{article.title}</td>
                      <td>{new Date(article.publishDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                      })}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link href={`/admin/news/${article.id}/edit`} className="btn btn-info btn-sm">
                            แก้ไข
                          </Link>
                          <DeleteButton idToDelete={article.id} formAction={deleteNews} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
