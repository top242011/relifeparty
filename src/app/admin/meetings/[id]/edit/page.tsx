// src/app/admin/meetings/[id]/edit/page.tsx
import EditMeetingForm from './EditMeetingForm';
import type { JSX } from 'react';

// Define a simple, unambiguous type for the page props.
type PageProps = {
  params: { id: string };
};

// This is no longer an async component.
// Its only job is to render the client component that will handle everything.
export default function EditMeetingPage({ params }: PageProps): JSX.Element {
  // Pass the meeting ID to the form component.
  return <EditMeetingForm meetingId={params.id} />;
}
