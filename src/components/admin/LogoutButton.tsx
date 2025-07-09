// src/components/admin/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../../../utils/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // ไม่ต้องทำอะไรเพิ่ม เพราะ AuthLayout จะจัดการ redirect ให้เอง
  }

  return (
    <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
      ออกจากระบบ
    </button>
  )
}
