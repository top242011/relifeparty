// src/components/admin/PoliciesTable.tsx
import Link from "next/link";
import DeleteButton from "./DeleteButton"; // Assuming DeleteButton exists and works
import { FileText, Edit, Trash2 } from "lucide-react";

// Define the type for a single policy object
type Policy = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
};

export default function PoliciesTable({ policies }: { policies: Policy[] }) {
  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg shadow-md">
        <FileText className="w-16 h-16 text-gray-300" />
        <h3 className="mt-4 text-xl font-semibold text-gray-700">
          ยังไม่มีนโยบาย
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          เริ่มต้นโดยการเพิ่มนโยบายใหม่
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                หัวข้อ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                คำอธิบาย
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                วันที่สร้าง
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {policy.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {policy.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(policy.created_at).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-4">
                    <Link
                      href={`/admin/policies/${policy.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Link>
                    {/* Make sure the DeleteButton component is adapted for this */}
                    <DeleteButton recordId={policy.id} tableName="policies" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
