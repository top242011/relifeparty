// src/components/admin/Pagination.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // ไม่ต้องแสดง Pagination ถ้ามีแค่หน้าเดียว
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <Link className="page-link" href={createPageURL(currentPage - 1)} aria-disabled={currentPage <= 1}>
            ก่อนหน้า
          </Link>
        </li>
        
        <li className="page-item disabled">
            <span className="page-link text-dark">
                หน้า {currentPage} จาก {totalPages}
            </span>
        </li>

        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
          <Link className="page-link" href={createPageURL(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
            ถัดไป
          </Link>
        </li>
      </ul>
    </nav>
  );
}
