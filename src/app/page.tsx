'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

// FIX: Defined a specific type for news articles instead of using 'any[]'.
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function HomePage() {
  const supabase = createClient();
  // FIX: Used the NewsArticle[] type for the state.
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setNews(data);
      }
      setLoading(false);
    };
    fetchNews();
  }, [supabase]);

  return (
    <div className="container p-4 mx-auto">
      <header className="py-10 text-center bg-gray-100 rounded-lg">
        <h1 className="text-4xl font-bold text-gray-800">พรรคคืนชีพ</h1>
        {/* FIX: Escaped double quotes to prevent JSX parsing errors. */}
        <p className="mt-4 text-lg text-gray-600">&quot;พรรคการเมืองที่มุ่งมั่นสร้างสรรค์สังคมที่ดีขึ้นสำหรับทุกคน&quot;</p>
      </header>

      <main className="mt-10">
        <h2 className="mb-6 text-3xl font-bold text-center">ข่าวสารล่าสุด</h2>
        {loading ? (
          <div className="text-center">Loading news...</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <div key={item.id} className="overflow-hidden bg-white rounded-lg shadow-lg">
                <img src={item.image_url} alt={item.title} className="object-cover w-full h-48" />
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-700">{item.content.substring(0, 100)}...</p>
                  <Link href={`/news/${item.id}`} className="inline-block mt-4 font-bold text-blue-600 hover:underline">
                    อ่านต่อ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
