// src/lib/data.ts
import { createClient } from '../../utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import type { AttendanceRecordWithPersonnel } from './definitions';

const ITEMS_PER_PAGE = 10;

// --- Functions for Personnel Search & Pagination ---

export async function fetchFilteredPersonnel(
  query: string,
  currentPage: number,
) {
  noStore();
  const supabase = createClient();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let supabaseQuery = supabase
      .from('personnel')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,position.ilike.%${query}%`);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch personnel.');
    }

    return { data, count: count ?? 0 };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch personnel.');
  }
}

export async function fetchPersonnelPages(query: string) {
    noStore();
    const supabase = createClient();
    try {
        let supabaseQuery = supabase
            .from('personnel')
            .select('id', { count: 'exact', head: true });

        if (query) {
            supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,position.ilike.%${query}%`);
        }
        
        const { count, error } = await supabaseQuery;

        if (error) {
            console.error('Database Error:', error);
            throw new Error('Failed to fetch total number of personnel.');
        }

        const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of personnel.');
    }
}

// --- Functions for Dashboard ---

export async function fetchCardData() {
  noStore();
  const supabase = createClient();
  try {
    const [
      { count: personnelCount },
      { count: policiesCount },
      { count: newsCount },
      { count: eventsCount },
    ] = await Promise.all([
      supabase.from('personnel').select('id', { count: 'exact', head: true }),
      supabase.from('policies').select('id', { count: 'exact', head: true }),
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true })
    ]);

    return {
      personnelCount: personnelCount ?? 0,
      policiesCount: policiesCount ?? 0,
      newsCount: newsCount ?? 0,
      eventsCount: eventsCount ?? 0,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchLatestEvents() {
    noStore();
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('eventDate', { ascending: false })
            .limit(5);

        if (error) {
            throw new Error('Failed to fetch latest events.');
        }
        return data;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch latest events.');
    }
}

// --- Function for Attendance Tracking Feature ---

export async function fetchAttendanceData(meetingId: string) {
  noStore();
  const supabase = createClient();
  try {
    const { data: allPersonnel, error: personnelError } = await supabase
      .from('personnel')
      .select('id, name, campus')
      .eq('is_active', true)
      .order('name');

    if (personnelError) throw personnelError;

    const { data: existingRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('personnel_id, status')
      .eq('meeting_id', meetingId);
    
    if (recordsError) throw recordsError;

    const attendanceData = allPersonnel.map(person => {
      const record = existingRecords.find(r => r.personnel_id === person.id);
      return {
        personnel_id: person.id,
        status: record?.status || 'ขาด',
        personnel: {
          name: person.name,
          campus: person.campus,
        },
      };
    });

    return attendanceData as AttendanceRecordWithPersonnel[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch attendance data.');
  }
}
