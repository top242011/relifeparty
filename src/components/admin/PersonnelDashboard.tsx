// src/components/admin/personnel/PersonnelDashboard.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// --- FIXED: Removed non-existent and unused icons ---
import { Users, UserCheck, UserCog, UserSquare } from 'lucide-react';
import type { PersonnelStats } from '@/lib/definitions';
import FacultyStatsTable from './FacultyStatsTable';
import YearStatsTable from './YearStatsTable';

const StatCard = ({ icon, value, title }: { icon: React.ReactNode, value: number, title: string }) => (
    <div className="col-md-6 col-lg-3 mb-4">
        <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        {icon}
                    </div>
                </div>
                <div className="flex-grow-1">
                    <h5 className="card-title fs-2 fw-bold mb-0">{value}</h5>
                    <p className="card-text text-muted mb-0">{title}</p>
                </div>
            </div>
        </div>
    </div>
);

const PIE_COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#6f42c1'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (percent === undefined || percent < 0.05) return null; // Don't render label for small slices
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function PersonnelDashboard({ stats }: { stats: PersonnelStats }) {
    return (
        <div className="mb-4">
            <div className="row">
                <StatCard icon={<Users size={24} />} value={stats.total} title="บุคลากรรวม" />
                <StatCard icon={<UserCheck size={24} />} value={stats.members} title="สมาชิกพรรค" />
                <StatCard icon={<UserSquare size={24} />} value={stats.mps} title="ส.ส." />
                <StatCard icon={<UserCog size={24} />} value={stats.executives} title="กรรมการบริหาร" />
            </div>
            <div className="row">
                {/* Campus Pie Chart */}
                <div className="col-xl-4 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header"><h5 className="mb-0">สังกัดศูนย์</h5></div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.byCampus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                                        {stats.byCampus.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} คน`, 'จำนวน']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Gender Pie Chart */}
                <div className="col-xl-4 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header"><h5 className="mb-0">สัดส่วนตามเพศ</h5></div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.byGender} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" labelLine={false} label={renderCustomizedLabel}>
                                        {stats.byGender.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} คน`, 'จำนวน']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                 {/* Faculty Table */}
                <div className="col-xl-4 mb-4">
                     <FacultyStatsTable data={stats.byFaculty} />
                </div>
            </div>
            <div className="row">
                {/* Year Table */}
                <div className="col-12">
                    <YearStatsTable data={stats.byYear} />
                </div>
            </div>
        </div>
    );
}
