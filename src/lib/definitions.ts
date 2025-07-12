// src/lib/definitions.ts

/**
 * ไฟล์นี้ใช้สำหรับเก็บ TypeScript Type Definitions ที่ใช้ร่วมกันในโปรเจกต์
 */

// Type สำหรับข้อมูลนโยบาย (Policy) ที่ดึงมาจาก Supabase
// ควรปรับแก้ตามโครงสร้างตารางจริงของคุณ
export type Policy = {
  id: string;
  title: string | null;
  description: string | null;
  created_at: string;
};

// Type สำหรับ State ที่ใช้ใน useFormState Hook
// เพื่อจัดการกับ Error และ Message ที่ส่งกลับมาจาก Server Action
export type FormState = {
  errors?: {
    title?: string[];
    description?: string[];
    // เพิ่ม field อื่นๆ ตามต้องการ
  };
  message?: string | null;
};
