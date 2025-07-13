// src/app/admin/personnel/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { fetchFilteredPersonnel, fetchPersonnelPages } from '@/lib/data';
import type { Personnel } from '@/lib/definitions';
import Search from '../../../components/admin/Search';
import Pagination from '@/components/admin/Pagination';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePersonnel } from '@/lib/actions';

export default async function AdminPersonnelPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // ดึงข้อมูลจำนวนหน้าและข้อมูลบุคลากรพร้อมกัน
  const [totalPages, { data: personnel }] = await Promise.all([
    fetchPersonnelPages(query),
    fetchFilteredPersonnel(query, currentPage)
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
            <Search placeholder="ค้นหาชื่อหรือตำแหน่ง..." />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{width: '80px'}} className="text-center">รูป</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
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
        <div className="card-footer bg-white py-3">
            <Pagination totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
