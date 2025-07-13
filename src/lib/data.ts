// src/lib/data.ts
import { createClient } from '../../utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10; // กำหนดจำนวนรายการต่อหน้า

// --- ฟังก์ชันเดิมสำหรับการค้นหาและแบ่งหน้าบุคลากร ---

// ฟังก์ชันสำหรับดึงข้อมูลบุคลากรแบบมีเงื่อนไข (ค้นหาและแบ่งหน้า)
export async function fetchFilteredPersonnel(
  query: string,
  currentPage: number,
) {
  noStore(); // ป้องกันการ Caching ของข้อมูลนี้
  const supabase = createClient();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let supabaseQuery = supabase
      .from('personnel')
      .select('*', { count: 'exact' }) // ดึงข้อมูลพร้อมกับนับจำนวนทั้งหมด
      .order('name', { ascending: true })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (query) {
      // ใช้ 'ilike' สำหรับการค้นหาแบบ case-insensitive ในคอลัมน์ name และ position
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

// ฟังก์ชันสำหรับคำนวณจำนวนหน้าทั้งหมดของบุคลากร
export async function fetchPersonnelPages(query: string) {
    noStore();
    const supabase = createClient();
    try {
        let supabaseQuery = supabase
            .from('personnel')
            .select('id', { count: 'exact', head: true }); // นับจำนวนแถวโดยไม่ดึงข้อมูล

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


// --- ฟังก์ชันใหม่ที่เพิ่มเข้ามาสำหรับ Dashboard ---

// ฟังก์ชันสำหรับดึงข้อมูลสรุปสำหรับแสดงบนการ์ด
export async function fetchCardData() {
  noStore();
  const supabase = createClient();
  try {
    // ดึงข้อมูลการนับจำนวนพร้อมกันทั้งหมดเพื่อประสิทธิภาพสูงสุด
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

// ฟังก์ชันสำหรับดึง 5 กิจกรรมล่าสุด
export async function fetchLatestEvents() {
    noStore();
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('eventDate', { ascending: false }) // เรียงจากวันที่ล่าสุดไปเก่าสุด
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
