'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import Link from 'next/link';
// FIX: Imported the next/image component
import Image from 'next/image';
import DeleteButton from '@/components/admin/DeleteButton';

type Personnel = {
  id: string;
  name: string;
  position: string;
  image_url: string;
  created_at: string;
};

type SortConfig = {
  key: keyof Personnel | null;
  direction: 'ascending' | 'descending';
};

export default function PersonnelPage() {
  const supabase = createClient();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching personnel:', error);
      } else {
        setPersonnel(data);
      }
      setLoading(false);
    };
    fetchPersonnel();
  }, [supabase]);

  const sortedItems = useMemo(() => {
    // FIX: Changed 'let' to 'const' as sortableItems is not reassigned.
    const sortableItems = [...personnel];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof Personnel;
        if (a[key]! < b[key]!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[key]! > b[key]!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [personnel, sortConfig]);

  const requestSort = (key: keyof Personnel) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Personnel) => {
    if (sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Personnel</h1>
        <Link href="/admin/personnel/create" className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
          Add New Personnel
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">
                <button onClick={() => requestSort('name')}>
                  Name {getSortIndicator('name')}
                </button>
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">
                <button onClick={() => requestSort('position')}>
                  Position {getSortIndicator('position')}
                </button>
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((person) => (
              <tr key={person.id}>
                <td className="flex items-center px-6 py-4 whitespace-nowrap">
                  {/* FIX: Replaced <img> with next/image <Image> for optimization */}
                  <Image
                    src={person.image_url || '/default-avatar.png'}
                    alt={person.name}
                    width={40}
                    height={40}
                    className="object-cover w-10 h-10 rounded-full"
                  />
                  <span className="ml-4">{person.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{person.position}</td>
                <td className="flex px-6 py-4 space-x-2 whitespace-nowrap">
                  <Link href={`/admin/personnel/${person.id}/edit`} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Edit
                  </Link>
                  <DeleteButton recordId={person.id} tableName="personnel" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
