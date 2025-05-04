import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaUtensils, FaPlus, FaTimes } from 'react-icons/fa';

const AddFoodDrinkForm = ({ show, handleClose, handleSubmit }) => {
    const [foodDrinks, setFoodDrinks] = useState([]);
    const [selectedItem, setSelectedItem] = useState({
        id: '', 
        item_name: '',
        price: 0,
        quantity: 1,
        maxQuantity: 1,
        image_link: ''
    });

    useEffect(() => {
        if (show) {
            fetchFoodDrinks();
        }
    }, [show]);

    const fetchFoodDrinks = async () => {
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/food-drinks');
            setFoodDrinks(response.data);
        } catch (error) {
            console.error('Error fetching food/drinks:', error);
        }
    };

    const handleItemChange = (e) => {
        const selectedId = e.target.value;
        const selected = foodDrinks.find((item) => item.id === selectedId);
        if (selected) {
            setSelectedItem({
                id: selected.id,
                item_name: selected.item_name,
                price: selected.price,
                quantity: 1,
                maxQuantity: selected.quantity,
                image_link: selected.image_link || ''
            });
        }
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (newQuantity > selectedItem.maxQuantity) {
            setSelectedItem({
                ...selectedItem,
                quantity: selectedItem.maxQuantity,
            });
        } else {
            setSelectedItem({
                ...selectedItem,
                quantity: newQuantity,
            });
        }
    };

    const handleFormSubmit = () => {
        if (selectedItem.quantity > selectedItem.maxQuantity) {
            return;
        }
        handleSubmit(selectedItem); 
        setSelectedItem({ id: '', item_name: '', price: 0, quantity: 1, maxQuantity: 1, image_link: '' });
    };

    const imagePreview = selectedItem.image_link || 'https://socrates-ca.github.io/team-socrates-2024.jpg';

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUtensils className="me-2" /> إضافة مأكولات/مشروبات
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3 text-center">
                    {/* Image Preview Section */}
                    {imagePreview && (
                        <Col>
                            <img
                                src={imagePreview}
                                alt="Image Preview"
                                style={{ maxWidth: '50%', height: 'auto' }}
                                className="img-fluid rounded shadow-sm"
                            />
                        </Col>
                    )}
                </Row>

                <Form>
                    <Form.Group controlId="formItemName">
                        <Form.Label>اختر العنصر</Form.Label>
                        <Form.Control as="select" onChange={handleItemChange} value={selectedItem.id}>
                            <option value="">اختر عنصراً</option>
                            {foodDrinks.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.item_name} - {item.price} (متاح: {item.quantity})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formQuantity" className="mt-3">
                        <Form.Label>الكمية</Form.Label>
                        <Form.Control
                            type="number"
                            name="quantity"
                            value={selectedItem.quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            max={selectedItem.maxQuantity}
                        />
                        <Form.Text className="text-muted">
                            الكمية القصوى: {selectedItem.maxQuantity}
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    <FaTimes className="me-1" /> إغلاق
                </Button>
                <Button variant="primary" onClick={handleFormSubmit}>
                    <FaPlus className="me-1" /> إضافة العنصر
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddFoodDrinkForm;
