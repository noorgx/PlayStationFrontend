import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaImage, FaUtensils, FaGlassCheers } from 'react-icons/fa'; // Import icons

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
    image_link: '', // New field for image link
  });
  const [imagePreview, setImagePreview] = useState(''); // State for image preview

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

    // If the image link changes, update the image preview
    if (name === 'image_link') {
      setImagePreview(value); // Update image preview
    }
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
    setImagePreview(item.image_link); // Set image preview from existing data
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
      image_link: '', // Reset the image link as well
    });
    setImagePreview(''); // Reset image preview
    setEditMode(false);
    setShowModal(false);
  };

  return (
    <div dir="rtl">
    <Container className="mt-4">
      <h2 className="mb-4 text-center">
        <FaUtensils className="me-2" /> المأكولات والمشروبات <FaGlassCheers className="ms-2" />
      </h2>

      {/* Only show "Add Food/Drink" button if user is admin */}
      {userRole === 'admin' && (
        <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
          <FaPlus className="me-2" /> إضافة مأكولات/مشروبات
        </Button>
      )}

      {/* Responsive Table */}
      <Card className="shadow">
        <Card.Body>
          <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>السعر الكلي</th>
                {userRole === 'admin' && <th>الإجراءات</th>}
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
                  {userRole === 'admin' && (
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(item)} className="me-2">
                        <FaEdit className="me-1" /> تعديل
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(item.id)}>
                        <FaTrash className="me-1" /> حذف
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Food/Drink Modal */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
            {editMode ? 'تعديل مأكولات/مشروبات' : 'إضافة مأكولات/مشروبات'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="itemName" className="mb-3">
              <Form.Label>اسم العنصر</Form.Label>
              <Form.Control
                type="text"
                name="item_name"
                value={currentItem.item_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="itemType" className="mb-3">
              <Form.Label>نوع العنصر</Form.Label>
              <Form.Control
                type="text"
                name="item_type"
                value={currentItem.item_type}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="price" className="mb-3">
              <Form.Label> السعر في محل</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={currentItem.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity" className="mb-3">
              <Form.Label>الكمية</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="totalPrice" className="mb-3">
              <Form.Label>السعر جملة</Form.Label>
              <Form.Control
                type="number"
                name="total_price"
                value={currentItem.total_price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* New Field for Image Link */}
            <Form.Group controlId="imageLink" className="mb-3">
              <Form.Label>
                <FaImage className="me-2" /> رابط الصورة
              </Form.Label>
              <Form.Control
                type="text"
                name="image_link"
                value={currentItem.image_link}
                onChange={handleInputChange}
                placeholder="أدخل رابط الصورة"
              />
            </Form.Group>

            {/* Show Image Preview */}
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="معاينة مأكولات/مشروبات"
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            )}

            <Button variant="primary" type="submit">
              {editMode ? 'تحديث' : 'إضافة'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
    </div>
  );
};

export default FoodDrinks;
