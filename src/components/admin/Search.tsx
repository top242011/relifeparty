// src/components/admin/Search.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // ใช้ useDebouncedCallback เพื่อหน่วงเวลาการเรียกฟังก์ชัน 300ms
  // ทำให้ไม่เกิดการยิง request ไปที่ฐานข้อมูลทุกครั้งที่พิมพ์
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // กลับไปหน้า 1 ทุกครั้งที่มีการค้นหาใหม่
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="position-relative">
      <input
        className="form-control"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
    </div>
  );
}
