// src/app/admin/motions/[id]/edit/page.tsx
// This is the Server Component responsible for data fetching.

import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditMotionForm from './EditMotionForm'; // We will pass data to this client component
import type { Motion } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditMotionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // Fetch all required data on the server
  const { data: motion, error } = await supabase
    .from('motions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !motion) {
    notFound();
  }

  // The form component now only handles UI and state, not data fetching
  return <EditMotionForm motion={motion as Motion} />;
}
