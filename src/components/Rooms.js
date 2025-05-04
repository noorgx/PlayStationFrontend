import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaDoorClosed, FaUsers, FaGamepad } from 'react-icons/fa'; // Import meaningful icons
import RoomCard from './RoomCard/RoomCard'; // Import the RoomCard component

const Rooms = () => {
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchMachines(), fetchCustomers()]);
      setLoading(false); // Stop loading once data is fetched
    };

    fetchData();
  }, []);

  // Group machines by room
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

  const groupedMachines = groupMachinesByRoom();

  if (loading) {
    // Display a spinner while loading
    return (
      <Container className="mt-4 text-center">
        <h2 className="mb-4">الغرف</h2>
        <Spinner animation="border" variant="primary" />
        <p>جاري تحميل الغرف...</p>
      </Container>
    );
  }

  return (
    <div dir="rtl">
    <Container className="mt-4">
      <h2 className="mb-4 text-center">الغرف</h2>
      <Row>
        {Object.keys(groupedMachines).map((room) => {
          const customer = customers.find((c) => c.current_machine.room === room);
          return (
            <Col key={room} md={4} className="mb-4">
              <RoomCard
                room={room}
                machines={groupedMachines[room]}
                customer={customer}
              />
            </Col>
          );
        })}
      </Row>
    </Container>
    </div>
  );
};

export default Rooms;
