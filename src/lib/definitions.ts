// src/lib/definitions.ts

// Type for the state of a form used with the useFormState Hook
export type FormState = {
  errors?: {
    id?: string[];
    name?: string[];
    title?: string[];
    description?: string[];
    eventDate?: string[];
    content?: string[];
    publishDate?: string[];
    position?: string[];
    details?: string;
  };
  message?: string | null;
  success?: boolean; // <-- เพิ่ม property นี้เพื่อบอกสถานะสำเร็จ
};

// --- Data Model Types ---

export type Policy = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type Committee = {
  id:string;
  name: string;
  description: string | null;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string | null;
};

export type News = {
    id: string;
    title: string;
    content: string;
    publishDate: string;
    imageUrl: string | null;
};

export type Personnel = {
    id: string;
    name: string;
    position: string;
    bio: string | null;
    image_url: string | null;
    is_active: boolean;
    role: string;
    campus: string;
    committees: string[] | null;
};

export type Meeting = {
    id: string;
    topic: string;
    date: string;
    description: string | null;
    scope: string;
};

export type MeetingFile = {
    id: string;
    meeting_id: string;
    file_name: string;
    file_url: string;
};

export type Motion = {
  id: string; 
  title: string;
  details: string | null;
  proposer_id: string | null;
  meeting_id: string | null;
  result: string | null;
  created_at: string;
};
