// src/app/admin/committees/[id]/edit/page.tsx
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditCommitteeForm from './EditCommitteeForm'; // Import the new form component
import type { Committee } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditCommitteePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  const { data: committee, error } = await supabase
    .from('committees')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !committee) {
    notFound();
  }

  return <EditCommitteeForm committee={committee as Committee} />;
}
