'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

type Policy = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
};

// FIX: Defined a specific type for the page's props to resolve potential build errors.
type EditPolicyPageProps = {
  params: { id: string };
};

export default function EditPolicyPage({ params }: EditPolicyPageProps) {
  const supabase = createClient();
  const router = useRouter();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (error) {
        console.error('Error fetching policy:', error);
      } else if (data) {
        setPolicy(data);
        setTitle(data.title);
        setDescription(data.description);
      }
      setLoading(false);
    };
    fetchPolicy();
  }, [params.id, supabase]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!policy) return;

    let fileUrl = policy.file_url;

    if (file) {
      try {
        fileUrl = await handleFileUpload(file);
      } catch(e) {
        alert('File upload failed. Please try again.');
        return;
      }
    }

    const { error } = await supabase
      .from('policies')
      .update({ title, description, file_url: fileUrl })
      .eq('id', params.id);

    if (error) {
      console.error('Error updating policy:', error);
      alert('Failed to update policy: ' + error.message);
    } else {
      router.push('/admin/policies');
      router.refresh();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!policy) {
    return <div>Policy not found.</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Edit Policy</h1>
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
          <p className="mb-2">Current file: <a href={policy.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{policy.file_url}</a></p>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          />
        </div>
        <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
          Update Policy
        </button>
      </form>
    </div>
  );
}
