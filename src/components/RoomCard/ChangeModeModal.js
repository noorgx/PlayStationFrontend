import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

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
        <div dir="rtl">
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>تغيير الوضع</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div dir="rtl">
                <Form>
                    <Form.Group controlId="mode">
                        <Form.Label>الوضع</Form.Label>
                        <Form.Control
                            as="select"
                            value={newMode}
                            onChange={(e) => {
                                const selectedMode = e.target.value;
                                setNewMode(selectedMode);
                            }}
                        >
                            <option value="Single">فردي</option>
                            <option value="Multi">زوجي</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    إغلاق
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    حفظ التغييرات
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    );
};

export default ChangeModeModal;
