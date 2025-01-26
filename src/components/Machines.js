// src/components/Machines.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMachine, setCurrentMachine] = useState({
    id: '',
    machine_type: '',
    machine_name: '',
    price_per_hour_single: '',
    price_per_hour_multi: '',
    is_available: false,
    room: '',
  });

  // Retrieve user from local storage
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role; // Get the user's role

  // Fetch all machines
  const fetchMachines = async () => {
    try {
      const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentMachine({
      ...currentMachine,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update machine
        await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/machines/${currentMachine.id}`, currentMachine);
      } else {
        // Add new machine
        await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/machines', currentMachine);
      }
      setShowModal(false);
      fetchMachines(); // Refresh the list
    } catch (error) {
      console.error('Error saving machine:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (machine) => {
    setCurrentMachine(machine);
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/machines/${id}`);
      fetchMachines(); // Refresh the list
    } catch (error) {
      console.error('Error deleting machine:', error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setCurrentMachine({
      id: '',
      machine_type: '',
      machine_name: '',
      price_per_hour_single: '',
      price_per_hour_multi: '',
      is_available: false,
      room: '',
    });
    setEditMode(false);
    setShowModal(false);
  };

  return (
    <Container className="mt-4"> {/* Add margin-top to the container */}
      <h2 className="mb-4">Machines</h2> {/* Add margin-bottom to the heading */}
      
      {/* Only show "Add Machine" button if user is admin */}
      {userRole === 'admin' && (
        <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
          Add Machine
        </Button>
      )}

      {/* Responsive Table */}
      <Table striped bordered hover responsive className="mb-4"> {/* Add margin-bottom to the table */}
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Price (Single)</th>
            <th>Price (Multi)</th>
            <th>Available</th>
            <th>Room</th>
            {/* Only show "Actions" column if user is admin */}
            {userRole === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.id}>
              <td>{machine.machine_type}</td>
              <td>{machine.machine_name}</td>
              <td>{machine.price_per_hour_single}</td>
              <td>{machine.price_per_hour_multi}</td>
              <td>{machine.is_available ? 'Yes' : 'No'}</td>
              <td>{machine.room}</td>
              {/* Only show edit/delete buttons if user is admin */}
              {userRole === 'admin' && (
                <td>
                  <Button variant="warning" onClick={() => handleEdit(machine)} className="me-2">
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(machine.id)}>
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Machine Modal */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Machine' : 'Add Machine'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="machineType" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Machine Type</Form.Label>
              <Form.Control
                type="text"
                name="machine_type"
                value={currentMachine.machine_type}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="machineName" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Machine Name</Form.Label>
              <Form.Control
                type="text"
                name="machine_name"
                value={currentMachine.machine_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="pricePerHourSingle" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Price Per Hour (Single)</Form.Label>
              <Form.Control
                type="number"
                name="price_per_hour_single"
                value={currentMachine.price_per_hour_single}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="pricePerHourMulti" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Price Per Hour (Multi)</Form.Label>
              <Form.Control
                type="number"
                name="price_per_hour_multi"
                value={currentMachine.price_per_hour_multi}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="isAvailable" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Check
                type="checkbox"
                name="is_available"
                label="Is Available"
                checked={currentMachine.is_available}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="room" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Room</Form.Label>
              <Form.Control
                type="text"
                name="room"
                value={currentMachine.room}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Machines;