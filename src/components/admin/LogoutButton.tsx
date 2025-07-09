'use client';

import { createClient } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  // FIX: The 'router' variable is now used to redirect the user after logout.
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect to the login page and refresh the application state
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
      Logout
    </button>
  );
}
