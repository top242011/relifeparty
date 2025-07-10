// src/components/admin/LogoutButton.tsx
import { createClient } from "../../../utils/supabase/client";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh(); // Ensure the page state is fully cleared
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
