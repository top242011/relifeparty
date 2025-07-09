// src/components/admin/AdminNavbar.tsx
'use client'

import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function AdminNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <Link href="/admin/dashboard" className="navbar-brand">
          Relife Party Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAdmin"
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
              {/* 👈 เพิ่มลิงก์นี้ */}
              <Link href="/admin/personnel" className="nav-link">
                จัดการบุคลากร
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
              <LogoutButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
