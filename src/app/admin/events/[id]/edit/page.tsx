// src/app/admin/events/[id]/edit/page.tsx
import { cookies } from 'next/headers';
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditEventForm from './EditEventForm';
import type { Event } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { id } = params;

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  return <EditEventForm event={event as Event} />;
}
