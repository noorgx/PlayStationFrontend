import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const DateSelector = ({ reportType, selectedDate, setSelectedDate, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) => {
    return (
        <Row className="mb-3 g-3">
            {reportType === 'daily' && (
                <Col md={12}>
                    <Form.Group controlId="date" className="position-relative">
                        <Form.Label>
                            <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                            اختر التاريخ
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="form-control-lg"
                        />
                    </Form.Group>
                </Col>
            )}

            {reportType === 'monthly' && (
                <Col md={12}>
                    <Form.Group controlId="month" className="position-relative">
                        <Form.Label>
                            <FontAwesomeIcon icon={faCalendarWeek} className="me-2" />
                            اختر الشهر
                        </Form.Label>
                        <Form.Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="form-control-lg"
                        >
                            <option value="">اختر الشهر</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i+1} value={i+1}>
                                    {new Date(0, i).toLocaleString('ar', { month: 'long' })}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            )}

            {reportType === 'yearly' && (
                <Col md={12}>
                    <Form.Group controlId="year" className="position-relative">
                        <Form.Label>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                            اختر السنة
                        </Form.Label>
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="form-control-lg"
                        >
                            <option value="">اختر السنة</option>
                            {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </Form.Select>
                    </Form.Group>
                </Col>
            )}
        </Row>
    );
};

export default DateSelector;