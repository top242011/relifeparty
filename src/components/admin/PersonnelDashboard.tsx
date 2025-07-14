// src/components/admin/personnel/PersonnelDashboard.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, UserCog, UserSquare } from 'lucide-react';
import type { PersonnelStats } from '@/lib/definitions';

const StatCard = ({ icon, value, title }: { icon: React.ReactNode, value: number, title: string }) => (
    <div className="col-md-6 col-xl-3 mb-4">
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

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'];

export default function PersonnelDashboard({ stats }: { stats: PersonnelStats }) {
    return (
        <div className="mb-4">
            <div className="row">
                <StatCard icon={<Users size={24} />} value={stats.total} title="บุคลากรรวม" />
                <StatCard icon={<UserCheck size={24} />} value={stats.members} title="สมาชิกพรรค" />
                <StatCard icon={<UserSquare size={24} />} value={stats.mps} title="ส.ส." />
                <StatCard icon={<UserCog size={24} />} value={stats.executives} title="กรรมการบริหาร" />
            </div>
            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">สัดส่วนบุคลากรตามสังกัดศูนย์</h5>
                </div>
                <div className="card-body" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.byCampus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // --- FIXED: Added a check for 'percent' to prevent error ---
                                label={({ name, percent }) => {
                                    if (percent === undefined) return name; // Return only name if percent is not available
                                    return `${name} ${(percent * 100).toFixed(0)}%`;
                                }}
                            >
                                {stats.byCampus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} คน`, 'จำนวน']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
