// src/app/admin/dashboard/page.tsx

// ทำให้หน้านี้เป็น Server Component โดยการลบ 'use client' ออก
import { createClient } from '../../../../utils/supabase/server';
import { fetchCardData, fetchLatestEvents } from '@/lib/data';
import type { Event } from '@/lib/definitions';
import Link from 'next/link';
import { Users, Gavel, Newspaper, Calendar } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  // ดึงข้อมูลผู้ใช้และข้อมูล Dashboard พร้อมกัน
  const [
    { data: { user } },
    { personnelCount, policiesCount, newsCount, eventsCount },
    latestEvents
  ] = await Promise.all([
    supabase.auth.getUser(),
    fetchCardData(),
    fetchLatestEvents()
  ]);

  const userEmail = user?.email || 'Admin';

  return (
    <>
      <h1 className="mb-4 text-dark-blue">
        ยินดีต้อนรับ, <span className="fw-normal">{userEmail}</span>!
      </h1>
      
      {/* Info Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <Users size={24} />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="card-title fs-2 fw-bold mb-1">{personnelCount}</h5>
                <p className="card-text text-muted mb-0">บุคลากรทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <Gavel size={24} />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="card-title fs-2 fw-bold mb-1">{policiesCount}</h5>
                <p className="card-text text-muted mb-0">นโยบายทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <Newspaper size={24} />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="card-title fs-2 fw-bold mb-1">{newsCount}</h5>
                <p className="card-text text-muted mb-0">ข่าวทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <Calendar size={24} />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="card-title fs-2 fw-bold mb-1">{eventsCount}</h5>
                <p className="card-text text-muted mb-0">กิจกรรมทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Events */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">กิจกรรมล่าสุด</h5>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {latestEvents && latestEvents.length > 0 ? (
              latestEvents.map((event: Event) => (
                <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <Link href={`/admin/events/${event.id}/edit`} className="fw-bold text-decoration-none">{event.title}</Link>
                    <p className="mb-0 text-muted small">{event.location || 'ไม่ระบุสถานที่'}</p>
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                    {new Date(event.eventDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </li>
              ))
            ) : (
              <li className="list-group-item text-center text-muted">ยังไม่มีกิจกรรม</li>
            )}
          </ul>
        </div>
        <div className="card-footer text-center">
            <Link href="/admin/events" className="btn btn-outline-primary btn-sm">ดูกิจกรรมทั้งหมด</Link>
        </div>
      </div>
    </>
  );
}
