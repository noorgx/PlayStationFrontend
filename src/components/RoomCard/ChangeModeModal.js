import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave, FaTimes, FaUser, FaUsers } from 'react-icons/fa';

const ChangeModeModal = ({ show, handleClose, currentMode, pricePerHourSingle, pricePerHourMulti, handleChangeMode }) => {
    // State for the new mode and new price per hour
    const [newMode, setNewMode] = useState(currentMode);
    const [newPricePerHour, setNewPricePerHour] = useState(
        currentMode === 'Single' ? pricePerHourSingle : pricePerHourMulti
    );

    // Calculate the old price per hour dynamically
    const oldPricePerHour = currentMode === 'Single' ? pricePerHourSingle : pricePerHourMulti;

    // Update newPricePerHour when the mode changes
    useEffect(() => {
        setNewPricePerHour(newMode === 'Single' ? pricePerHourSingle : pricePerHourMulti);
    }, [newMode, pricePerHourSingle, pricePerHourMulti]);

    const handleSubmit = () => {
        // Pass old and new values to handleChangeMode
        handleChangeMode(currentMode, newMode, oldPricePerHour, newPricePerHour);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered dir="rtl">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUsers className="me-2" /> تغيير الوضع
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="mode">
                        <Form.Label>الوضع</Form.Label>
                        <Row>
                            <Col md={6}>
                                <Button
                                    variant={newMode === 'Single' ? 'primary' : 'outline-secondary'}
                                    onClick={() => setNewMode('Single')}
                                    className="w-100 mb-2"
                                >
                                    <FaUser className="me-2" /> فردي
                                </Button>
                            </Col>
                            <Col md={6}>
                                <Button
                                    variant={newMode === 'Multi' ? 'primary' : 'outline-secondary'}
                                    onClick={() => setNewMode('Multi')}
                                    className="w-100 mb-2"
                                >
                                    <FaUsers className="me-2" /> زوجي
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    <FaTimes className="me-2" /> إغلاق
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    <FaSave className="me-2" /> حفظ التغييرات
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChangeModeModal;
