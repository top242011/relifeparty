import Link from 'next/link';
// --- FIX: Remove direct imports from supabase/ssr and cookies ---
// import { cookies } from 'next/headers';
// import { createServerClient } from '@supabase/ssr';
import { createClient } from '../../../../utils/supabase/server'; // --- FIX: Import the centralized client ---
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteMeeting } from '@/lib/actions';

interface Meeting {
  id: string;
  date: string;
  topic: string;
  scope: string;
}

const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'General Assembly': return <span className="badge bg-primary">สภาใหญ่</span>;
      case 'Rangsit': return <span className="badge bg-info text-dark">ศูนย์รังสิต</span>;
      case 'Tha Prachan': return <span className="badge bg-warning text-dark">ศูนย์ท่าพระจันทร์</span>;
      case 'Lampang': return <span className="badge bg-secondary">ศูนย์ลำปาง</span>;
      default: return <span className="badge bg-light text-dark">{scope}</span>;
    }
};

export default async function AdminMeetingsPage() {
  // --- FIX: Use the centralized createClient function ---
  const supabase = createClient();

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">จัดการการประชุมสภา</h1>
        <Link href="/admin/meetings/create" className="btn btn-primary">
          + เพิ่มการประชุม
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
                    <th>วันที่ประชุม</th>
                    <th>หัวข้อหลัก</th>
                    <th>ขอบเขต</th>
                    <th className="text-center" style={{ width: '250px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings?.map((meeting: Meeting) => (
                    <tr key={meeting.id}>
                      <td>{new Date(meeting.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</td>
                      <td>{meeting.topic}</td>
                      <td>{getScopeBadge(meeting.scope)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                            <Link href={`/admin/meetings/${meeting.id}/edit`} className="btn btn-success btn-sm">
                                บันทึกผล
                            </Link>
                            <DeleteButton idToDelete={meeting.id} formAction={deleteMeeting} />
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
