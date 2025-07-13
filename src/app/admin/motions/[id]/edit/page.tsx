// src/app/admin/motions/[id]/edit/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import Link from 'next/link'
import type { Motion } from '@/lib/definitions'
import { updateMotionResult } from '@/lib/actions'
import toast from 'react-hot-toast'

// --- Type Definitions ---
interface Voter { id: string; name: string; }
type VoteMap = { [personnelId: string]: string; };
type VoteCounts = {
  'เห็นด้วย': number;
  'ไม่เห็นด้วย': number;
  'งดออกเสียง': number;
  'ไม่แสดงตน': number;
  total: number;
};

type AttendeeFromSupabase = {
  personnel: { id: string; name: string; }[] | null;
};

export default function EditMotionPage() {
  const params = useParams();
  const router = useRouter();
  const motionId = params.id as string;
  const supabase = createClient();

  // --- State ---
  const [motionData, setMotionData] = useState<Motion | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [votes, setVotes] = useState<VoteMap>({});
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({ 'เห็นด้วย': 0, 'ไม่เห็นด้วย': 0, 'งดออกเสียง': 0, 'ไม่แสดงตน': 0, total: 0 });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- Data Fetching & Calculation ---
  const fetchMotionData = useCallback(async () => {
    if (!motionId) return;

    const { data: motion, error: motionError } = await supabase.from('motions').select('*').eq('id', motionId).single();
    if (motionError || !motion) throw new Error(motionError?.message || 'ไม่พบข้อมูลญัตติ');
    setMotionData(motion as Motion);

    let activeVoters: Voter[] = [];
    if (motion.meeting_id) {
      const { data: attendeesData, error: attendeesError } = await supabase.from('attendance_records').select('personnel(id, name)').eq('meeting_id', motion.meeting_id).eq('status', 'เข้าประชุม');
      if (attendeesError) throw attendeesError;
      activeVoters = (attendeesData as AttendeeFromSupabase[]).map(a => a.personnel?.[0]).filter((p): p is Voter => p !== null);
    }
    setVoters(activeVoters);

    const { data: votesData, error: votesError } = await supabase.from('voting_records').select('personnel_id, vote').eq('motion_id', motionId);
    if (votesError) throw votesError;

    const initialVotes: VoteMap = {};
    activeVoters.forEach(voter => {
      const record = votesData?.find(v => v.personnel_id === voter.id);
      initialVotes[voter.id] = record?.vote || 'ไม่แสดงตน';
    });
    setVotes(initialVotes);

    const counts: VoteCounts = { 'เห็นด้วย': 0, 'ไม่เห็นด้วย': 0, 'งดออกเสียง': 0, 'ไม่แสดงตน': 0, total: activeVoters.length };
    Object.values(initialVotes).forEach(vote => {
      if (vote in counts) {
        counts[vote as keyof Omit<VoteCounts, 'total'>]++;
      }
    });
    setVoteCounts(counts);

  }, [motionId, supabase]);

  useEffect(() => {
    setLoading(true);
    fetchMotionData().catch((err: any) => setMessage(`เกิดข้อผิดพลาด: ${err.message}`)).finally(() => setLoading(false));
  }, [fetchMotionData]);

  // --- Event Handlers ---
  const handleVoteChange = (personnelId: string, vote: string) => {
    setVotes(prev => ({ ...prev, [personnelId]: vote }));
  };

  const handleUpdateResult = async (result: 'ผ่าน' | 'ไม่ผ่าน' | 'รอลงมติ') => {
    setSaving(true);
    const response = await updateMotionResult(motionId, result);
    if (response.success) {
        toast.success(response.message || 'อัปเดตสำเร็จ!');
        router.refresh();
    } else {
        toast.error(response.message || 'เกิดข้อผิดพลาด');
    }
    setSaving(false);
  };

  // --- Render Logic ---
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><p>กำลังโหลดข้อมูล...</p></div>
  if (!motionData) return <div className="alert alert-danger">{message || 'ไม่พบข้อมูลญัตติ'}</div>

  // --- UI Components ---
  const VoteResultCard = ({ title, count, total, colorClass }: { title: string, count: number, total: number, colorClass: string }) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    return (
        <div className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100">
                <div className="card-body">
                    <h6 className="card-title text-muted">{title}</h6>
                    <p className="card-text fs-4 fw-bold">{count} <span className="fs-6 fw-normal text-muted">/ {total}</span></p>
                    <div className="progress" style={{height: '8px'}}>
                        <div className={`progress-bar ${colorClass}`} role="progressbar" style={{width: `${percentage}%`}} aria-valuenow={count} aria-valuemin={0} aria-valuemax={total}></div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">แก้ไขและสรุปผลญัตติ</h1>
          <Link href="/admin/motions" className="btn btn-secondary">กลับไปหน้ารายการ</Link>
        </div>

        <div className="card shadow-sm p-4 mb-4">
            <h5 className="mb-3">สรุปผลการลงคะแนน</h5>
            <div className="row">
                <VoteResultCard title="เห็นด้วย" count={voteCounts['เห็นด้วย']} total={voteCounts.total} colorClass="bg-success" />
                <VoteResultCard title="ไม่เห็นด้วย" count={voteCounts['ไม่เห็นด้วย']} total={voteCounts.total} colorClass="bg-danger" />
                <VoteResultCard title="งดออกเสียง" count={voteCounts['งดออกเสียง']} total={voteCounts.total} colorClass="bg-warning" />
                <VoteResultCard title="ไม่แสดงตน/ไม่มา" count={voteCounts['ไม่แสดงตน']} total={voteCounts.total} colorClass="bg-secondary" />
            </div>
            <hr />
            <div className="d-flex justify-content-end gap-2">
                {/* แก้ไข: ใช้ &quot; แทน " */}
                <button className="btn btn-outline-secondary" onClick={() => handleUpdateResult('รอลงมติ')} disabled={saving}>ตั้งเป็น &quot;รอลงมติ&quot;</button>
                <button className="btn btn-danger" onClick={() => handleUpdateResult('ไม่ผ่าน')} disabled={saving}>ยืนยันผล: &quot;ไม่ผ่าน&quot;</button>
                <button className="btn btn-success" onClick={() => handleUpdateResult('ผ่าน')} disabled={saving}>ยืนยันผล: &quot;ผ่าน&quot;</button>
            </div>
        </div>

        <div className="card shadow-sm p-4">
          <h5 className="mb-3">บันทึกการลงคะแนนเสียง (รายบุคคล)</h5>
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
      </>
  )
}
