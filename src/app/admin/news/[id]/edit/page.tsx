// src/app/admin/news/[id]/edit/page.tsx
// This is the Server Component responsible for data fetching.

import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditNewsForm from './EditNewsForm'; // We will pass data to this client component
import type { News } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !news) {
    notFound();
  }

  // The form component now only handles UI and state, not data fetching
  return <EditNewsForm news={news as News} />;
}
