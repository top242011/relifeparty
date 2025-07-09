// src/components/admin/DeleteButton.tsx
'use client'

import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'

// รับ props เพิ่ม: ชื่อตาราง และ ID ของ record
interface DeleteButtonProps {
  recordId: string;
  tableName: 'policies' | 'news' | 'events' | 'personnel' | 'committees' | 'meetings' | 'motions'; // กำหนดประเภทของตารางที่รับได้
}

export default function DeleteButton({ recordId, tableName }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการนี้ออกจากตาราง ${tableName}?`)) {
      const supabase = createClient()
      const { error } = await supabase
        .from(tableName) // 👈 ใช้ชื่อตารางจาก props
        .delete()
        .eq('id', recordId) // 👈 ใช้ ID จาก props

      if (error) {
        alert(`เกิดข้อผิดพลาด: ${error.message}`)
      } else {
        alert('ลบรายการสำเร็จ')
        router.refresh() // รีเฟรชหน้าเพื่ออัปเดตข้อมูล
      }
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      ลบ
    </button>
  )
}
