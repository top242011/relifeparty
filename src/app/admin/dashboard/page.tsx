// src/app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../../utils/supabase/client'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || 'Admin')
    }
    fetchUser()
  }, [supabase])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">Admin Dashboard</h1>
        <p className="mt-4 text-dark-blue">
          ยินดีต้อนรับ, {userEmail}!
        </p>
        <p>คุณได้เข้าสู่ระบบเรียบร้อยแล้ว</p>
      </main>
    </div>
  )
}
