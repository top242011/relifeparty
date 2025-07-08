// components/admin/LogoutButton.tsx
'use client'; // ระบุว่าเป็น Client Component

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../utils/supabase/client'; // ใช้ Client-side Supabase Client

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login'); // Redirect ไปหน้า Login หลังจาก Logout
  };

  return (
    <button
      className="btn btn-outline-light ms-2"
      onClick={handleLogout}
    >
      ออกจากระบบ
    </button>
  );
}
