// src/app/admin/policies/page.tsx
import { createClient } from "../../../../utils/supabase/server";
import Link from "next/link";
import PoliciesTable from "@/components/admin/PoliciesTable";
import { PlusCircle } from "lucide-react";

export default async function PoliciesPage() {
  const supabase = createClient();
  // IMPORTANT: Ensure your table is named 'policies' in Supabase
  const { data: policies, error } = await supabase.from("policies").select("*");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการนโยบาย</h1>
        <Link
          href="/admin/policies/create"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          เพิ่มนโยบายใหม่
        </Link>
      </div>

      {error ? (
        <div className="p-4 text-center text-red-700 bg-red-100 rounded-lg">
          <p className="font-bold">เกิดข้อผิดพลาดในการดึงข้อมูล!</p>
          <p className="text-sm">
            กรุณาตรวจสอบว่าตาราง 'policies' มีอยู่ในฐานข้อมูลและตั้งค่า RLS
            ถูกต้องหรือไม่
          </p>
          <p className="mt-2 text-xs text-gray-600">({error.message})</p>
        </div>
      ) : (
        <PoliciesTable policies={policies || []} />
      )}
    </div>
  );
}
