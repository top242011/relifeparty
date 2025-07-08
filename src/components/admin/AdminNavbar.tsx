// components/admin/AdminNavbar.tsx
// Navbar สำหรับ Admin Dashboard (Client Component เพราะมีปุ่ม Logout)
'use client'; // เนื่องจากมีปุ่ม Logout ที่เป็น Client Component

import Link from 'next/link';
import LogoutButton from './LogoutButton'; // Import LogoutButton

export default function AdminNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-blue shadow-sm">
      <div className="container-fluid">
        <Link href="/admin/dashboard" className="navbar-brand">
          Relife Party Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAdmin" // เปลี่ยน ID เพื่อหลีกเลี่ยงความขัดแย้ง
          aria-controls="navbarNavAdmin"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAdmin">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link href="/admin/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/policies" className="nav-link">
                จัดการนโยบาย
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/news" className="nav-link">
                จัดการข่าวสาร
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/events" className="nav-link">
                จัดการกิจกรรม
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/meetings" className="nav-link">
                จัดการการประชุม
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/personnel" className="nav-link">
                จัดการบุคลากร
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/motions" className="nav-link">
                จัดการญัตติ
              </Link>
            </li>
            <li className="nav-item">
              <LogoutButton /> {/* ใช้ LogoutButton Component */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
