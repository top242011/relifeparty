// src/components/admin/LogoutButton.tsx
"use client";

import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

// FIX: Removed server-only import 'revalidatePath' which crashes client-side code.
// import { revalidatePath } from "next/cache"; 

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // router.refresh() is the correct way to trigger a re-fetch of server components
    // from a client component after an action.
    router.refresh(); 
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <LogOut className="mr-3 h-5 w-5" />
      ออกจากระบบ
    </button>
  );
}
