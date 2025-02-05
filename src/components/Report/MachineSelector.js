import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaCogs, FaCalendarAlt, FaRegCalendar } from 'react-icons/fa';

const MachineSelector = ({ machines, selectedMachine, setSelectedMachine, selectedDate, setSelectedDate, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) => {
    return (
        <Form className="mt-4 p-3 bg-light rounded shadow-sm">
            <Row className="mb-3">
                {/* Machine Selection */}
                <Col md={12}>
                    <Form.Group controlId="machine">
                        <Form.Label className="d-flex align-items-center">
                            <FaCogs className="me-2 text-secondary" /> اختر الجهاز
                        </Form.Label>
                        <Form.Select
                            value={selectedMachine}
                            onChange={(e) => setSelectedMachine(e.target.value)}
                        >
                            <option value="">اختر الجهاز</option>
                            {machines.map((machine, i) => (
                                <option key={i} value={machine}>{machine}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                {/* Date Selection */}
                <Col md={4} className="mb-3">
                    <Form.Group controlId="date">
                        <Form.Label className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-secondary" /> التاريخ (اختياري)
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>

                {/* Month Selection */}
                <Col md={4} className="mb-3">
                    <Form.Group controlId="month">
                        <Form.Label className="d-flex align-items-center">
                            <FaRegCalendar className="me-2 text-secondary" /> الشهر (اختياري)
                        </Form.Label>
                        <Form.Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="">الشهر</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('ar', { month: 'long' })}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* Year Selection */}
                <Col md={4} className="mb-3">
                    <Form.Group controlId="year">
                        <Form.Label className="d-flex align-items-center">
                            <FaRegCalendar className="me-2 text-secondary" /> السنة (اختياري)
                        </Form.Label>
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">السنة</option>
                            {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default MachineSelector;
