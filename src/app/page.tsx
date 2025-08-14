// src/app/page.tsx
export const dynamic = 'force-dynamic';

import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is already logged in, redirect them to the dashboard.
  if (user) {
    return redirect("/admin/dashboard");
  }

  // FIX: Removed the redundant <html> and <body> tags.
  // The root layout at src/app/layout.tsx already provides these.
  // This page should only return the content to be placed inside the body.
  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Relife Party Admin
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Please log in to access the management dashboard.
        </p>
        <Link
          href="/admin/login"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
