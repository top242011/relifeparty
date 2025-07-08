// src/components/admin/DeletePolicyButton.tsx
'use client';

import { getSupabaseBrowserClient } from 'utils/supabase/client';

export default function DeletePolicyButton({ policyId }: { policyId: string }) {
  const handleDelete = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบนโยบายนี้?')) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyId);

      if (error) {
        alert(`เกิดข้อผิดพลาดในการลบนโยบาย: ${error.message}`);
      } else {
        alert('ลบนโยบายสำเร็จ');
        window.location.reload(); // รีเฟรชหน้าเพื่ออัปเดตรายการ
      }
    }
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      ลบ
    </button>
  );
}