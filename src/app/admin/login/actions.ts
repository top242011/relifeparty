// src/app/admin/login/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server' // 👈 1. Import ฟังก์ชันที่ถูกต้อง
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient() // 👈 2. เรียกใช้ฟังก์ชันที่ถูกต้อง

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/admin/login?message=Email and password are required')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/admin/login?message=Invalid credentials`)
  }

  // ไม่ต้องใช้ revalidatePath ที่นี่ redirect ก็เพียงพอแล้ว
  redirect('/admin/dashboard')
}