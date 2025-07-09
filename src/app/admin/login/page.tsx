// src/app/admin/login/page.tsx
import { createClient } from "../../../../utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // 1. Import revalidatePath

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/admin/login?message=Could not authenticate user");
    }

    // 2. เพิ่ม revalidatePath เพื่อสั่งให้ Next.js อัปเดต layout และหน้าต่างๆ ที่เกี่ยวข้อง
    // ทำให้ layout อ่านสถานะ login ใหม่ก่อนที่จะ redirect
    revalidatePath("/admin", "layout");
    
    return redirect("/admin/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={signIn}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 text-white">
          Sign In
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
