// src/app/admin/personnel/[id]/edit/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

// Define types
interface Committee {
  id: string;
  name: string;
}

export default function EditPersonnelPage() {
  const params = useParams()
  const personnelId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  // State for personnel data
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  // State for committee management
  const [allCommittees, setAllCommittees] = useState<Committee[]>([])
  const [selectedCommittees, setSelectedCommittees] = useState<Set<string>>(new Set())

  // Loading and message state
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchPersonnelData = useCallback(async () => {
    if (!personnelId) return;

    // Fetch personnel details
    const { data: person, error: personError } = await supabase
      .from('personnel')
      .select('*')
      .eq('id', personnelId)
      .single()

    if (personError) throw personError;

    setName(person.name)
    setPosition(person.position || '')
    setBio(person.bio || '')
    setImageUrl(person.image_url || '')
    setIsActive(person.is_active)

    // Fetch all available committees
    const { data: committeesData, error: committeesError } = await supabase
      .from('committees')
      .select('id, name')
    if (committeesError) throw committeesError;
    setAllCommittees(committeesData)

    // Fetch current committee assignments for this person
    const { data: assignments, error: assignmentsError } = await supabase
      .from('committee_assignments')
      .select('committee_id')
      .eq('personnel_id', personnelId)
    if (assignmentsError) throw assignmentsError;
    
    setSelectedCommittees(new Set(assignments.map(a => a.committee_id)))

  }, [personnelId, supabase]);

  useEffect(() => {
    setLoading(true)
    fetchPersonnelData().catch(err => {
      setMessage(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`)
    }).finally(() => {
      setLoading(false)
    })
  }, [fetchPersonnelData])

  const handleCommitteeChange = (committeeId: string) => {
    const newSelection = new Set(selectedCommittees)
    if (newSelection.has(committeeId)) {
      newSelection.delete(committeeId)
    } else {
      newSelection.add(committeeId)
    }
    setSelectedCommittees(newSelection)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // 1. Update personnel table
      const { error: updateError } = await supabase
        .from('personnel')
        .update({
          name,
          position,
          bio,
          image_url: imageUrl || null,
          is_active: isActive,
        })
        .eq('id', personnelId)
      if (updateError) throw updateError;

      // 2. Delete all existing assignments for this person
      const { error: deleteError } = await supabase
        .from('committee_assignments')
        .delete()
        .eq('personnel_id', personnelId)
      if (deleteError) throw deleteError;

      // 3. Insert new assignments
      const newAssignments = Array.from(selectedCommittees).map(committee_id => ({
        personnel_id: personnelId,
        committee_id,
      }))

      if (newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('committee_assignments')
          .insert(newAssignments)
        if (insertError) throw insertError;
      }

      setMessage('บันทึกข้อมูลสำเร็จ!')
      router.push('/admin/personnel')
      router.refresh()
    } catch (error: any) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูล...</p></div>
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">แก้ไขข้อมูลบุคลากร</h1>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8">
              <div className="card shadow-sm p-4">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">ชื่อ-นามสกุล</label>
                  <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="position" className="form-label">ตำแหน่ง</label>
                  <input type="text" className="form-control" id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
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
                  <input className="form-check-input" type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <label className="form-check-label" htmlFor="isActive">ดำรงตำแหน่ง (Active)</label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm p-4">
                <h5>สังกัดคณะกรรมาธิการ</h5>
                <hr/>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {allCommittees.map(committee => (
                    <div className="form-check" key={committee.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`committee-${committee.id}`}
                        checked={selectedCommittees.has(committee.id)}
                        onChange={() => handleCommitteeChange(committee.id)}
                      />
                      <label className="form-check-label" htmlFor={`committee-${committee.id}`}>
                        {committee.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <Link href="/admin/personnel" className="btn btn-secondary">ยกเลิก</Link>
          </div>
        </form>
        {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
      </main>
    </div>
  )
}
