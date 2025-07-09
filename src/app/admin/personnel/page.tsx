// src/app/admin/personnel/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

// --- Types ---
interface Personnel {
  id: string;
  name: string;
  position: string;
  is_active: boolean;
  image_url: string | null;
  role: string;
  campus: string;
}

type SortKey = keyof Personnel | 'name';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// --- Helper Components ---
const SortableHeader = ({
  label,
  sortKey,
  sortConfig,
  requestSort,
}: {
  label: string;
  sortKey: SortKey;
  sortConfig: SortConfig | null;
  requestSort: (key: SortKey) => void;
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const icon = isSorted ? (sortConfig.direction === 'ascending' ? 'bi-sort-up' : 'bi-sort-down') : 'bi-filter';

  return (
    <th onClick={() => requestSort(sortKey)} style={{ cursor: 'pointer' }}>
      {label} <i className={`bi ${icon} ms-1`}></i>
    </th>
  );
};


export default function AdminPersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchPersonnel = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setPersonnel(data)
      }
      setLoading(false)
    }

    fetchPersonnel()
  }, [])

  // --- Sorting Logic ---
  const sortedPersonnel = useMemo(() => {
    let sortableItems = [...personnel];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // 👇 1. เพิ่มการตรวจสอบที่นี่เพื่อความปลอดภัย
        // แม้ว่าเราจะเช็คไปแล้ว แต่การเช็คใน scope นี้จะทำให้ TypeScript มั่นใจ
        if (!sortConfig) return 0;

        // 👇 2. ดึงค่าออกมาใส่ตัวแปรเพื่อความสะอาดและจัดการค่า null
        const valA = a[sortConfig.key] ?? ''; // ถ้าค่าเป็น null ให้ใช้ string ว่างแทน
        const valB = b[sortConfig.key] ?? '';

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [personnel, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'Executive': return <span className="badge bg-info text-dark">กก.บห.</span>;
      case 'MP': return <span className="badge bg-warning text-dark">ส.ส.</span>;
      case 'Both': return <><span className="badge bg-info text-dark">กก.บห.</span> <span className="badge bg-warning text-dark">ส.ส.</span></>;
      default: return null;
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการบุคลากร</h1>
          <Link href="/admin/personnel/create" className="btn btn-primary">
            + เพิ่มบุคลากรใหม่
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูลบุคลากร...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '10%' }}>รูปภาพ</th>
                  <SortableHeader label="ชื่อ-นามสกุล" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="ตำแหน่ง" sortKey="position" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="บทบาท / ศูนย์" sortKey="role" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="สถานะ" sortKey="is_active" sortConfig={sortConfig} requestSort={requestSort} />
                  <th className="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>{sortedPersonnel.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <img 
                        src={person.image_url || `https://placehold.co/60x60/EFEFEF/AAAAAA&text=No+Image`} 
                        alt={person.name} 
                        className="rounded-circle"
                        width="50"
                        height="50"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>{person.name}</td>
                    <td>{person.position}</td>
                    <td>
                      <div>{getRoleBadge(person.role)}</div>
                      <small className="text-muted">{person.campus}</small>
                    </td>
                    <td>
                      <span className={`badge ${person.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {person.is_active ? 'ดำรงตำแหน่ง' : 'พ้นจากตำแหน่ง'}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/personnel/${person.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <DeleteButton recordId={person.id} tableName="personnel" />
                    </td>
                  </tr>
                ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
