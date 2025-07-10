// src/app/admin/policies/create/page.tsx
import { createClient } from "../../../../../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function CreatePolicyPage() {
  const createPolicy = async (formData: FormData) => {
    "use server";
    const supabase = createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    let fileUrl = "";
    // Handle file upload
    if (file && file.size > 0) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from("policies") // Make sure you have a 'policies' bucket in Supabase Storage
        .upload(`public/${Date.now()}_${file.name}`, file);

      if (fileError) {
        console.error("File upload error:", fileError);
        // Handle error appropriately
        return;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("policies")
        .getPublicUrl(fileData.path);
      
      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("policies")
      .insert([{ title, description, file_url: fileUrl }]);

    if (error) {
      console.error("Insert error:", error);
      // Handle error appropriately
      return;
    }

    revalidatePath("/admin/policies");
    redirect("/admin/policies");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        สร้างนโยบายใหม่
      </h1>
      <div className="max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <form action={createPolicy} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              หัวข้อ
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              คำอธิบาย
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              ไฟล์เอกสาร (ถ้ามี)
            </label>
            <input
              type="file"
              name="file"
              id="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
