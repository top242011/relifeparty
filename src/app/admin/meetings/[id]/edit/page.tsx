// This is now a Server Component. No 'use client' needed.
import type { JSX } from 'react';
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import EditMeetingForm from './EditMeetingForm';

export default async function EditMeetingPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const supabase = createClient();

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (meetingError || !meeting) {
    notFound();
  }

  const { data: files, error: filesError } = await supabase
    .from('meeting_files')
    .select('*')
    .eq('meeting_id', params.id);

  if (filesError) {
    console.error("Error fetching meeting files:", filesError);
  }

  return <EditMeetingForm initialMeeting={meeting} initialFiles={files || []} />;
}