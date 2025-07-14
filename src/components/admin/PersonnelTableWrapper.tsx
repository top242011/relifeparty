// src/components/admin/personnel/PersonnelTableWrapper.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PersonnelSort from '@/components/admin/PersonnelSort';
import Search from '@/components/admin/Search';
import Pagination from '@/components/admin/Pagination';
import Image from 'next/image';
import Link from 'next/link';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePersonnel } from '@/lib/actions';
import type { Personnel, Committee } from '@/lib/definitions';

const getThaiCampusName = (campus: string): string => {
  const campusMap: { [key: string]: string } = {
    'Rangsit': 'รังสิต',
    'Tha Prachan': 'ท่าพระจันทร์',
    'Lampang': 'ลำปาง',
  };
  return campusMap[campus] || campus;
};

// A new component to show loading state
function TableLoader() {
    return (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

function PersonnelTable({
    personnel,
    committees,
    totalPages,
    count
}: {
    personnel: Personnel[];
    committees: Committee[];
    totalPages: number;
    count: number;
}) {
    // We use a key derived from searchParams to force re-render and show Suspense fallback
    const searchParams = useSearchParams();
    const tableKey = searchParams.toString();

    return (
        <Suspense key={tableKey} fallback={<TableLoader />}>
            <div className="card shadow-sm">
                <div className="card-header bg-white p-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-lg-4">
                            <Search placeholder="ค้นหาชื่อ, ตำแหน่ง..." />
                        </div>
                        <div className="col-lg-8">
                            <PersonnelSort committees={committees} />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '80px' }} className="text-center">รูป</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>ตำแหน่งในพรรค</th>
                                    <th>ตำแหน่งในสภาฯ</th>
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
                                        <td>{person.party_position || '-'}</td>
                                        <td>{person.student_council_position || '-'}</td>
                                        <td>{getThaiCampusName(person.campus)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Link href={`/personnel/${person.id}/edit`} className="btn btn-info btn-sm">
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
        </Suspense>
    );
}

// This wrapper component handles the Suspense boundary
export default function PersonnelTableWrapper(props: any) {
    return (
        <div className="position-relative">
            <PersonnelTable {...props} />
        </div>
    );
}
