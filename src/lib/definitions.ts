// src/lib/definitions.ts

/**
 * This file is the central repository for all TypeScript Type Definitions used in the project.
 */

// Type for the state of a form used with the useFormState Hook
export type FormState = {
  errors?: {
    // All properties here should be optional arrays of strings
    // to match the structure from Zod's .flatten().fieldErrors
    id?: string[];
    name?: string[];
    title?: string[];
    description?: string[];
    eventDate?: string[];
    content?: string[];
    publishDate?: string[];
    party_position?: string[];
    student_council_position?: string[];
    bio?: string[];
    image_url?: string[];
    is_active?: string[];
    is_party_member?: string[];
    is_mp?: string[];
    is_executive?: string[];
    campus?: string[];
    topic?: string[];
    scope?: string[];
    details?: string[];
    meeting_id?: string[];
    proposer_id?: string[];
    
    // Index signature to allow for any other string key
    [key: string]: string[] | undefined;
  };
  message?: string | null;
  success?: boolean; // Added for toast notifications
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

// UPDATED: Personnel type to reflect new schema
export type Personnel = {
    id: string;
    name: string;
    party_position: string | null; // New field
    student_council_position: string | null; // Renamed field
    bio: string | null;
    image_url: string | null;
    is_active: boolean;
    is_party_member: boolean; // New role field
    is_mp: boolean; // New role field
    is_executive: boolean; // New role field
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

export type AttendanceRecordWithPersonnel = {
  personnel_id: string;
  status: 'เข้าประชุม' | 'ลา' | 'ขาด';
  personnel: {
    name: string;
    campus: string;
  };
};

// --- Types for Dashboard ---

export type DashboardCardData = {
  personnelCount: number;
  policiesCount: number;
  newsCount: number;
  eventsCount: number;
  meetingCount: number;
  motionCount: number;
  attendanceRate: number;
};

// NEW: Type for the new personnel stats dashboard
export type PersonnelStats = {
  total: number;
  members: number;
  mps: number;
  executives: number;
  byCampus: { name: string; value: number }[];
};


export type LatestEvent = {
  id: string;
  title: string;
  location: string | null;
  eventDate: string;
};
