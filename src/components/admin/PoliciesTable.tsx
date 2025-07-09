'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

type Policy = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
};

type SortConfig = {
  key: keyof Policy | null;
  direction: 'ascending' | 'descending';
};

export default function PoliciesTable() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'ascending' });

  useEffect(() => {
    const fetchPolicies = async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching policies:', error);
      } else {
        setPolicies(data);
      }
      setLoading(false);
    };

    fetchPolicies();
  }, [supabase]);

  const sortedItems = useMemo(() => {
    const sortableItems = [...policies];
    const key = sortConfig.key; // Capture the key
    
    // FIX: Check the captured key to ensure it's not null.
    // This allows TypeScript to correctly infer the type within the sort callback.
    if (key) {
      sortableItems.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [policies, sortConfig]);

  const requestSort = (key: keyof Policy) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Policy) => {
    if (sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">
              <button onClick={() => requestSort('title')}>
                Title {getSortIndicator('title')}
              </button>
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">
              <button onClick={() => requestSort('created_at')}>
                Date {getSortIndicator('created_at')}
              </button>
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b-2 border-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((policy) => (
            <tr key={policy.id}>
              <td className="px-6 py-4 whitespace-nowrap">{policy.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(policy.created_at).toLocaleDateString()}</td>
              <td className="flex px-6 py-4 space-x-2 whitespace-nowrap">
                <a href={policy.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                  View
                </a>
                <Link href={`/admin/policies/${policy.id}/edit`} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                  Edit
                </Link>
                <DeleteButton recordId={policy.id} tableName="policies" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
