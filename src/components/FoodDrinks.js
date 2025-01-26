// src/components/FoodDrinks.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const FoodDrinks = () => {
  const [foodDrinks, setFoodDrinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    id: '',
    item_name: '',
    item_type: '',
    price: '',
    quantity: '',
    total_price: '',
  });

  // Retrieve user from local storage
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role; // Get the user's role

  // Fetch all food/drinks
  const fetchFoodDrinks = async () => {
    try {
      const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks');
      setFoodDrinks(response.data);
    } catch (error) {
      console.error('Error fetching food/drinks:', error);
    }
  };

  useEffect(() => {
    fetchFoodDrinks();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: value,
    });
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update food/drink item
        await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks/${currentItem.id}`, currentItem);
      } else {
        // Add new food/drink item
        await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks', currentItem);
      }
      setShowModal(false);
      fetchFoodDrinks(); // Refresh the list
    } catch (error) {
      console.error('Error saving food/drink item:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks/${id}`);
      fetchFoodDrinks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting food/drink item:', error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setCurrentItem({
      id: '',
      item_name: '',
      item_type: '',
      price: '',
      quantity: '',
      total_price: '',
    });
    setEditMode(false);
    setShowModal(false);
  };

  return (
    <Container className="mt-4"> {/* Add margin-top to the container */}
      <h2 className="mb-4">Food & Drinks</h2> {/* Add margin-bottom to the heading */}
      
      {/* Only show "Add Food/Drink" button if user is admin */}
      {userRole === 'admin' && (
        <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
          Add Food/Drink
        </Button>
      )}

      {/* Responsive Table */}
      <Table striped bordered hover responsive className="mb-4"> {/* Add margin-bottom to the table */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Price</th>
            {/* Only show "Actions" column if user is admin */}
            {userRole === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {foodDrinks.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.item_type}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.total_price}</td>
              {/* Only show edit/delete buttons if user is admin */}
              {userRole === 'admin' && (
                <td>
                  <Button variant="warning" onClick={() => handleEdit(item)} className="me-2">
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Food/Drink Modal */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Food/Drink' : 'Add Food/Drink'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="itemName" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                name="item_name"
                value={currentItem.item_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="itemType" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Item Type</Form.Label>
              <Form.Control
                type="text"
                name="item_type"
                value={currentItem.item_type}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="price" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={currentItem.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="totalPrice" className="mb-3"> {/* Add margin-bottom to form groups */}
              <Form.Label>Total Price</Form.Label>
              <Form.Control
                type="number"
                name="total_price"
                value={currentItem.total_price}
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

export default FoodDrinks;