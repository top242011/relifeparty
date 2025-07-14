// src/app/admin/personnel/[id]/edit/EditPersonnelForm.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updatePersonnel } from '@/lib/actions';
import type { FormState, Personnel, Committee } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import Image from 'next/image';
import Select, { MultiValue } from 'react-select';
import toast from 'react-hot-toast';

// Define the shape for react-select options
interface SelectOption {
  value: string;
  label: string;
}

// Props for our new form component
interface EditPersonnelFormProps {
  personnel: Personnel;
  allCommittees: Committee[];
}

export default function EditPersonnelForm({ personnel, allCommittees }: EditPersonnelFormProps) {
  const initialState: FormState = { message: null, errors: {} };
  
  // Bind the personnel ID to the update action
  const updatePersonnelWithId = updatePersonnel.bind(null, personnel.id);
  const [state, dispatch] = useFormState(updatePersonnelWithId, initialState);

  // useEffect to show toast messages
  useEffect(() => {
    if (state.success === false && state.message) {
      toast.error(state.message);
    }
    // Success case is handled by redirecting in the server action
  }, [state]);

  // Map committees data to the format required by react-select
  const committeeOptions: SelectOption[] = allCommittees.map(c => ({ 
    value: c.id, 
    label: c.name 
  }));

  // Determine the default selected committees
  const defaultSelectedCommittees = committeeOptions.filter(
    option => personnel.committees?.includes(option.value)
  );

  return (
    <>
      <h1 className="mb-4">แก้ไขข้อมูลบุคลากร</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
            <input type="text" id="name" name="name" className={`form-control ${state.errors?.name ? 'is-invalid' : ''}`} defaultValue={personnel.name} required />
            {state.errors?.name && <div className="invalid-feedback">{state.errors.name[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="position" className="form-label">ตำแหน่ง</label>
            <input type="text" id="position" name="position" className={`form-control ${state.errors?.position ? 'is-invalid' : ''}`} defaultValue={personnel.position} required />
            {state.errors?.position && <div className="invalid-feedback">{state.errors.position[0]}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="role" className="form-label">บทบาท</label>
              <select id="role" name="role" className="form-select" defaultValue={personnel.role}>
                <option value="MP">ส.ส.</option>
                <option value="Executive">กรรมการบริหาร</option>
                <option value="Both">เป็นทั้งสองอย่าง</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="campus" className="form-label">สังกัดศูนย์</label>
              <select id="campus" name="campus" className="form-select" defaultValue={personnel.campus}>
                <option value="Rangsit">รังสิต</option>
                <option value="Tha Prachan">ท่าพระจันทร์</option>
                <option value="Lampang">ลำปาง</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">ประวัติโดยย่อ</label>
            <textarea className="form-control" id="bio" name="bio" rows={4} defaultValue={personnel.bio || ''}></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="committees" className="form-label">สังกัดคณะกรรมาธิการ</label>
            <Select
              id="committees"
              name="committees"
              isMulti
              options={committeeOptions}
              defaultValue={defaultSelectedCommittees}
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="image_file" className="form-label">เปลี่ยนรูปภาพ (ถ้าต้องการ)</label>
            {personnel.image_url && 
              <div className="mb-2">
                <Image 
                  src={personnel.image_url} 
                  alt={`รูปปัจจุบันของ ${personnel.name}`} 
                  width={100} 
                  height={100} 
                  className="rounded" 
                  style={{objectFit: 'cover'}} 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=No+Image'; }}
                />
              </div>
            }
            <input 
              type="file" 
              id="image_file" 
              name="image_file" 
              className="form-control"
              accept="image/png, image/jpeg, image/webp"
            />
            <div className="form-text">
              หากไม่เลือกไฟล์ จะยังคงใช้รูปภาพเดิม
            </div>
          </div>
          
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="is_active" 
              name="is_active"
              defaultChecked={personnel.is_active} 
            />
            <label className="form-check-label" htmlFor="is_active">
              ดำรงตำแหน่ง (Active)
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกการแก้ไข" />
          </div>
        </form>
      </div>
    </>
  );
}
