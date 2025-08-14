// src/app/admin/personnel/[id]/edit/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditPersonnelForm from './EditPersonnelForm';
import type { Personnel, Committee } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditPersonnelPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { id } = params;

  // Fetch personnel and all committees concurrently
  const [personnelResult, committeesResult] = await Promise.all([
    supabase.from('personnel').select('*').eq('id', id).single(),
    // --- FIXED: Changed from .select('id, name') to .select('*') ---
    // This ensures all fields, including 'description', are fetched to match the Committee type.
    supabase.from('committees').select('*').order('name')
  ]);

  const { data: personnel, error: personnelError } = personnelResult;
  const { data: committees, error: committeesError } = committeesResult;

  if (personnelError || !personnel) {
    notFound();
  }

  if (committeesError) {
    console.error("Error fetching committees: ", committeesError.message);
  }

  // The 'committees' object now correctly matches the 'Committee[]' type.
  return (
    <EditPersonnelForm 
      personnel={personnel as Personnel} 
      allCommittees={committees || []}
    />
  );
}
