    // app/api/auth/signup/route.ts
    // API Route สำหรับลงทะเบียนผู้ใช้ใหม่ (ควรใช้โดย Admin เท่านั้น)
    // เพื่อความปลอดภัย ไม่ควรเปิดให้เข้าถึงได้จากภายนอกโดยไม่มีการตรวจสอบสิทธิ์ที่เหมาะสม

    import { NextResponse } from 'next/server';
    import { createAdminClient } from 'utils/supabase/server'; // ใช้ Absolute Path

    export async function POST(request: Request) {
      try {
        const { email, password } = await request.json();

        // สร้าง Supabase Client ที่มีสิทธิ์ Admin
        const supabaseAdmin = createAdminClient();

        // ลงทะเบียนผู้ใช้ใหม่
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // ตั้งค่าให้ยืนยันอีเมลอัตโนมัติ (สำหรับ Admin)
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

    // คุณสามารถเพิ่ม GET request สำหรับทดสอบได้ (แต่ไม่ควรมีใน Production)
    export async function GET() {
      return NextResponse.json({ message: 'This is the signup API route. Use POST to register a user.' });
    }
    