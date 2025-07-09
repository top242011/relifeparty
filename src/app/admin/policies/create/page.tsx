'use client';

import { useState } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreatePolicyPage() {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (fileToUpload: File): Promise<string> => {
    const filePath = `policies/${Date.now()}_${fileToUpload.name}`;
    const { error } = await supabase.storage
      .from('policy-files')
      .upload(filePath, fileToUpload);
    
    if (error) {
        console.error('Upload error:', error.message);
        throw error;
    }

    const { data } = supabase.storage.from('policy-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // FIX: Changed event type from 'any' to a specific React FormEvent type.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      const fileUrl = await handleFileUpload(file);
      const { error } = await supabase
        .from('policies')
        .insert([{ title, description, file_url: fileUrl }]);

      if (error) {
        throw error;
      }

      router.push('/admin/policies');
      router.refresh();

    } catch (error) {
      console.error('Error creating policy:', error);
      if (error instanceof Error) {
        alert('Failed to create policy: ' + error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Create New Policy</h1>
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
          Create Policy
        </button>
      </form>
    </div>
  );
}
