// src/app/admin/motions/[id]/edit/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

interface Voter { id: string; name: string; }
type VoteMap = { [personnelId: string]: string; };

// 1. สร้าง Type สำหรับข้อมูลที่ดึงมาให้ชัดเจน
interface AttendeeWithPersonnel {
  personnel_id: string;
  personnel: {
    id: string;
    name: string;
  } | null; // personnel อาจเป็น null ได้
}

export default function EditMotionPage() {
  const params = useParams()
  const motionId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [result, setResult] = useState('')
  
  const [voters, setVoters] = useState<Voter[]>([])
  const [votes, setVotes] = useState<VoteMap>({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchMotionData = useCallback(async () => {
    if (!motionId) return;

    const { data: motionData, error: motionError } = await supabase
      .from('motions')
      .select('*, meetings(id)') // ดึง meeting_id มาด้วย
      .eq('id', motionId)
      .single()
    if (motionError) throw motionError;
    
    setTitle(motionData.title)
    setResult(motionData.result || 'รอลงมติ')

    if (motionData.meeting_id) {
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('attendance_records')
        .select(`
          personnel_id,
          personnel (id, name)
        `)
        .eq('meeting_id', motionData.meeting_id)
        .eq('status', 'เข้าประชุม')
      if (attendeesError) throw attendeesError;

      // 2. แก้ไขการ map ข้อมูลให้ถูกต้องและปลอดภัย
      const activeVoters = (attendeesData as AttendeeWithPersonnel[])
        .map(a => a.personnel) // ดึง object personnel ออกมา
        .filter((p): p is Voter => p !== null); // กรองค่า null ออก และบอก TS ว่าผลลัพธ์คือ Voter[]
      
      setVoters(activeVoters)

      const { data: votesData, error: votesError } = await supabase
        .from('voting_records')
        .select('personnel_id, vote')
        .eq('motion_id', motionId)
      if (votesError) throw votesError;

      const initialVotes: VoteMap = {}
      activeVoters.forEach(voter => {
        const record = votesData.find(v => v.personnel_id === voter.id)
        initialVotes[voter.id] = record ? record.vote : 'ไม่แสดงตน'
      })
      setVotes(initialVotes)
    }
  }, [motionId, supabase]);

  useEffect(() => {
    setLoading(true)
    fetchMotionData().catch(err => {
      setMessage(`เกิดข้อผิดพลาด: ${err.message}`)
    }).finally(() => {
      setLoading(false)
    })
  }, [fetchMotionData])

  const handleVoteChange = (personnelId: string, vote: string) => {
    setVotes(prev => ({ ...prev, [personnelId]: vote }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await supabase.from('motions').update({ title, result }).eq('id', motionId)

      const votesToUpsert = Object.entries(votes).map(([personnel_id, vote]) => ({
        motion_id: motionId,
        personnel_id,
        vote,
      }))

      if (votesToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('voting_records')
          .upsert(votesToUpsert, { onConflict: 'motion_id,personnel_id' })
        if (upsertError) throw upsertError;
      }

      setMessage('บันทึกผลโหวตสำเร็จ!')
    } catch (error: any) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูลญัตติ...</p></div>
  }

  return (
    // ... JSX เหมือนเดิม ...
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">แก้ไขญัตติและบันทึกผลโหวต</h1>
        <form onSubmit={handleSubmit}>
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="mb-3">รายละเอียดญัตติ</h5>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label htmlFor="title" className="form-label">ชื่อญัตติ</label>
                <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="result" className="form-label">ผลการลงมติของสภา</label>
                <select className="form-select" id="result" value={result} onChange={(e) => setResult(e.target.value)}>
                  <option value="รอลงมติ">รอลงมติ</option>
                  <option value="ผ่าน">ผ่าน</option>
                  <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                  <option value="เลื่อน">เลื่อน</option>
                  <option value="ถอน">ถอน</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-4">
            <h5 className="mb-3">บันทึกการลงคะแนนเสียง (เฉพาะผู้ที่เข้าประชุม)</h5>
            {voters.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <table className="table">
                  <tbody>
                    {voters.map(voter => (
                      <tr key={voter.id}>
                        <td>{voter.name}</td>
                        <td style={{ width: '220px' }}>
                          <select
                            className="form-select form-select-sm"
                            value={votes[voter.id] || 'ไม่แสดงตน'}
                            onChange={(e) => handleVoteChange(voter.id, e.target.value)}
                          >
                            <option value="เห็นด้วย">เห็นด้วย</option>
                            <option value="ไม่เห็นด้วย">ไม่เห็นด้วย</option>
                            <option value="งดออกเสียง">งดออกเสียง</option>
                            <option value="ไม่แสดงตน">ไม่แสดงตน</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">ไม่พบข้อมูลผู้เข้าประชุมสำหรับญัตตินี้ หรือญัตตินี้ไม่ได้ผูกกับการประชุมใด</p>
            )}
          </div>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary me-2" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
            </button>
            <Link href="/admin/motions" className="btn btn-secondary">กลับไปหน้ารายการ</Link>
          </div>
        </form>
        {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
      </main>
    </div>
  )
}
