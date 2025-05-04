import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave, FaTimes, FaUser, FaUsers, FaGamepad } from 'react-icons/fa';
import axios from 'axios';

const ChangeModeModal = ({ show, handleClose, currentMode, currentMachine, currentRoom, pricePerHourSingle, pricePerHourMulti, handleChangeMode }) => {
    // State for the new mode, machine, room, and new price per hour
    const [newMode, setNewMode] = useState(currentMode);
    const [newPricePerHour, setNewPricePerHour] = useState(
        currentMode === 'Single' ? pricePerHourSingle : pricePerHourMulti
    );
    const [newMachine, setNewMachine] = useState(currentMachine); // Default value, can be dynamic
    const [newRoom, setNewRoom] = useState(currentRoom); // Default room, can be dynamic
    const [machines, setMachines] = useState([]);
    const [filteredMachines, setFilteredMachines] = useState([]); // Filtered machines based on room
    const [rooms, setRooms] = useState([]); // List of rooms
    const [customers, setCustomers] = useState([]); // List of customers using machines
    // Calculate the old price per hour dynamically
    const oldPricePerHour = currentMode === 'Single' ? pricePerHourSingle : pricePerHourMulti;

    // Fetch all machines
    const fetchMachines = async () => {
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/machines');
            setMachines(response.data);
        } catch (error) {
            console.error('خطأ في جلب الأجهزة:', error);
        }
    };

    // Fetch all customers
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('خطأ في جلب العملاء:', error);
        }
    };

    // Group machines by room and filter based on the selected room
    const groupMachinesByRoom = () => {
        const groupedMachines = {};
        machines.forEach((machine) => {
            if (!groupedMachines[machine.room]) {
                groupedMachines[machine.room] = [];
            }
            groupedMachines[machine.room].push(machine);
        });
        return groupedMachines;
    };

    // Fetch machines and customers on component mount
    useEffect(() => {
        fetchMachines();
        fetchCustomers();
    }, []);

    // Filter rooms that are not currently in use by customers, but include the current room
    const filterAvailableRooms = () => {
        const groupedMachines = groupMachinesByRoom();
        const roomList = Object.keys(groupedMachines); // Get a list of all room numbers
        console.log(groupedMachines)
        // Find rooms that are not in use by customers, but include the current room
        const availableRooms = roomList.filter((room) => {
            const customer = customers.find((c) => c.current_machine.room === room);
            return !customer || room === currentRoom; // Keep rooms that are not used or are the current room
        });

        setRooms(availableRooms); // Update the rooms state
        setFilteredMachines(groupedMachines[newRoom] || []); // Set machines for the selected room
        setNewMachine(groupedMachines[newRoom] && groupedMachines[newRoom][0]?.machine_name); // Set the first machine as default
    };

    // Update available rooms and filtered machines when customers or machines data change
    useEffect(() => {
        if (machines.length > 0) {
            filterAvailableRooms(); // Filter the rooms only when both customers and machines are fetched
        }
    }, [customers, machines, newRoom]);

    // Update newPricePerHour when the mode changes
    useEffect(() => {
        setNewPricePerHour(newMode === 'Single' ? pricePerHourSingle : pricePerHourMulti);
    }, [newMode, pricePerHourSingle, pricePerHourMulti]);

    const handleSubmit = () => {
        console.log(newMachine);
        // Pass old and new values including machine and room to handleChangeMode
        handleChangeMode(currentMode, newMode, oldPricePerHour, newPricePerHour, newMachine, newRoom);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered dir="rtl">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaGamepad className="me-2" /> تغيير الوضع والآلة والغرفة
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

                    <Form.Group controlId="room">
                        <Form.Label>الغرفة</Form.Label>
                        <Form.Control
                            as="select"
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                        >
                            {rooms.length === 0 ? (
                                <option>لا توجد غرف متاحة</option>
                            ) : (
                                rooms.map((room) => (
                                    <option key={room} value={room}>
                                        غرفة {room}
                                    </option>
                                ))
                            )}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="machine">
                        <Form.Label>الآلة</Form.Label>
                        <Form.Control
                            as="select"
                            value={newMachine}
                            onChange={(e) => {
                                const selectedMachine = e.target.value;
                                setNewMachine(selectedMachine);
                                const selectedOption = e.target.selectedOptions[0]; // Get the first selected <option>
                                // Set new price per hour based on the selected mode
                                setNewPricePerHour(newMode === 'Single' ? selectedOption.getAttribute('single') : selectedOption.getAttribute('multi'));
                            }}
                            disabled={filteredMachines.length === 0} // Disable if no machines in the selected room
                        >
                            {filteredMachines.length === 0 ? (
                                <option>لا توجد أجهزة متاحة لهذه الغرفة</option>
                            ) : (
                                filteredMachines.map((machine) => (
                                    <option key={machine.id} value={machine.machine_name} multi={machine.price_per_hour_multi} single={machine.price_per_hour_single}>
                                        {machine.machine_name}
                                    </option>
                                ))
                            )}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    <FaTimes className="me-2" /> إغلاق
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={filteredMachines.length === 0}>
                    <FaSave className="me-2" /> حفظ التغييرات
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChangeModeModal;
