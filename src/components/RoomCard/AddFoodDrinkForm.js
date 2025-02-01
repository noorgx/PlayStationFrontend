import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const AddFoodDrinkForm = ({ show, handleClose, handleSubmit }) => {
    const [foodDrinks, setFoodDrinks] = useState([]);
    const [selectedItem, setSelectedItem] = useState({
        id: '', // Add id to the state
        item_name: '',
        price: 0,
        quantity: 1,
        maxQuantity: 1,
        image_link: '' // Add image link to the state
    });

    // Fetch food/drinks when the component mounts
    useEffect(() => {
        if (show) {
            fetchFoodDrinks();
        }
    }, [show]);

    // Fetch the list of food and drinks from the server
    const fetchFoodDrinks = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks');
            setFoodDrinks(response.data);
        } catch (error) {
            console.error('Error fetching food/drinks:', error);
        }
    };

    // Handle selection of an item from the dropdown
    const handleItemChange = (e) => {
        const selectedId = e.target.value;
        const selected = foodDrinks.find((item) => item.id === selectedId);
        if (selected) {
            setSelectedItem({
                id: selected.id, // Set the id
                item_name: selected.item_name,
                price: selected.price,
                quantity: 1,
                maxQuantity: selected.quantity,
                image_link: selected.image_link || '' // Handle image link
            });
        }
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (newQuantity > selectedItem.maxQuantity) {
            alert(`الكمية لا يمكن أن تتجاوز ${selectedItem.maxQuantity}`);
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

    // Handle form submission
    const handleFormSubmit = () => {
        if (selectedItem.quantity > selectedItem.maxQuantity) {
            alert(`الكمية لا يمكن أن تتجاوز ${selectedItem.maxQuantity}`);
            return;
        }
        handleSubmit(selectedItem); // Pass the selected item to the parent component
        setSelectedItem({ id: '', item_name: '', price: 0, quantity: 1, maxQuantity: 1, image_link: '' }); // Reset form
    };

    // Set default image if the image_link is not provided
    const imagePreview = selectedItem.image_link || 'https://socrates-ca.github.io/team-socrates-2024.jpg';

    return (
        <div dir="rtl">
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة ماكولات/مشروبات</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div dir="rtl">
                        {/* Image Preview Section */}
                        {imagePreview && (
                            <div className="mb-3">
                                <img
                                    src={imagePreview}
                                    alt="Image Preview"
                                    style={{ maxWidth: '25%', height: 'auto', display: 'block' }}
                                />
                            </div>
                        )}
                        <Form>
                            <Form.Group controlId="formItemName">
                                <Form.Label>اختر العنصر</Form.Label>
                                <Form.Control as="select" onChange={handleItemChange} value={selectedItem.id}>
                                    <option value="">اختر عنصراً</option>
                                    {foodDrinks.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.item_name} - {item.price}     (متاح: {item.quantity})
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="formQuantity">
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
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        إغلاق
                    </Button>
                    <Button variant="primary" onClick={handleFormSubmit}>
                        إضافة العنصر
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AddFoodDrinkForm;
