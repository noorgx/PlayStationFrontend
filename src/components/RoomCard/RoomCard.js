import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Row, Col, Modal, Badge } from 'react-bootstrap';
import { FaPlay, FaStop, FaClock, FaDoorOpen, FaUser, FaUsers, FaInfoCircle } from 'react-icons/fa'; // Import icons
import MachineSelector from './MachineSelector';
import TimerModal from './TimerModal';
import TimerDisplay from './TimerDisplay';
import RoomStatus from './RoomStatus';
import RoomDetails from './RoomDetails';
import { fetchCustomerData, submitRoomData } from './utils/api';
import notificationSound from './notification.mp3';
import axios from 'axios';

const RoomCard = ({ room, machines, customer: initialCustomer }) => {
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isTimer, setIsTimer] = useState(false);
    const [mode, setMode] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [customer, setCustomer] = useState(initialCustomer);
    const audioRef = useRef(null);
    const [totalCost, setTotalCost] = useState(0);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [hasPlayedNotification, setHasPlayedNotification] = useState(false); // Track if notification has been played

    // Fetch customers data
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Update customer state when initialCustomer changes
    useEffect(() => {
        if (initialCustomer) {
            setCustomer(initialCustomer);
        }
    }, [initialCustomer]);

    // Update UI based on customer state
    useEffect(() => {
        if (customer) {
            setIsOpen(customer.is_open_time);
            setIsTimer(!customer.is_open_time);
            setMode(customer.current_machine.multi_single);
            setSelectedMachine(machines.find((m) => m.machine_name === customer.current_machine.machine_name));
            setTotalCost(customer.total_cost);
            if (customer.start_time) setStartTime(new Date(customer.start_time));
            if (customer.end_time) setEndTime(new Date(customer.end_time));
        }
    }, [customer, machines]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (startTime) {
            setIsTimerRunning(true);
            interval = setInterval(() => {
                const now = new Date();
                if (endTime) {
                    const timeDiff = endTime - now;
                    if (timeDiff > 0) {
                        setTimeLeft(timeDiff);
                    } else {
                        setTimeLeft(0);
                        clearInterval(interval);
                        setIsTimerRunning(false);

                        // Play notification sound only once
                        if (!hasPlayedNotification && audioRef.current) {
                            audioRef.current.play();
                            setHasPlayedNotification(true); // Mark notification as played
                        }
                    }
                } else {
                    const timeElapsed = now - startTime;
                    setTimeLeft(timeElapsed);
                }
            }, 1000);
        }
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, startTime, endTime, hasPlayedNotification]); // Add hasPlayedNotification to dependencies

    // Callback function to update customer state
    const updateCustomer = (updatedCustomer) => {
        setCustomer(updatedCustomer);
    };

    // Event handlers
    const handleMachineChange = (e) => {
        const machineId = e.target.value;
        const machine = machines.find((m) => m.id === machineId);
        setSelectedMachine(machine);
    };

    const handleOpen = () => {
        setIsTimer(false);
        setIsOpen(true);
        setEndTime(null);
        alert('الوقت Open');
    };

    const handleTimer = () => {
        setIsTimer(true);
        setIsOpen(false);
        setShowTimerModal(true);
    };

    const handleSingle = () => {
        setMode('Single');
        alert('تم اختيار وضع الفردي');
    };

    const handleMulti = () => {
        setMode('Multi');
        alert('تم اختيار وضع الزوجي');
    };

    const handleStart = async () => {
        if (!selectedMachine || !mode || (!isOpen && !isTimer)) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setIsTimerRunning(true);

        const currentTime = new Date();
        const newEndTime = new Date(currentTime);
        newEndTime.setHours(newEndTime.getHours() + hours);
        newEndTime.setMinutes(newEndTime.getMinutes() + minutes);

        setEndTime(newEndTime);

        const updatedCustomer = await fetchCustomerData(room);
        if (updatedCustomer) {
            setCustomer(updatedCustomer);
            if (updatedCustomer.start_time) setStartTime(new Date(updatedCustomer.start_time));
            if (updatedCustomer.end_time) setEndTime(new Date(updatedCustomer.end_time));
        }

        const pricePerHour = mode === 'Single' ? selectedMachine.price_per_hour_single : selectedMachine.price_per_hour_multi;
        const roomData = {
            customer_name: room,
            end_time: newEndTime.toISOString(),
            total_cost: totalCost,
            drinks_foods: [],
            current_machine: {
                room: room,
                machine_name: selectedMachine.machine_name,
                price_per_hour_single: selectedMachine.price_per_hour_single,
                price_per_hour_multi: selectedMachine.price_per_hour_multi,
                multi_single: mode,
                logs: [],
            },
            price_per_hour: pricePerHour,
            duration_hours: hours,
            duration_minutes: minutes,
            isOpenTime: isOpen,
        };

        try {
            const response = await submitRoomData(roomData);
            if (response.status === 201) {
                window.location.reload();
            }
        } catch (error) {
            alert('حدث خطأ أثناء إرسال بيانات الغرفة.');
        }
    };

    const handleTimerSubmit = () => {
        const newEndTime = new Date();
        newEndTime.setHours(newEndTime.getHours() + hours);
        newEndTime.setMinutes(newEndTime.getMinutes() + minutes);

        setEndTime(newEndTime);
        setShowTimerModal(false);
    };

    return (
        <div dir="rtl">
            <Card className="mb-4">
                <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
                <Card.Header className="text-center position-relative">
                    {/* Room Name */}
                    <h5 className="mb-0">{room}</h5>
                    {/* Status Indicators */}
                    <div className="position-absolute top-0 end-0 d-flex gap-2 p-2">
                        {isTimer && (
                            <Badge bg="warning" className="d-flex align-items-center">
                                <FaClock className="me-2" /> وضع المؤقت
                            </Badge>
                        )}
                        {isOpen && (
                            <Badge bg="success" className="d-flex align-items-center">
                                <FaDoorOpen className="me-2" /> Open
                            </Badge>
                        )}
                        {mode === 'Single' && (
                            <Badge bg="primary" className="d-flex align-items-center">
                                <FaUser className="me-2" /> فردي
                            </Badge>
                        )}
                        {mode === 'Multi' && (
                            <Badge bg="success" className="d-flex align-items-center">
                                <FaUsers className="me-2" /> زوجي
                            </Badge>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    {selectedMachine && (
                        <div className="text-center mb-3">
                            <img
                                src={selectedMachine.image_link || 'https://socrates-ca.github.io/team-socrates-2024.jpg'}
                                alt={selectedMachine.machine_name}
                                style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
                            />
                        </div>
                    )}

                    <MachineSelector
                        machines={machines}
                        selectedMachine={selectedMachine}
                        handleMachineChange={handleMachineChange}
                        disabled={isTimerRunning} // Disable machine selector when timer is running
                    />

                    {/* Centered Buttons for Timer, Open, Single, and Multi */}
                    <div className="d-flex flex-column align-items-center gap-2 mb-3">
                        {!startTime && (
                            <>
                                <div className="d-flex gap-2">
                                    <Button variant="primary" onClick={handleOpen} disabled={isOpen}>
                                        <FaDoorOpen className="me-2" /> {isOpen ? 'Open' : 'Open'}
                                    </Button>
                                    <Button variant="secondary" onClick={handleTimer}>
                                        <FaClock className="me-2" /> مؤقت
                                    </Button>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={mode === 'Single' ? 'primary' : 'outline-primary'}
                                        onClick={handleSingle}
                                        disabled={isTimerRunning}
                                    >
                                        <FaUser className="me-2" /> فردي
                                    </Button>
                                    <Button
                                        variant={mode === 'Multi' ? 'success' : 'outline-success'}
                                        onClick={handleMulti}
                                        disabled={isTimerRunning}
                                    >
                                        <FaUsers className="me-2" /> زوجي
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    <TimerDisplay timeLeft={timeLeft} />

                    {!startTime && (
                        <Row className="mb-3">
                            <Col className="d-flex justify-content-center">
                                <Button variant="success" onClick={handleStart}>
                                    <FaPlay className="me-2" /> بدء
                                </Button>
                            </Col>
                        </Row>
                    )}

                    {startTime && (
                        <Row className="mb-3">
                            <Col className="d-flex justify-content-center">
                                <Button variant="info" onClick={() => setShowDetailsModal(true)}>
                                    <FaInfoCircle className="me-2" /> تفاصيل
                                </Button>
                            </Col>
                        </Row>
                    )}

                    <RoomStatus isOpen={isOpen} mode={mode} startTime={startTime} endTime={endTime} />
                </Card.Body>

                {/* Timer Modal */}
                <TimerModal
                    show={showTimerModal}
                    onHide={() => setShowTimerModal(false)}
                    handleTimerSubmit={handleTimerSubmit}
                    hours={hours}
                    setHours={setHours}
                    minutes={minutes}
                    setMinutes={setMinutes}
                />
                <div dir="rtl">
                    {/* Details Modal */}
                    <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                        <div dir="rtl">
                            <div dir="ltr">
                            <Modal.Header closeButton>
                                <Modal.Title>تفاصيل الغرفة</Modal.Title>
                            </Modal.Header>
                            </div>
                            <Modal.Body>
                                <RoomDetails
                                    customer={customer}
                                    fetchCustomers={fetchCustomers}
                                    updateCustomer={updateCustomer}
                                />
                            </Modal.Body>
                        </div>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                                إغلاق
                            </Button>
                        </Modal.Footer>

                    </Modal>
                </div>
            </Card>
        </div>
    );
};

export default RoomCard;