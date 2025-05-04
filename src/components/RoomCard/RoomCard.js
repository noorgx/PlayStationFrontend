import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Row, Col, Modal, Badge, ProgressBar, Form } from 'react-bootstrap';
import {
    FaPlay, FaStop, FaClock, FaDoorOpen, FaUser,
    FaUsers, FaInfoCircle, FaMoneyBillWave, FaCoins
} from 'react-icons/fa';
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
    const [machineDiscount, setDiscount] = useState(0);
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

    // Fetch customers data
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/customers');
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
        const hasPlayedNotification = localStorage.getItem(`${room}-hasPlayedNotification`) === 'true';

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
                            localStorage.setItem(`${room}-hasPlayedNotification`, 'true'); // Mark notification as played
                        }
                    }
                } else {
                    localStorage.setItem(`${room}-hasPlayedNotification`, 'true'); // Mark notification as played
                    const timeElapsed = now - startTime;
                    setTimeLeft(timeElapsed);
                }
            }, 1000);
        }

        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [isTimerRunning, startTime, endTime, room]);

    // Callback function to update customer state
    const updateCustomer = (updatedCustomer) => {
        setCustomer(updatedCustomer);
    };

    // Event handlers
    const handleMachineChange = (e) => {
        const machineId = e.target.value;
        const machine = machines.find((m) => m.id === machineId);
        setSelectedMachine(machine);
        setDiscount(parseInt(machine.discount, 10));
    };

    const handleOpen = () => {
        setIsTimer(false);
        setIsOpen(true);
        setEndTime(null);
    };

    const handleTimer = () => {
        setIsTimer(true);
        setIsOpen(false);
        setShowTimerModal(true);
    };

    const handleSingle = () => {
        setMode('Single');
    };

    const handleMulti = () => {
        setMode('Multi');
    };

    const handleStart = async () => {
        if (!selectedMachine || !mode || (!isOpen && !isTimer)) {
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
                discount: machineDiscount,
                logs: [],
            },
            price_per_hour: pricePerHour - ((machineDiscount / 100) * pricePerHour),
            duration_hours: hours,
            duration_minutes: minutes,
            isOpenTime: isOpen,
        };

        try {
            const response = await submitRoomData(roomData);
            if (response.status === 201) {
                localStorage.setItem(`${room}-hasPlayedNotification`, 'false'); // Reset notification state on reload
                window.location.reload();
            }
        } catch (error) {
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
        <div dir="rtl" className="mb-4">
            <Card className="shadow-lg">
                <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
                <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                    <h4 className="mb-0 fw-bold">{room}</h4>
                    <div className="d-flex gap-2">
                        {isTimer && (
                            <Badge bg="warning" className="d-flex align-items-center py-2">
                                <FaClock className="me-2" /> مؤقت
                            </Badge>
                        )}
                        {isOpen && (
                            <Badge bg="success" className="d-flex align-items-center py-2">
                                <FaDoorOpen className="me-2" /> مفتوح
                            </Badge>
                        )}
                        {mode === 'Single' && (
                            <Badge bg="info" className="d-flex align-items-center py-2">
                                <FaUser className="me-2" /> فردي
                            </Badge>
                        )}
                        {mode === 'Multi' && (
                            <Badge bg="success" className="d-flex align-items-center py-2">
                                <FaUsers className="me-2" /> زوجي
                            </Badge>
                        )}
                    </div>
                </Card.Header>

                <Card.Body>
                    {/* Machine Image and Selector */}
                    <Row className="mb-4">

                        {selectedMachine && (
                            <img
                                src={selectedMachine.image_link || 'https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/rMadI-Zz9l0vd44f0/videoblocks-question-mark-symbol_hbcmmg3ea_thumbnail-1080_01.png'}
                                alt={selectedMachine.machine_name}
                                className="img-fluid rounded-3 border"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                            />
                        )}

                        <MachineSelector
                            machines={machines}
                            selectedMachine={selectedMachine}
                            handleMachineChange={handleMachineChange}
                            disabled={startTime}
                        />
                        {selectedMachine && (
                            <div className="mt-3 p-3 bg-light rounded">
                                <h5 className="text-primary">
                                    <FaMoneyBillWave className="me-2" />
                                    الأسعار:
                                </h5>
                                <div className="d-flex justify-content-around">
                                    <div>
                                        <FaUser className="text-info me-2" />
                                        فردي: {selectedMachine.price_per_hour_single}
                                    </div>
                                    <div>
                                        <FaUsers className="text-success me-2" />
                                        زوجي: {selectedMachine.price_per_hour_multi}
                                    </div>
                                </div>
                            </div>
                        )}

                    </Row>

                    {/* Mode Selection and Controls */}
                    <div className="bg-light p-3 rounded mb-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant={mode === 'Single' ? 'info' : 'outline-info'}
                                        onClick={handleSingle}
                                        disabled={isTimerRunning}
                                        size="lg"
                                    >
                                        <FaUser className="me-2" />
                                        وضع الفردي
                                    </Button>
                                    <Button
                                        variant={mode === 'Multi' ? 'success' : 'outline-success'}
                                        onClick={handleMulti}
                                        disabled={isTimerRunning}
                                        size="lg"
                                    >
                                        <FaUsers className="me-2" />
                                        وضع الزوجي
                                    </Button>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="outline-primary"
                                        onClick={handleOpen}
                                        disabled={isOpen}
                                        size="lg"
                                    >
                                        <FaDoorOpen className="me-2" />
                                        {isOpen ? 'Open' : 'Open'}
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={handleTimer}
                                        size="lg"
                                    >
                                        <FaClock className="me-2" />
                                        بدء المؤقت
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Timer Display */}
                    {timeLeft !== null && (
                        <div
                            className={`mb-4 p-3 text-white rounded text-center ${isTimer
                                    ? timeLeft > 0
                                        ? 'bg-danger' // Red background when the timer is still running
                                        : 'bg-success' // Green background when the timer is finished
                                    : 'bg-dark' // Default dark background when isTimer is false
                                }`}
                        >
                            <h4 className="mb-3">
                                <FaClock className="me-2" />
                                الوقت المتبقي
                            </h4>
                            <TimerDisplay timeLeft={timeLeft} />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <Row className="g-3">
                        {!startTime ? (
                            <Col>
                                <Button
                                    variant="success"
                                    onClick={handleStart}
                                    size="lg"
                                    className="w-100 py-3"
                                >
                                    <FaPlay className="me-2" />
                                    بدء الجلسة
                                </Button>
                            </Col>
                        ) : (
                            <Col>
                                <Button
                                    variant="info"
                                    onClick={() => setShowDetailsModal(true)}
                                    size="lg"
                                    className="w-100 py-3"
                                >
                                    <FaInfoCircle className="me-2" />
                                    عرض التفاصيل الكاملة
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card.Body>

                {/* Modals */}
                <TimerModal
                    show={showTimerModal}
                    onHide={() => setShowTimerModal(false)}
                    handleTimerSubmit={handleTimerSubmit}
                    hours={hours}
                    setHours={setHours}
                    minutes={minutes}
                    setMinutes={setMinutes}
                />

                <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
                    <div dir="rtl">
                        <Modal.Header closeButton className="bg-primary text-white">
                            <Modal.Title>
                                <FaInfoCircle className="me-2" />
                                تفاصيل الغرفة - {room}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <RoomDetails
                                customer={customer}
                                fetchCustomers={fetchCustomers}
                                updateCustomer={updateCustomer}
                            />
                        </Modal.Body>
                    </div>
                </Modal>
            </Card>
        </div>
    );
};

export default RoomCard;