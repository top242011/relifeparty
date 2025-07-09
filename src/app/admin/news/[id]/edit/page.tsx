'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

type News = {
  id: string;
  title: string;
  content: string;
  image_url: string;
};

// FIX: Aligned the props type with Next.js's expected PageProps structure.
type PageProps = {
  params: { id: string };
};

export default function EditNewsPage({ params }: PageProps) {
  const supabase = createClient();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (error) {
        console.error('Error fetching news:', error);
      } else if (data) {
        setNews(data);
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    };
    fetchNews();
  }, [params.id, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (fileToUpload: File) => {
    const filePath = `news/${Date.now()}_${fileToUpload.name}`;
    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, fileToUpload);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!news) return;

    let imageUrl = news.image_url;

    if (file) {
      try {
        imageUrl = await handleFileUpload(file);
      } catch (error) {
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('news')
      .update({ title, content, image_url: imageUrl })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating news:', updateError);
      alert('Failed to update news: ' + updateError.message);
    } else {
      router.push('/admin/news');
      router.refresh();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!news) {
    return <div>News not found.</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Edit News</h1>
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
          <label className="block mb-2 text-sm font-bold text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">Image</label>
          {news.image_url && <img src={news.image_url} alt={title} className="w-32 h-32 mb-4" />}
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          />
        </div>
        <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
          Update News
        </button>
      </form>
    </div>
  );
}
