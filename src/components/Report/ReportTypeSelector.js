import React from 'react';
import { Form } from 'react-bootstrap';
import { FaCalendarDay, FaCalendarAlt, FaCalendar, FaCogs } from 'react-icons/fa';

const ReportTypeSelector = ({ reportType, handleReportTypeChange }) => {
    return (
        <Form.Group controlId="reportType" className="mt-4 p-3 bg-light rounded shadow-sm">
            <Form.Label className="d-flex align-items-center">
                <FaCogs className="me-2 text-secondary" /> نوع التقرير
            </Form.Label>
            <Form.Select
                value={reportType}
                onChange={handleReportTypeChange}
                className="form-select"
            >
                <option value="daily">
                    <FaCalendarDay className="me-2" /> يومي
                </option>
                <option value="monthly">
                    <FaCalendarAlt className="me-2" /> شهري
                </option>
                <option value="yearly">
                    <FaCalendar className="me-2" /> سنوي
                </option>
                <option value="machine">
                    <FaCogs className="me-2" /> حسب الجهاز
                </option>
            </Form.Select>
        </Form.Group>
    );
};

export default ReportTypeSelector;
