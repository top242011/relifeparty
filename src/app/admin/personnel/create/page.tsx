// src/app/admin/personnel/create/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { createPersonnel } from '@/lib/actions';
import type { FormState } from '@/lib/definitions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { createClient } from '../../../../../utils/supabase/client';
import toast from 'react-hot-toast';

interface SelectOption {
  value: string;
  label: string;
}

export default function CreatePersonnelPage() {
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPersonnel, initialState);
  const [committeeOptions, setCommitteeOptions] = useState<SelectOption[]>([]);

  // --- FIX: Add state to manage selected committees for react-select ---
  const [selectedCommittees, setSelectedCommittees] = useState<readonly SelectOption[]>([]);

  // State to manage role checkboxes to conditionally disable the position input
  const [isMp, setIsMp] = useState(false);
  const [isExecutive, setIsExecutive] = useState(false);

  // Fetch committees on component mount to populate the select input
  useEffect(() => {
    const fetchCommittees = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('committees')
        .select('id, name')
        .order('name');

      if (error) {
        toast.error('Could not load committees.');
      } else if (data) {
        setCommitteeOptions(data.map(c => ({ value: c.id, label: c.name })));
      }
    };
    fetchCommittees();
  }, []);

  // Show error toast if the form submission fails
  useEffect(() => {
    if (state.success === false && state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <>
      <h1 className="mb-4">เพิ่มบุคลากรใหม่</h1>
      <div className="card shadow-sm p-4">
        <form action={dispatch}>
          {/* ... other form fields ... */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
            <input type="text" id="name" name="name" className={`form-control ${state.errors?.name ? 'is-invalid' : ''}`} required />
            {state.errors?.name && <div className="invalid-feedback">{state.errors.name[0]}</div>}
          </div>

          {/* Role Checkboxes */}
          <div className="mb-3">
            <label className="form-label">บทบาท (เลือกได้มากกว่า 1 ข้อ)</label>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_party_member" id="is_party_member" defaultChecked />
              <label className="form-check-label" htmlFor="is_party_member">สมาชิกพรรค</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_mp" id="is_mp" onChange={(e) => setIsMp(e.target.checked)} />
              <label className="form-check-label" htmlFor="is_mp">ส.ส.</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_executive" id="is_executive" onChange={(e) => setIsExecutive(e.target.checked)} />
              <label className="form-check-label" htmlFor="is_executive">กรรมการบริหารพรรค</label>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="party_position" className="form-label">ตำแหน่งในพรรค</label>
            <input type="text" id="party_position" name="party_position" className="form-control" />
          </div>

          <div className="mb-3">
            <label htmlFor="student_council_position" className="form-label">ตำแหน่งในสภานักศึกษา</label>
            <input type="text" id="student_council_position" name="student_council_position" className="form-control" placeholder={!isMp && !isExecutive ? '-' : 'กรอกตำแหน่งในสภาฯ'} disabled={!isMp && !isExecutive} />
            <div className="form-text">
              กรอกตำแหน่งเฉพาะ ส.ส. หรือ กรรมการบริหารพรรค เท่านั้น
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="faculty" className="form-label">คณะ</label>
              <input type="text" id="faculty" name="faculty" className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="year" className="form-label">ชั้นปี</label>
              <select id="year" name="year" className="form-select">
                <option value="">-- ไม่ระบุ --</option>
                <option value="1">ปี 1</option>
                <option value="2">ปี 2</option>
                <option value="3">ปี 3</option>
                <option value="4">ปี 4</option>
                <option value="5">ปี 5+</option>
                <option value="6">ปี 6+</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="campus" className="form-label">สังกัดศูนย์</label>
              <select id="campus" name="campus" className="form-select" defaultValue="Rangsit">
                <option value="Rangsit">รังสิต</option>
                <option value="Tha Prachan">ท่าพระจันทร์</option>
                <option value="Lampang">ลำปาง</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="gender" className="form-label">เพศ</label>
              <select id="gender" name="gender" className="form-select">
                <option value="not_specified">-- ไม่ระบุ --</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">ประวัติโดยย่อ</label>
            <textarea className="form-control" id="bio" name="bio" rows={4}></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="committees-select" className="form-label">สังกัดคณะกรรมาธิการ</label>
            {/* --- FIX: Make react-select a controlled component --- */}
            <Select 
              id="committees-select" 
              instanceId="committees-select" // Add a unique instanceId
              isMulti 
              options={committeeOptions} 
              classNamePrefix="select" 
              placeholder="เลือกคณะกรรมาธิการ..."
              value={selectedCommittees}
              onChange={setSelectedCommittees}
            />
            {/* --- FIX: Add hidden inputs to submit data --- */}
            {selectedCommittees.map(c => (
              <input type="hidden" name="committees" key={c.value} value={c.value} />
            ))}
          </div>

          <div className="mb-3">
            <label htmlFor="image_file" className="form-label">รูปภาพ</label>
            <input type="file" className="form-control" id="image_file" name="image_file" accept="image/png, image/jpeg, image/webp" />
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="is_active" name="is_active" defaultChecked={true} />
            <label className="form-check-label" htmlFor="is_active">ดำรงตำแหน่ง (Active)</label>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
            <SubmitButton label="บันทึกข้อมูล" />
          </div>
        </form>
      </div>
    </>
  );
}
