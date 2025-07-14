// src/app/admin/personnel/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { fetchFilteredPersonnel, fetchPersonnelPages, fetchAllCommittees, fetchPersonnelStats } from '@/lib/data';
import PersonnelDashboard from '@/components/admin/PersonnelDashboard';
import PersonnelTableWrapper from '@/components/admin//PersonnelTableWrapper';
import ToastNotifier from '@/components/admin//ToastNotifier';

export default async function AdminPersonnelPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    campus?: string;
    committeeId?: string;
    role?: string; // New filter
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    message?: string; // For success toast
    error?: string; // For error toast
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
      {/* Client component to show toast notifications based on URL params */}
      <ToastNotifier successMessage={searchParams?.message} errorMessage={searchParams?.error} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue mb-0">จัดการบุคลากร</h1>
        <Link href="/admin/personnel/create" className="btn btn-primary">
          + เพิ่มบุคลากรใหม่
        </Link>
      </div>
      
      {/* Dashboard Section */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <PersonnelDashboard stats={stats} />
      </Suspense>

      {/* Table Section with Loading Wrapper */}
      <PersonnelTableWrapper
        personnel={personnel}
        committees={committees}
        totalPages={totalPages}
        count={count}
      />
    </>
  );
}
