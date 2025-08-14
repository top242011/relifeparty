// src/app/admin/dashboard/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server';
import { fetchCardData, fetchLatestEvents } from '@/lib/data';
import type { LatestEvent } from '@/lib/definitions';
import Link from 'next/link';
import { Users, Gavel, Newspaper, Calendar, Handshake, Vote, Percent } from 'lucide-react';

// Helper component for stat cards
const StatCard = ({ icon, value, title, link, linkText }: { icon: React.ReactNode, value: string | number, title: string, link: string, linkText: string }) => (
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <div className="flex-shrink-0 me-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
              {icon}
            </div>
          </div>
          <div className="flex-grow-1">
            <h5 className="card-title fs-2 fw-bold mb-0">{value}</h5>
            <p className="card-text text-muted mb-0">{title}</p>
          </div>
        </div>
        <div className="mt-auto">
           <Link href={link} className="btn btn-sm btn-outline-primary w-100">
              {linkText}
            </Link>
        </div>
      </div>
    </div>
  </div>
);


export default async function AdminDashboardPage() {
  const supabase = createClient(cookies());
  
  const [
    { data: { user } },
    cardData,
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
        Dashboard ภาพรวม
      </h1>
      
      {/* KPI Cards */}
      <div className="row">
        <StatCard icon={<Users size={24} />} value={cardData.personnelCount} title="บุคลากร" link="/admin/personnel" linkText="จัดการบุคลากร" />
        <StatCard icon={<Gavel size={24} />} value={cardData.policiesCount} title="นโยบาย" link="/admin/policies" linkText="จัดการนโยบาย"/>
        <StatCard icon={<Handshake size={24} />} value={cardData.meetingCount} title="การประชุมสภา" link="/admin/meetings" linkText="จัดการประชุม"/>
        <StatCard icon={<Vote size={24} />} value={cardData.motionCount} title="ญัตติ" link="/admin/motions" linkText="จัดการญัตติ"/>
        <StatCard icon={<Newspaper size={24} />} value={cardData.newsCount} title="ข่าวสาร" link="/admin/news" linkText="จัดการข่าวสาร"/>
        <StatCard icon={<Calendar size={24} />} value={cardData.eventsCount} title="กิจกรรม" link="/admin/events" linkText="จัดการกิจกรรม"/>
        <StatCard icon={<Percent size={24} />} value={`${cardData.attendanceRate}%`} title="อัตราการเข้าประชุม" link="/admin/reports/attendance" linkText="ดูรายงานการเข้าประชุม"/>
        
        {/* Placeholder for Finance */}
        <div className="col-md-6 col-xl-3 mb-4">
            <div className="card shadow-sm h-100 bg-light">
              <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">
                <p>โมดูลการเงิน</p>
                <small>(Phase 3)</small>
              </div>
            </div>
        </div>
      </div>

      {/* Latest Events & Other Summaries */}
      <div className="row mt-2">
        <div className="col-lg-6">
            <div className="card shadow-sm">
                <div className="card-header">
                <h5 className="mb-0">กิจกรรมล่าสุด</h5>
                </div>
                <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                    {latestEvents && latestEvents.length > 0 ? (
                    latestEvents.map((event: LatestEvent) => (
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
            </div>
        </div>
        <div className="col-lg-6">
            {/* Placeholder for other reports */}
             <div className="card shadow-sm h-100">
                <div className="card-header">
                    <h5 className="mb-0">รายงานอื่นๆ</h5>
                </div>
                <div className="card-body d-flex justify-content-center align-items-center text-muted">
                    <p>พื้นที่สำหรับกราฟสรุปผลอื่นๆ (Phase 2)</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
