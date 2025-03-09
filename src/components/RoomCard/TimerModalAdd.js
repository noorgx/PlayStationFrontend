import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FaClock, FaHourglassHalf } from 'react-icons/fa';

const TimerModalAdd = ({ show, onHide, handleTimerSubmit, hours, setHours, minutes, setMinutes }) => {
    return (
        <div dir="rtl">
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>ضبط المؤقت</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Hours Input Group with Icon */}
                        <Form.Group controlId="hours" className="mb-3">
                            <Form.Label>الساعات</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaHourglassHalf /></InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    min="0"
                                    placeholder="أدخل عدد الساعات"
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Minutes Input Group with Icon */}
                        <Form.Group controlId="minutes" className="mb-3">
                            <Form.Label>الدقائق</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaClock /></InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => setMinutes(Number(e.target.value))}
                                    min="0"
                                    max="59"
                                    placeholder="أدخل عدد الدقائق"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        اغلاق
                    </Button>
                    <Button variant="primary" onClick={handleTimerSubmit}>
                        ضبط المؤقت
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TimerModalAdd;
