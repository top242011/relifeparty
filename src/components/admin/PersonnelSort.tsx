// src/components/admin/PersonnelSort.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import type { Committee } from '@/lib/definitions';

export default function PersonnelSort({ committees }: { committees: Committee[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  }
  
  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    const [sortBy, sortOrder] = value.split('-');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    replace(`${pathname}?${params.toString()}`);
  }

  const currentSort = `${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`;

  return (
    <div className="d-flex justify-content-end gap-2">
      <select 
        className="form-select form-select-sm" 
        style={{width: '180px'}}
        onChange={(e) => handleFilterChange('campus', e.target.value)}
        defaultValue={searchParams.get('campus') || ''}
      >
        <option value="">ทุกศูนย์</option>
        <option value="Rangsit">รังสิต</option>
        <option value="Tha Prachan">ท่าพระจันทร์</option>
        <option value="Lampang">ลำปาง</option>
      </select>
      
      <select 
        className="form-select form-select-sm" 
        style={{width: '220px'}}
        onChange={(e) => handleFilterChange('committeeId', e.target.value)}
        defaultValue={searchParams.get('committeeId') || ''}
      >
        <option value="">ทุกคณะกรรมาธิการ</option>
        {committees.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select 
        className="form-select form-select-sm" 
        style={{width: '180px'}}
        onChange={(e) => handleSortChange(e.target.value)}
        value={currentSort}
      >
        <option value="name-asc">เรียงตามชื่อ (ก-ฮ)</option>
        <option value="name-desc">เรียงตามชื่อ (ฮ-ก)</option>
        <option value="position-asc">เรียงตามตำแหน่ง (ก-ฮ)</option>
        <option value="position-desc">เรียงตามตำแหน่ง (ฮ-ก)</option>
      </select>
    </div>
  );
}
