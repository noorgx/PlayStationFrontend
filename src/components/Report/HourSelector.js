import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const HourSelector = ({ startHour, setStartHour, endHour, setEndHour }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <Row className="mb-3 g-3">
            <Col md={6}>
                <Form.Group controlId="startHour">
                    <Form.Label>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        ساعة البدء
                    </Form.Label>
                    <Form.Select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="form-control-lg"
                    >
                        <option value="">اختر ساعة البدء</option>
                        {hours.map(h => (
                            <option key={h} value={h}>
                                {h}:00
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group controlId="endHour">
                    <Form.Label>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        ساعة النهاية
                    </Form.Label>
                    <Form.Select
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="form-control-lg"
                    >
                        <option value="">اختر ساعة النهاية</option>
                        {hours.map(h => (
                            <option key={h} value={h}>
                                {h}:00
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
    );
};

export default HourSelector;