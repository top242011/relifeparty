// This is now a Server Component. No 'use client' needed.
import type { JSX } from 'react';
import { createClient } from '../../../../../../utils/supabase/server'; // Use the server client
import { notFound } from 'next/navigation';
import EditMeetingForm from './EditMeetingForm'; // Import the new Client Component

// Fetch data on the server
export default async function EditMeetingPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const supabase = await createClient();

  // Fetch the meeting details
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .single();

  // If meeting not found or error, show 404 page
  if (meetingError || !meeting) {
    notFound();
  }

  // Fetch associated files
  const { data: files, error: filesError } = await supabase
    .from('meeting_files')
    .select('*')
    .eq('meeting_id', params.id);

  if (filesError) {
    console.error("Error fetching meeting files:", filesError);
    // Decide how to handle this - maybe show an error message or proceed with empty files
  }

  // Render the Client Component and pass the fetched data as props
  return <EditMeetingForm initialMeeting={meeting} initialFiles={files || []} />;
}
