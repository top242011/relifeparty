// src/lib/definitions.ts

/**
 * This file is the central repository for all TypeScript Type Definitions used in the project.
 */

// Type for the state of a form used with the useFormState Hook
export type FormState = {
  errors?: {
    // General
    id?: string[];
    name?: string[];
    title?: string[];
    description?: string[];
    
    // Event specific
    eventDate?: string[];

    // News specific
    content?: string[];
    publishDate?: string[];
    
    // Personnel specific
    position?: string[];

    // Motion specific
    details?: string;

  };
  message?: string | null;
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

// Type for Meetings page
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

// Type for Motions page
export type Motion = {
  id: string; 
  title: string;
  details: string | null;
  proposer_id: string | null;
  meeting_id: string | null;
  result: string | null;
  created_at: string;
};
