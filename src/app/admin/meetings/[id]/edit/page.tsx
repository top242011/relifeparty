// src/app/admin/meetings/[id]/edit/page.tsx
'use client'

import { useEffect, useState, useCallback, useId } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

// --- Define Types ---
interface Personnel { id: string; name: string; }
interface Motion {
  id: string; 
  title: string;
  details: string;
  proposer_id: string | null;
  votes: { [personnelId: string]: string }; 
}
type AttendanceMap = { [personnelId:string]: string; };

export default function EditMeetingPage() {
  const params = useParams()
  const meetingId = params.id as string
  const supabase = createClient()
  const uniqueId = useId();

  // --- State ---
  const [meeting, setMeeting] = useState<{ topic: string, scope: string } | null>(null)
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [attendance, setAttendance] = useState<AttendanceMap>({})
  const [motions, setMotions] = useState<Motion[]>([])
  
  // 👇 New state for collapsible motions
  const [expandedMotionId, setExpandedMotionId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('attendance')

  // --- Data Fetching ---
  const fetchMeetingData = useCallback(async () => {
    if (!meetingId) return;

    const { data: meetingData } = await supabase.from('meetings').select('topic, scope').eq('id', meetingId).single();
    if (!meetingData) throw new Error("ไม่พบการประชุมนี้");
    setMeeting(meetingData);

    let personnelQuery = supabase.from('personnel').select('id, name').eq('is_active', true);
    if (meetingData.scope !== 'General Assembly') {
      personnelQuery = personnelQuery.eq('campus', meetingData.scope);
    }
    const { data: personnelData } = await personnelQuery.order('name');
    setPersonnel(personnelData || []);

    const { data: attendanceData } = await supabase.from('attendance_records').select('personnel_id, status').eq('meeting_id', meetingId);
    const initialAttendance: AttendanceMap = {};
    (personnelData || []).forEach(p => {
      const record = attendanceData?.find(a => a.personnel_id === p.id);
      initialAttendance[p.id] = record?.status || 'ไม่ระบุ';
    });
    setAttendance(initialAttendance);

    const { data: motionsData } = await supabase.from('motions').select('*').eq('meeting_id', meetingId);
    const initialMotions: Motion[] = [];
    if (motionsData && motionsData.length > 0) {
      for (const motion of motionsData) {
        const { data: votesData } = await supabase.from('voting_records').select('personnel_id, vote').eq('motion_id', motion.id);
        const votesMap: { [key: string]: string } = {};
        (votesData || []).forEach(v => { votesMap[v.personnel_id] = v.vote; });
        initialMotions.push({ ...motion, votes: votesMap });
      }
      // Auto-expand the first motion by default
      setExpandedMotionId(initialMotions[0].id);
    }
    setMotions(initialMotions);

  }, [meetingId, supabase]);

  useEffect(() => {
    fetchMeetingData().catch(err => setMessage(`Error loading data: ${err.message}`)).finally(() => setLoading(false));
  }, [fetchMeetingData]);

  // --- Event Handlers ---
  const handleBulkAttendance = (status: string) => {
    const newAttendance: AttendanceMap = {};
    personnel.forEach(p => { newAttendance[p.id] = status; });
    setAttendance(newAttendance);
  };

  const addMotion = () => {
    const newId = `temp-${uniqueId}-${motions.length}`;
    setMotions(prev => [...prev, { id: newId, title: '', details: '', proposer_id: null, votes: {} }]);
    setExpandedMotionId(newId); // Auto-expand the new motion
  };

  const handleMotionChange = (index: number, field: keyof Motion, value: any) => {
    const newMotions = [...motions];
    (newMotions[index] as any)[field] = value;
    setMotions(newMotions);
  };

  const handleVoteChange = (motionIndex: number, personnelId: string, vote: string) => {
    const newMotions = [...motions];
    newMotions[motionIndex].votes[personnelId] = vote;
    setMotions(newMotions);
  };

  // 👇 New handler for bulk voting
  const handleBulkVote = (motionIndex: number, vote: string) => {
    const newMotions = [...motions];
    const newVotes = { ...newMotions[motionIndex].votes };
    const attendingPersonnel = personnel.filter(p => attendance[p.id] === 'เข้าประชุม');
    attendingPersonnel.forEach(voter => {
      newVotes[voter.id] = vote;
    });
    newMotions[motionIndex].votes = newVotes;
    setMotions(newMotions);
  };

  // --- Main Save Logic ---
  const handleSubmit = async () => {
    setSaving(true);
    setMessage('');
    try {
      const attendanceToUpsert = Object.entries(attendance).map(([personnel_id, status]) => ({ meeting_id: meetingId, personnel_id, status }));
      await supabase.from('attendance_records').upsert(attendanceToUpsert, { onConflict: 'meeting_id,personnel_id' });

      for (const motion of motions) {
        const isNew = motion.id.startsWith('temp-');
        const motionData = { title: motion.title, details: motion.details, proposer_id: motion.proposer_id, meeting_id: meetingId };
        
        let currentMotionId = motion.id;
        if (isNew) {
          const { data: newMotion, error } = await supabase.from('motions').insert(motionData).select('id').single();
          if (error) throw error;
          currentMotionId = newMotion.id;
        } else {
          await supabase.from('motions').update(motionData).eq('id', motion.id);
        }

        const votesToUpsert = Object.entries(motion.votes).map(([personnel_id, vote]) => ({ motion_id: currentMotionId, personnel_id, vote }));
        if (votesToUpsert.length > 0) {
          await supabase.from('voting_records').upsert(votesToUpsert, { onConflict: 'motion_id,personnel_id' });
        }
      }
      setMessage('บันทึกข้อมูลทั้งหมดสำเร็จ!');
      fetchMeetingData();
    } catch (error: any) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูลการประชุม...</p></div>
  }

  const attendingPersonnel = personnel.filter(p => attendance[p.id] === 'เข้าประชุม');

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">บันทึกผลการประชุม</h1>
            <p className="text-muted">{meeting?.topic}</p>
          </div>
          <div>
            <button onClick={handleSubmit} className="btn btn-success btn-lg" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
            </button>
          </div>
        </div>

        {message && <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
              1. บันทึกการเข้าประชุม
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'motions' ? 'active' : ''}`} onClick={() => setActiveTab('motions')}>
              2. บันทึกญัตติและผลโหวต
            </button>
          </li>
        </ul>

        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'attendance' ? 'show active' : ''}`}>
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>รายชื่อผู้เข้าร่วมประชุม ({personnel.length} คน)</span>
                <div>
                  <button className="btn btn-outline-success btn-sm me-2" onClick={() => handleBulkAttendance('เข้าประชุม')}>ทุกคนเข้า</button>
                  <button className="btn btn-outline-warning btn-sm me-2" onClick={() => handleBulkAttendance('ลา')}>ทุกคนลา</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleBulkAttendance('ขาด')}>ทุกคนขาด</button>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="table">
                  <tbody>
                    {personnel.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td style={{ width: '200px' }}>
                          <select className="form-select form-select-sm" value={attendance[p.id] || 'ไม่ระบุ'} onChange={e => setAttendance(prev => ({...prev, [p.id]: e.target.value}))}>
                            <option value="ไม่ระบุ">-- เลือก --</option>
                            <option value="เข้าประชุม">เข้าประชุม</option>
                            <option value="ลา">ลา</option>
                            <option value="ขาด">ขาด</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'motions' ? 'show active' : ''}`}>
            {motions.map((motion, motionIndex) => (
              <div key={motion.id} className="card shadow-sm mb-3">
                <div className="card-header d-flex justify-content-between align-items-center" style={{cursor: 'pointer'}} onClick={() => setExpandedMotionId(prev => prev === motion.id ? null : motion.id)}>
                  <h6 className="mb-0">ญัตติที่ {motionIndex + 1}: {motion.title || '(ยังไม่มีชื่อ)'}</h6>
                  <button type="button" className="btn btn-sm btn-outline-secondary">
                    {expandedMotionId === motion.id ? 'ย่อ' : 'ขยาย'}
                  </button>
                </div>
                
                {expandedMotionId === motion.id && (
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">ชื่อญัตติ</label>
                      <input type="text" className="form-control" value={motion.title} onChange={e => handleMotionChange(motionIndex, 'title', e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">รายละเอียด</label>
                      <textarea className="form-control" rows={2} value={motion.details} onChange={e => handleMotionChange(motionIndex, 'details', e.target.value)}></textarea>
                    </div>
                    <h6 className="mt-4">บันทึกผลโหวต (สำหรับผู้ที่เข้าประชุม)</h6>
                    {attendingPersonnel.length > 0 ? (
                      <>
                        <div className="mb-2">
                          <span className="me-2 small text-muted">Bulk Actions:</span>
                          <button type="button" className="btn btn-outline-success btn-sm me-1" onClick={() => handleBulkVote(motionIndex, 'เห็นด้วย')}>ทุกคนเห็นด้วย</button>
                          <button type="button" className="btn btn-outline-danger btn-sm me-1" onClick={() => handleBulkVote(motionIndex, 'ไม่เห็นด้วย')}>ทุกคนไม่เห็นด้วย</button>
                          <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => handleBulkVote(motionIndex, 'งดออกเสียง')}>ทุกคนงดออกเสียง</button>
                        </div>
                        <table className="table table-sm">
                          <tbody>
                            {attendingPersonnel.map(voter => (
                              <tr key={voter.id}>
                                <td>{voter.name}</td>
                                <td style={{ width: '220px' }}>
                                  <select className="form-select form-select-sm" value={motion.votes[voter.id] || 'ไม่แสดงตน'} onChange={e => handleVoteChange(motionIndex, voter.id, e.target.value)}>
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
                      </>
                    ) : <p className="text-muted">กรุณาบันทึกสถานะ "เข้าประชุม" ในแท็บแรกก่อน</p>}
                  </div>
                )}
              </div>
            ))}
            <button className="btn btn-outline-primary" onClick={addMotion}>+ เพิ่มญัตติ</button>
          </div>
        </div>
      </main>
    </div>
  )
}
