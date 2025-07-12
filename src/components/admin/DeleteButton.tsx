// src/components/admin/DeleteButton.tsx

'use client';

import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useFormStatus } from 'react-dom';

interface DeleteButtonProps {
  formAction: (payload: FormData) => void;
  idToDelete: string;
}

/**
 * Component ปุ่มลบที่ใช้ Modal ของ react-bootstrap ในการยืนยัน
 * และใช้ Server Action ในการลบข้อมูล
 */
export default function DeleteButton({ formAction, idToDelete }: DeleteButtonProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Component ย่อยสำหรับปุ่มยืนยันใน Modal เพื่อใช้ useFormStatus
  const ConfirmDeleteButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button variant="danger" type="submit" disabled={pending}>
        {pending ? 'กำลังลบ...' : 'ยืนยันการลบ'}
      </Button>
    );
  };

  return (
    <>
      <Button variant="danger" onClick={handleShow} size="sm">
        ลบ
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <form action={formAction}>
            {/* Input ที่ซ่อนไว้เพื่อส่ง ID ไปกับ form data */}
            <input type="hidden" name="id" value={idToDelete} />

            <Modal.Header closeButton>
                <Modal.Title>ยืนยันการลบ</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    ยกเลิก
                </Button>
                <ConfirmDeleteButton />
            </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
