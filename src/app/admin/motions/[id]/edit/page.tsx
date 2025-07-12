// src/app/admin/motions/[id]/edit/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import Link from 'next/link'

// --- Define Types ---
interface Voter { id: string; name: string; }
type VoteMap = { [personnelId: string]: string; };

// 1. แก้ไข Type ให้ตรงกับข้อมูลที่ Supabase ส่งกลับมาจริงๆ
// personnel จะเป็น Array ที่มี Object เดียว
type AttendeeFromSupabase = {
  personnel_id: string;
  personnel: {
    id: string;
    name: string;
  }[] | null; // Changed to array of objects
};

interface Motion {
  id: string; 
  title: string;
  details: string;
  proposer_id: string | null;
}

export default function EditMotionPage() {
  const params = useParams()
  const motionId = params.id as string
  const supabase = createClient()

  // --- State ---
  const [motionData, setMotionData] = useState<Motion | null>(null);
  const [voters, setVoters] = useState<Voter[]>([])
  const [votes, setVotes] = useState<VoteMap>({})
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // --- Data Fetching ---
  const fetchMotionData = useCallback(async () => {
    if (!motionId) return;

    const { data: motion, error: motionError } = await supabase
      .from('motions')
      .select('*, meetings(id)')
      .eq('id', motionId)
      .single()
    if (motionError) throw motionError;
    
    let activeVoters: Voter[] = [];
    if (motion.meeting_id) {
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('attendance_records')
        .select('personnel_id, personnel(id, name)')
        .eq('meeting_id', motion.meeting_id)
        .eq('status', 'เข้าประชุม');
      if (attendeesError) throw attendeesError;

      // 2. แก้ไขการ map ข้อมูลให้ถูกต้องและปลอดภัย
      activeVoters = (attendeesData as AttendeeFromSupabase[])
        .map(a => a.personnel ? a.personnel[0] : null) // Get the first object from the array
        .filter((p): p is Voter => p !== null);
    }
    setVoters(activeVoters);

    const { data: votesData, error: votesError } = await supabase
      .from('voting_records')
      .select('personnel_id, vote')
      .eq('motion_id', motionId);
    if (votesError) throw votesError;

    const initialVotes: VoteMap = {};
    activeVoters.forEach(voter => {
      const record = votesData?.find(v => v.personnel_id === voter.id);
      initialVotes[voter.id] = record?.vote || 'ไม่แสดงตน';
    });
    setVotes(initialVotes);

    setMotionData({
      id: motion.id,
      title: motion.title,
      details: motion.details || '',
      proposer_id: motion.proposer_id,
    });

  }, [motionId, supabase]);

  useEffect(() => {
    fetchMotionData().catch((err: Error) => setMessage(`Error loading data: ${err.message}`)).finally(() => setLoading(false));
  }, [fetchMotionData]);

  // --- Event Handlers ---
  const handleMotionChange = (field: keyof Motion, value: string) => {
    setMotionData(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleVoteChange = (personnelId: string, vote: string) => {
    setVotes(prev => ({ ...prev, [personnelId]: vote }));
  };

  // --- Main Save Logic ---
  const handleSubmit = async () => {
    if (!motionData) return;
    setSaving(true);
    setMessage('');
    try {
      await supabase.from('motions').update({ title: motionData.title, details: motionData.details }).eq('id', motionId);

      const votesToUpsert = Object.entries(votes).map(([personnel_id, vote]) => ({
        motion_id: motionId,
        personnel_id,
        vote,
      }));
      if (votesToUpsert.length > 0) {
        await supabase.from('voting_records').upsert(votesToUpsert, { onConflict: 'motion_id,personnel_id' });
      }
      setMessage('บันทึกข้อมูลทั้งหมดสำเร็จ!');
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูล...</p></div>
  }

  if (!motionData) {
     return <div className="d-flex justify-content-center align-items-center vh-100"><p className="text-danger">ไม่พบข้อมูลญัตติ</p></div>
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">แก้ไขญัตติและบันทึกผลโหวต</h1>
          <button onClick={handleSubmit} className="btn btn-success btn-lg" disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
          </button>
        </div>

        {message && <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

        <div className="card shadow-sm p-4 mb-4">
          <div className="mb-3">
            <label className="form-label">ชื่อญัตติ</label>
            <input type="text" className="form-control" value={motionData.title} onChange={e => handleMotionChange('title', e.target.value)} />
          </div>
          <div>
            <label className="form-label">รายละเอียด</label>
            <textarea className="form-control" rows={2} value={motionData.details} onChange={e => handleMotionChange('details', e.target.value)}></textarea>
          </div>
        </div>

        <div className="card shadow-sm p-4">
          <h5 className="mb-3">บันทึกการลงคะแนนเสียง (เฉพาะผู้ที่เข้าประชุม)</h5>
          {voters.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <table className="table table-sm">
                <tbody>
                  {voters.map(voter => (
                    <tr key={voter.id}>
                      <td>{voter.name}</td>
                      <td style={{ width: '220px' }}>
                        <select
                          className="form-select form-select-sm"
                          value={votes[voter.id] || 'ไม่แสดงตน'}
                          onChange={e => handleVoteChange(voter.id, e.target.value)}
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
            <p className="text-muted">ไม่พบข้อมูลผู้เข้าประชุมสำหรับญัตตินี้</p>
          )}
        </div>

        <div className="mt-4">
            <Link href="/admin/motions" className="btn btn-secondary">กลับไปหน้ารายการ</Link>
        </div>
      </main>
    </div>
  )
}
