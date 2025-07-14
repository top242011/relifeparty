// src/components/admin/personnel/YearStatsTable.tsx
'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Modal, Button, Nav } from 'react-bootstrap';
import type { Personnel } from '@/lib/definitions';

interface YearData {
    name: string;
    value: number;
    roles: {
        members: Personnel[];
        mps: Personnel[];
        executives: Personnel[];
    }
}

export default function YearStatsTable({ data }: { data: YearData[] }) {
    const [show, setShow] = useState(false);
    const [selectedYear, setSelectedYear] = useState<YearData | null>(null);
    const [activeTab, setActiveTab] = useState('members');

    const handleShow = (year: YearData) => {
        setSelectedYear(year);
        setActiveTab('members'); // Reset to default tab
        setShow(true);
    };
    const handleClose = () => setShow(false);
    
    const renderMemberList = (members: Personnel[]) => {
        if (members.length === 0) return <p className="text-muted text-center mt-3">ไม่พบข้อมูล</p>;
        return (
             <ul className="list-group list-group-flush">
                {members.map(member => (
                    <li key={member.id} className="list-group-item">{member.name}</li>
                ))}
            </ul>
        )
    }

    return (
        <>
            <div className="card shadow-sm h-100">
                <div className="card-header d-flex align-items-center">
                    <GraduationCap className="me-2" size={20} />
                    <h5 className="mb-0">สรุปตามชั้นปี</h5>
                </div>
                <div className="card-body p-0">
                     <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ชั้นปี</th>
                                <th className="text-center">สมาชิกพรรค</th>
                                <th className="text-center">ส.ส.</th>
                                <th className="text-center">กรรมการบริหาร</th>
                                <th className="text-center">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((year) => (
                                <tr key={year.name} onClick={() => handleShow(year)} style={{ cursor: 'pointer' }}>
                                    <td>{year.name}</td>
                                    <td className="text-center">{year.roles.members.length}</td>
                                    <td className="text-center">{year.roles.mps.length}</td>
                                    <td className="text-center">{year.roles.executives.length}</td>
                                    <td className="text-center">
                                        <span className="badge bg-primary rounded-pill">{year.value}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>รายชื่อบุคลากร: {selectedYear?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                   <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'members')}>
                        <Nav.Item>
                            <Nav.Link eventKey="members">สมาชิกพรรค ({selectedYear?.roles.members.length})</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="mps">ส.ส. ({selectedYear?.roles.mps.length})</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="executives">กรรมการบริหาร ({selectedYear?.roles.executives.length})</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {activeTab === 'members' && renderMemberList(selectedYear?.roles.members || [])}
                        {activeTab === 'mps' && renderMemberList(selectedYear?.roles.mps || [])}
                        {activeTab === 'executives' && renderMemberList(selectedYear?.roles.executives || [])}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>ปิด</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
