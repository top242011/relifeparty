// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
// 🔽 1. เปลี่ยนชื่อฟังก์ชันที่ import
import { createSupabaseAdminClient } from 'utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 🔽 2. เปลี่ยนชื่อฟังก์ชันที่เรียกใช้
    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Error signing up user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User registered successfully!', user: data.user }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error during signup:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}