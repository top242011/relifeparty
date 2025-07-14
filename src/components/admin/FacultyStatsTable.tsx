// src/components/admin/personnel/FacultyStatsTable.tsx
'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import type { Personnel } from '@/lib/definitions';

interface FacultyData {
    name: string;
    value: number;
    members: Personnel[];
}

export default function FacultyStatsTable({ data }: { data: FacultyData[] }) {
    const [show, setShow] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyData | null>(null);

    const handleShow = (faculty: FacultyData) => {
        setSelectedFaculty(faculty);
        setShow(true);
    };
    const handleClose = () => setShow(false);

    return (
        <>
            <div className="card shadow-sm h-100">
                <div className="card-header d-flex align-items-center">
                    <BookOpen className="me-2" size={20} />
                    <h5 className="mb-0">สรุปตามคณะ</h5>
                </div>
                <div className="card-body p-0" style={{ maxHeight: '255px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover mb-0">
                        <tbody>
                            {data.map((faculty) => (
                                <tr key={faculty.name} onClick={() => handleShow(faculty)} style={{ cursor: 'pointer' }}>
                                    <td>{faculty.name}</td>
                                    <td className="text-end">
                                        <span className="badge bg-primary rounded-pill">{faculty.value}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>รายชื่อบุคลากรคณะ: {selectedFaculty?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul className="list-group">
                        {selectedFaculty?.members.map(member => (
                            <li key={member.id} className="list-group-item">{member.name}</li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>ปิด</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
