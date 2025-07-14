// src/app/admin/personnel/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { fetchFilteredPersonnel, fetchPersonnelPages, fetchAllCommittees } from '@/lib/data';
import type { Personnel, Committee } from '@/lib/definitions';
import Search from '@/components/admin/Search';
import Pagination from '@/components/admin/Pagination';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePersonnel } from '@/lib/actions';
import PersonnelSort from '../../../components/admin/PersonnelSort';

// --- NEW: Helper function to map campus names to Thai ---
const getThaiCampusName = (campus: string): string => {
  const campusMap: { [key: string]: string } = {
    'Rangsit': 'รังสิต',
    'Tha Prachan': 'ท่าพระจันทร์',
    'Lampang': 'ลำปาง',
  };
  return campusMap[campus] || campus; // Fallback to original name if not in map
};

export default async function AdminPersonnelPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    campus?: string;
    committeeId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const campus = searchParams?.campus || null;
  const committeeId = searchParams?.committeeId || null;
  const sortBy = searchParams?.sortBy || 'name';
  const sortOrder = searchParams?.sortOrder || 'asc';

  // Fetch data concurrently
  const [
    { data: personnel, count },
    totalPages,
    committees
  ] = await Promise.all([
    fetchFilteredPersonnel(query, currentPage, campus, committeeId, sortBy, sortOrder),
    fetchPersonnelPages(query, campus, committeeId),
    fetchAllCommittees()
  ]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue mb-0">จัดการบุคลากร</h1>
        <Link href="/admin/personnel/create" className="btn btn-primary">
          + เพิ่มบุคลากรใหม่
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white p-3">
          <div className="row g-2 align-items-center">
            <div className="col-lg-5">
              <Search placeholder="ค้นหาชื่อหรือตำแหน่ง..." />
            </div>
            <div className="col-lg-7">
              <PersonnelSort committees={committees} />
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{width: '80px'}} className="text-center">รูป</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
                  <th>สังกัดศูนย์</th>
                  <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {personnel?.map((person: Personnel) => (
                  <tr key={person.id}>
                    <td className="text-center">
                      <Image
                        src={person.image_url || 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=No+Image'}
                        alt={`รูปของ ${person.name}`}
                        width={40}
                        height={40}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>{person.name}</td>
                    <td>{person.position}</td>
                    {/* --- FIXED: Use the helper function to display Thai name --- */}
                    <td>{getThaiCampusName(person.campus)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Link href={`/admin/personnel/${person.id}/edit`} className="btn btn-info btn-sm">
                          แก้ไข
                        </Link>
                        <DeleteButton idToDelete={person.id} formAction={deletePersonnel} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              พบ {count} รายการ
            </span>
            <Pagination totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
