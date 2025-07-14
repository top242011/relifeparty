// src/lib/data.ts
import { createClient } from '../../utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import type { Committee, Event, Personnel, AttendanceRecordWithPersonnel, DashboardCardData, LatestEvent, PersonnelStats } from './definitions';

const ITEMS_PER_PAGE = 10;

// --- Functions for Personnel ---

export async function fetchFilteredPersonnel(
  query: string,
  currentPage: number,
  campus: string | null,
  committeeId: string | null,
  role: string | null,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) {
  noStore();
  const supabase = createClient();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let supabaseQuery = supabase
      .from('personnel')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,party_position.ilike.%${query}%,student_council_position.ilike.%${query}%`);
    }
    if (campus) {
      supabaseQuery = supabaseQuery.eq('campus', campus);
    }
    if (committeeId) {
      supabaseQuery = supabaseQuery.contains('committees', [committeeId]);
    }
    if (role) {
      if (role === 'is_party_member') supabaseQuery = supabaseQuery.eq('is_party_member', true);
      if (role === 'is_mp') supabaseQuery = supabaseQuery.eq('is_mp', true);
      if (role === 'is_executive') supabaseQuery = supabaseQuery.eq('is_executive', true);
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
    committeeId: string | null,
    role: string | null
) {
    noStore();
    const supabase = createClient();
    try {
        let supabaseQuery = supabase
            .from('personnel')
            .select('id', { count: 'exact', head: true });

        if (query) {
            supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,party_position.ilike.%${query}%,student_council_position.ilike.%${query}%`);
        }
        if (campus) {
            supabaseQuery = supabaseQuery.eq('campus', campus);
        }
        if (committeeId) {
            supabaseQuery = supabaseQuery.contains('committees', [committeeId]);
        }
        if (role) {
            if (role === 'is_party_member') supabaseQuery = supabaseQuery.eq('is_party_member', true);
            if (role === 'is_mp') supabaseQuery = supabaseQuery.eq('is_mp', true);
            if (role === 'is_executive') supabaseQuery = supabaseQuery.eq('is_executive', true);
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

export async function fetchPersonnelStats(): Promise<PersonnelStats> {
    noStore();
    const supabase = createClient();
    try {
        // --- FIXED: Added .eq('is_active', true) to filter only active personnel ---
        const { data, error } = await supabase
            .from('personnel')
            .select('is_party_member, is_mp, is_executive, campus')
            .eq('is_active', true); // This ensures we count the same set of people as the main dashboard.

        if (error) throw error;
        
        const total = data.length;
        const members = data.filter(p => p.is_party_member).length;
        const mps = data.filter(p => p.is_mp).length;
        const executives = data.filter(p => p.is_executive).length;

        const campusCounts = data.reduce((acc, p) => {
            acc[p.campus] = (acc[p.campus] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const campusMap: { [key: string]: string } = {
            'Rangsit': 'รังสิต',
            'Tha Prachan': 'ท่าพระจันทร์',
            'Lampang': 'ลำปาง',
        };

        const byCampus = Object.entries(campusCounts).map(([name, value]) => ({
            name: campusMap[name] || name,
            value,
        }));

        return { total, members, mps, executives, byCampus };

    } catch (error) {
        console.error('Database Error (fetchPersonnelStats):', error);
        throw new Error('Failed to fetch personnel stats.');
    }
}

// --- Functions for Dashboard ---

export async function fetchCardData(): Promise<DashboardCardData> {
  noStore();
  const supabase = createClient();
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

    if (personnelResult.error) throw new Error(`Personnel Error: ${personnelResult.error.message}`);
    if (policiesResult.error) throw new Error(`Policies Error: ${policiesResult.error.message}`);
    if (newsResult.error) throw new Error(`News Error: ${newsResult.error.message}`);
    if (eventsResult.error) throw new Error(`Events Error: ${eventsResult.error.message}`);
    if (meetingResult.error) throw new Error(`Meetings Error: ${meetingResult.error.message}`);
    if (motionResult.error) throw new Error(`Motions Error: ${motionResult.error.message}`);
    if (attendanceResult.error) throw new Error(`Attendance Error: ${attendanceResult.error.message}`);

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
    throw new Error(`Failed to fetch card data. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchLatestEvents(): Promise<LatestEvent[]> {
    noStore();
    const supabase = createClient();
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

// --- Function for Attendance Tracking Feature ---

export async function fetchAttendanceData(meetingId: string): Promise<AttendanceRecordWithPersonnel[]> {
  noStore();
  const supabase = createClient();
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

// --- Helper function to fetch all committees ---
export async function fetchAllCommittees(): Promise<Committee[]> {
    noStore();
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('committees')
            .select('*')
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
