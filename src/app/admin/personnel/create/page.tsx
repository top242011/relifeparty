// src/app/admin/personnel/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import Link from 'next/link'

export default function CreatePersonnelPage() {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [role, setRole] = useState('MP')
  const [campus, setCampus] = useState('Rangsit')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    // 👇 1. เพิ่มตรรกะตรวจสอบค่าว่าง
    // ถ้า position เป็นค่าว่าง (หลังตัดช่องว่างแล้ว) ให้ใช้ '-' แทน
    const finalPosition = position.trim() === '' ? '-' : position;

    const supabase = createClient()
    const { error } = await supabase
      .from('personnel')
      .insert([
        {
          name,
          position: finalPosition, // 👈 2. ใช้ค่าที่ผ่านการตรวจสอบแล้ว
          bio,
          image_url: imageUrl || null,
          is_active: isActive,
          role,
          campus,
        },
      ])

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } else {
      setMessage('เพิ่มบุคลากรสำเร็จ!')
      router.push('/admin/personnel')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">เพิ่มบุคลากรใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
              <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="position" className="form-label">ตำแหน่งในพรรค</label>
              <input type="text" className="form-control" id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="เช่น สมาชิกพรรค (ถ้าว่างจะแสดงเป็น -)" />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="role" className="form-label">บทบาท</label>
                <select id="role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="MP">ส.ส.</option>
                  <option value="Executive">กรรมการบริหาร</option>
                  <option value="Both">เป็นทั้งสองอย่าง</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="campus" className="form-label">สังกัดศูนย์</label>
                <select id="campus" className="form-select" value={campus} onChange={(e) => setCampus(e.target.value)}>
                  <option value="Rangsit">รังสิต</option>
                  <option value="Tha Prachan">ท่าพระจันทร์</option>
                  <option value="Lampang">ลำปาง</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="bio" className="form-label">ประวัติโดยย่อ</label>
              <textarea className="form-control" id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label">URL รูปภาพ</label>
              <input type="url" className="form-control" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="form-check mb-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="isActive" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isActive">
                ดำรงตำแหน่ง (Active)
              </label>
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
