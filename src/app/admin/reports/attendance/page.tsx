// src/app/admin/reports/attendance/page.tsx

import Link from 'next/link';

export default function AttendanceReportPage() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">รายงานการเข้าประชุม</h1>
        <Link href="/admin/dashboard" className="btn btn-secondary">
          กลับไปหน้า Dashboard
        </Link>
      </div>
      <div className="card">
        <div className="card-body text-center text-muted">
          <p className="mb-0">หน้านี้อยู่ระหว่างการพัฒนา (Phase 2)</p>
        </div>
      </div>
    </>
  );
}
