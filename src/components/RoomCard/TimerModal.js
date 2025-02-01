// src/components/RoomCard/TimerModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const TimerModal = ({ show, onHide, handleTimerSubmit, hours, setHours, minutes, setMinutes }) => {
    return (
        <div dir="rtl">
            <Modal show={show} onHide={onHide}>

                <Modal.Header closeButton>
                    <Modal.Title>ضبط المؤقت</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="hours" className="mb-3">
                            <Form.Label>الساعات</Form.Label>
                            <Form.Control
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group controlId="minutes" className="mb-3">
                            <Form.Label>الدقايق</Form.Label>
                            <Form.Control
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Number(e.target.value))}
                                min="0"
                                max="59"
                            />
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

export default TimerModal;
