// src/app/admin/meetings/[id]/edit/page.tsx
import EditMeetingForm from './EditMeetingForm';

export default async function EditMeetingPage({ params }: { params: { id: string } }) {
  return <EditMeetingForm meetingId={params.id} />;
}