// src/app/admin/layout.tsx
// ไฟล์นี้จะทำหน้าที่เป็น "ยาม" คอยป้องกันทุกหน้าใน /admin
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../../../utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    // สร้าง listener เพื่อคอยดักจับการเปลี่ยนแปลงสถานะ login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // คืนค่า subscription เพื่อยกเลิก listener เมื่อ component ถูกทำลาย
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    if (loading) return // ถ้าระบบกำลังโหลดข้อมูลผู้ใช้ ให้ข้ามไปก่อน

    // ถ้าระบบโหลดเสร็จแล้ว และไม่พบผู้ใช้ และผู้ใช้ไม่ได้อยู่ที่หน้า login
    if (!user && pathname !== '/admin/login') {
      // ให้ส่งกลับไปหน้า login
      router.push('/admin/login')
    }
  }, [user, loading, pathname, router])

  // ขณะกำลังโหลด ให้แสดงหน้า loading เพื่อป้องกันการกระพริบของ UI
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  // ถ้าผู้ใช้ล็อกอินแล้ว หรือกำลังอยู่ที่หน้า login ให้แสดงเนื้อหาของหน้านั้นๆ
  if (user || pathname === '/admin/login') {
    return <>{children}</>
  }

  // เป็น Fallback กรณีอื่นๆ
  return null
}
