// src/lib/data.ts
import { createClient } from '../../utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10; // กำหนดจำนวนรายการต่อหน้า

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

// ฟังก์ชันสำหรับคำนวณจำนวนหน้าทั้งหมด
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
