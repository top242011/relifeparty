// src/app/admin/personnel/[id]/edit/EditPersonnelForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { updatePersonnel } from '@/lib/actions';
import type { FormState, Personnel, Committee } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import Image from 'next/image';
import Select from 'react-select';
import toast from 'react-hot-toast';

// Define the shape for react-select options
interface SelectOption {
  value: string;
  label: string;
}

// Props for our form component
interface EditPersonnelFormProps {
  personnel: Personnel;
  allCommittees: Committee[];
}

export default function EditPersonnelForm({ personnel, allCommittees }: EditPersonnelFormProps) {
  const initialState: FormState = { message: null, errors: {} };
  
  // Bind the personnel ID to the update action
  const updatePersonnelWithId = updatePersonnel.bind(null, personnel.id);
  const [state, dispatch] = useFormState(updatePersonnelWithId, initialState);
  
  // State to manage role checkboxes for disabling the position input
  const [isMp, setIsMp] = useState(personnel.is_mp);
  const [isExecutive, setIsExecutive] = useState(personnel.is_executive);

  // Show error toast if the form submission fails
  useEffect(() => {
    if (state.success === false && state.message) {
      toast.error(state.message);
    }
    // Success toast is handled by redirecting with a query param
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

          {/* Role Checkboxes */}
          <div className="mb-3">
            <label className="form-label">บทบาท (เลือกได้มากกว่า 1 ข้อ)</label>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_party_member" id="is_party_member" defaultChecked={personnel.is_party_member} />
              <label className="form-check-label" htmlFor="is_party_member">สมาชิกพรรค</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_mp" id="is_mp" defaultChecked={personnel.is_mp} onChange={(e) => setIsMp(e.target.checked)} />
              <label className="form-check-label" htmlFor="is_mp">ส.ส.</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_executive" id="is_executive" defaultChecked={personnel.is_executive} onChange={(e) => setIsExecutive(e.target.checked)} />
              <label className="form-check-label" htmlFor="is_executive">กรรมการบริหารพรรค</label>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="party_position" className="form-label">ตำแหน่งในพรรค</label>
            <input type="text" id="party_position" name="party_position" className="form-control" defaultValue={personnel.party_position || ''} />
          </div>

          <div className="mb-3">
            <label htmlFor="student_council_position" className="form-label">ตำแหน่งในสภานักศึกษา</label>
            <input type="text" id="student_council_position" name="student_council_position" className="form-control" defaultValue={personnel.student_council_position || ''} placeholder={!isMp && !isExecutive ? '-' : 'กรอกตำแหน่งในสภาฯ'} disabled={!isMp && !isExecutive} />
            <div className="form-text">
              กรอกตำแหน่งเฉพาะ ส.ส. หรือ กรรมการบริหารพรรค เท่านั้น (หากไม่มีข้อมูล ให้กรอก “-”)
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="faculty" className="form-label">คณะ</label>
              <input type="text" id="faculty" name="faculty" className="form-control" defaultValue={personnel.faculty || ''} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="year" className="form-label">ชั้นปี</label>
              <select id="year" name="year" className="form-select" defaultValue={personnel.year || ''}>
                <option value="">-- ไม่ระบุ --</option>
                <option value="1">ปี 1</option>
                <option value="2">ปี 2</option>
                <option value="3">ปี 3</option>
                <option value="4">ปี 4</option>
                <option value="5">ปี 5</option>
                <option value="6">ปี 6</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
                <label htmlFor="campus" className="form-label">สังกัดศูนย์</label>
                <select id="campus" name="campus" className="form-select" defaultValue={personnel.campus}>
                    <option value="Rangsit">รังสิต</option>
                    <option value="Tha Prachan">ท่าพระจันทร์</option>
                    <option value="Lampang">ลำปาง</option>
                </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="gender" className="form-label">เพศ</label>
              <select id="gender" name="gender" className="form-select" defaultValue={personnel.gender || 'not_specified'}>
                <option value="not_specified">-- ไม่ระบุ --</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">ประวัติโดยย่อ</label>
            <textarea className="form-control" id="bio" name="bio" rows={4} defaultValue={personnel.bio || ''}></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="committees" className="form-label">สังกัดคณะกรรมาธิการ</label>
            <Select id="committees" name="committees" isMulti options={committeeOptions} defaultValue={defaultSelectedCommittees} classNamePrefix="select" />
          </div>

          <div className="mb-3">
            <label htmlFor="image_file" className="form-label">เปลี่ยนรูปภาพ (ถ้าต้องการ)</label>
            {personnel.image_url && 
              <div className="mb-2"><Image src={personnel.image_url} alt={`รูปปัจจุบันของ ${personnel.name}`} width={100} height={100} className="rounded" style={{objectFit: 'cover'}} onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=No+Image'; }}/></div>
            }
            <input type="file" id="image_file" name="image_file" className="form-control" accept="image/png, image/jpeg, image/webp"/>
            <div className="form-text">หากไม่เลือกไฟล์ จะยังคงใช้รูปภาพเดิม</div>
          </div>
          
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="is_active" name="is_active" defaultChecked={personnel.is_active} />
            <label className="form-check-label" htmlFor="is_active">ดำรงตำแหน่ง (Active)</label>
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
