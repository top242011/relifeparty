// src/components/admin/SubmitButton.tsx

'use client';

import { useFormStatus } from 'react-dom';
import { Button } from 'react-bootstrap';

interface SubmitButtonProps {
  label?: string;
  pendingLabel?: string;
}

/**
 * Component ปุ่ม Submit ที่จะแสดงสถานะ "pending" (กำลังโหลด) อัตโนมัติ
 * เมื่อฟอร์มที่ครอบมันอยู่กำลังทำงาน (Server Action is running)
 */
export default function SubmitButton({ 
  label = 'บันทึก', 
  pendingLabel = 'กำลังบันทึก...' 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
