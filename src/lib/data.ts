// src/lib/data.ts
import { createClient } from '../../utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import type { Committee, Event, Personnel, AttendanceRecordWithPersonnel, DashboardCardData, LatestEvent } from './definitions';

const ITEMS_PER_PAGE = 10;

// --- Functions for Personnel Search, Filter & Pagination ---

export async function fetchFilteredPersonnel(
  query: string,
  currentPage: number,
  campus: string | null,
  committeeId: string | null,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) {
  noStore();
  const supabase = createClient(); // Create client inside the function
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let supabaseQuery = supabase
      .from('personnel')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,position.ilike.%${query}%`);
    }
    if (campus) {
      supabaseQuery = supabaseQuery.eq('campus', campus);
    }
    if (committeeId) {
      supabaseQuery = supabaseQuery.contains('committees', [committeeId]);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database Error (fetchFilteredPersonnel):', error);
      throw new Error('Failed to fetch personnel.');
    }

    return { data: data as Personnel[], count: count ?? 0 };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch personnel.');
  }
}

export async function fetchPersonnelPages(
    query: string,
    campus: string | null,
    committeeId: string | null
) {
    noStore();
    const supabase = createClient(); // Create client inside the function
    try {
        let supabaseQuery = supabase
            .from('personnel')
            .select('id', { count: 'exact', head: true });

        if (query) {
            supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,position.ilike.%${query}%`);
        }
        if (campus) {
            supabaseQuery = supabaseQuery.eq('campus', campus);
        }
        if (committeeId) {
            supabaseQuery = supabaseQuery.contains('committees', [committeeId]);
        }
        
        const { count, error } = await supabaseQuery;

        if (error) {
            console.error('Database Error (fetchPersonnelPages):', error);
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

export async function fetchCardData(): Promise<DashboardCardData> {
  noStore();
  const supabase = createClient(); // Create client inside the function
  try {
    const [
      personnelResult,
      policiesResult,
      newsResult,
      eventsResult,
      meetingResult,
      motionResult,
      attendanceResult
    ] = await Promise.all([
      supabase.from('personnel').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('policies').select('id', { count: 'exact', head: true }),
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('meetings').select('id', { count: 'exact', head: true }),
      supabase.from('motions').select('id', { count: 'exact', head: true }),
      supabase.from('attendance_records').select('status')
    ]);

    // Check for errors in each result
    if (personnelResult.error) throw new Error(`Personnel Error: ${personnelResult.error.message}`);
    if (policiesResult.error) throw new Error(`Policies Error: ${policiesResult.error.message}`);
    if (newsResult.error) throw new Error(`News Error: ${newsResult.error.message}`);
    if (eventsResult.error) throw new Error(`Events Error: ${eventsResult.error.message}`);
    if (meetingResult.error) throw new Error(`Meetings Error: ${meetingResult.error.message}`);
    if (motionResult.error) throw new Error(`Motions Error: ${motionResult.error.message}`);
    if (attendanceResult.error) throw new Error(`Attendance Error: ${attendanceResult.error.message}`);

    // Calculate Attendance Rate
    const totalRecords = attendanceResult.data?.length || 0;
    const presentRecords = attendanceResult.data?.filter(r => r.status === 'เข้าประชุม').length || 0;
    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    return {
      personnelCount: personnelResult.count ?? 0,
      policiesCount: policiesResult.count ?? 0,
      newsCount: newsResult.count ?? 0,
      eventsCount: eventsResult.count ?? 0,
      meetingCount: meetingResult.count ?? 0,
      motionCount: motionResult.count ?? 0,
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
    };
  } catch (error) {
    console.error('Database Error (fetchCardData):', error);
    // Re-throw the specific error to make debugging easier during build
    throw new Error(`Failed to fetch card data. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchLatestEvents(): Promise<LatestEvent[]> {
    noStore();
    const supabase = createClient(); // Create client inside the function
    try {
        const { data, error } = await supabase
            .from('events')
            .select('id, title, location, eventDate')
            .order('eventDate', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Database Error (fetchLatestEvents):', error);
            throw new Error('Failed to fetch latest events.');
        }
        return data as LatestEvent[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch latest events.');
    }
}

// --- Function for Attendance Tracking Feature (Scope-aware) ---

export async function fetchAttendanceData(meetingId: string): Promise<AttendanceRecordWithPersonnel[]> {
  noStore();
  const supabase = createClient(); // Create client inside the function
  try {
    const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('scope')
        .eq('id', meetingId)
        .single();
    
    if(meetingError) throw new Error(`Could not fetch meeting scope: ${meetingError.message}`);
    const meetingScope = meetingData.scope;

    let personnelQuery = supabase
      .from('personnel')
      .select('id, name, campus')
      .eq('is_active', true);

    if (meetingScope !== 'General Assembly') {
        personnelQuery = personnelQuery.eq('campus', meetingScope);
    }
    
    personnelQuery = personnelQuery.order('name');

    const { data: allPersonnel, error: personnelError } = await personnelQuery;
    if (personnelError) throw new Error(`Could not fetch personnel for meeting: ${personnelError.message}`);

    const { data: existingRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('personnel_id, status')
      .eq('meeting_id', meetingId);
    
    if (recordsError) throw new Error(`Could not fetch attendance records: ${recordsError.message}`);

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
    console.error('Database Error (fetchAttendanceData):', error);
    throw new Error(`Failed to fetch attendance data. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- Helper function to fetch all committees for filter dropdowns ---
export async function fetchAllCommittees(): Promise<Committee[]> {
    noStore();
    const supabase = createClient(); // Create client inside the function
    try {
        const { data, error } = await supabase
            .from('committees')
            .select('id, name')
            .order('name', { ascending: true });
        if (error) {
          console.error('Database Error (fetchAllCommittees):', error);
          throw error;
        };
        return data as Committee[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch committees.');
    }
}
