// src/app/admin/personnel/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic'; // 1. Import 'dynamic' from next/dynamic
import { fetchFilteredPersonnel, fetchPersonnelPages, fetchAllCommittees, fetchPersonnelStats } from '@/lib/data';
// We will no longer import PersonnelDashboard directly
// import PersonnelDashboard from '@/components/admin/personnel/PersonnelDashboard'; 
import PersonnelTableWrapper from '@/components/admin/PersonnelTableWrapper';
import ToastNotifier from '@/components/admin/ToastNotifier';

// 2. Dynamically import the dashboard component with SSR turned off
const PersonnelDashboard = dynamic(
    () => import('@/components/admin/PersonnelDashboard'),
    { 
        ssr: false, // This is the crucial part
        loading: () => ( // Optional: A nice loading state for the dashboard
            <div className="text-center p-5 mb-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Dashboard...</span>
                </div>
                <p className="mt-2 text-muted">กำลังโหลดข้อมูลสรุป...</p>
            </div>
        )
    }
);

export default async function AdminPersonnelPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    campus?: string;
    committeeId?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    message?: string;
    error?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const campus = searchParams?.campus || null;
  const committeeId = searchParams?.committeeId || null;
  const role = searchParams?.role || null;
  const sortBy = searchParams?.sortBy || 'name';
  const sortOrder = searchParams?.sortOrder || 'asc';

  // Fetch all data concurrently
  const [
    { data: personnel, count },
    totalPages,
    committees,
    stats
  ] = await Promise.all([
    fetchFilteredPersonnel(query, currentPage, campus, committeeId, role, sortBy, sortOrder),
    fetchPersonnelPages(query, campus, committeeId, role),
    fetchAllCommittees(),
    fetchPersonnelStats()
  ]);

  return (
    <>
      <ToastNotifier successMessage={searchParams?.message} errorMessage={searchParams?.error} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue mb-0">จัดการบุคลากร</h1>
        <Link href="/admin/personnel/create" className="btn btn-primary">
          + เพิ่มบุคลากรใหม่
        </Link>
      </div>
      
      {/* 3. The PersonnelDashboard component is now dynamically loaded */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <PersonnelDashboard stats={stats} />
      </Suspense>

      <PersonnelTableWrapper
        personnel={personnel}
        committees={committees}
        totalPages={totalPages}
        count={count}
      />
    </>
  );
}
