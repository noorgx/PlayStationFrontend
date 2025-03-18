import React, { useState, useRef } from 'react';
import { Card, ListGroup, Button, Modal, Row, Col, Form, Container } from 'react-bootstrap';
import { FaUtensils, FaFileInvoiceDollar, FaTrash, FaPrint } from 'react-icons/fa';
import AddFoodDrinkForm from './AddFoodDrinkForm';
import QuotePDF from '../Quotes/QuotePDF';
import axios from 'axios';

const ShopDetails = () => {
    const [showForm, setShowForm] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [manualDiscount, setManualDiscount] = useState(0);
    const [discountReason, setDiscountReason] = useState('');
    const [additionalCost, setAdditionalCost] = useState(0);
    const [additionalCostReason, setAdditionalCostReason] = useState('');
    const printableRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isRequestInProgress, setIsRequestInProgress] = useState(false);

    // Local customer state
    const [customer, setCustomer] = useState({
        id: 1, // Example ID
        current_machine: {
            room: 'متجر',
            machine_name: 'متجر',
            logs: [],
        },
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        total_cost: 0,
        drinks_foods: [],
    });

    // Handle adding a food/drink item
    const handleAddFoodDrink = (item) => {
        const updatedCustomer = { ...customer };
        console.log(item);
        // Check if the item already exists
        const existingItemIndex = updatedCustomer.drinks_foods.findIndex(
            (drinkFood) => drinkFood.item_name === item.item_name
        );

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            updatedCustomer.drinks_foods[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item
            updatedCustomer.drinks_foods.push(item);
        }

        // Update total cost
        updatedCustomer.total_cost += item.price * item.quantity;

        // Update state
        setCustomer(updatedCustomer);
        setShowForm(false);
    };

    // Handle deleting a food/drink item
    const handleDeleteDrinkFood = (index) => {
        const updatedCustomer = { ...customer };
        const deletedItem = updatedCustomer.drinks_foods.splice(index, 1)[0];

        // Update total cost
        updatedCustomer.total_cost -= deletedItem.price * deletedItem.quantity;
        if (updatedCustomer.total_cost < 0) updatedCustomer.total_cost = 0;

        // Update state
        setCustomer(updatedCustomer);
    };

    // Handle generating a quote
    const handleGenerateQuote = () => {
        const foodsDrinksCost = customer.drinks_foods.reduce((total, item) => total + item.price * item.quantity, 0);
        const machineUsageCost = customer.total_cost - foodsDrinksCost;

        const quote = {
            user_name: JSON.parse(localStorage.getItem('user')).name, // Replace with actual user name
            machine_name: customer.current_machine.machine_name,
            room: customer.current_machine.room,
            start_time: new Date(customer.start_time).toLocaleString('en-GB'),
            end_time: customer.end_time ? new Date(customer.end_time).toLocaleString('en-GB') : 'لم ينته بعد',
            total_cost: customer.total_cost.toFixed(2),
            foods_drinks_cost: foodsDrinksCost.toFixed(2),
            machine_usage_cost: machineUsageCost.toFixed(2),
            logs: customer.current_machine.logs.map((log, index) => ({
                log_number: index + 1,
                old_mode: log.old_mode,
                new_mode: log.new_mode,
                time_spent_hours: log.time_spent_hours,
                time_spent_minutes: log.time_spent_minutes,
                time_cost: log.time_cost.toFixed(2),
                old_start_time: new Date(log.old_start_time).toLocaleString('en-GB'),
                timestamp: new Date(log.timestamp).toLocaleString('en-GB'),
            })),
            food_drinks: customer.drinks_foods.map((item, index) => ({
                item_number: index + 1,
                item_name: item.item_name,
                price: item.price,
                quantity: item.quantity,
                total_cost: (item.price * item.quantity).toFixed(2),
            })),
            date: new Date().toLocaleString('en-GB'),
            baseTotal: customer.total_cost,
            manualDiscount: 0,
            discountReason: '',
            additionalCost: 0,
            additionalCostReason: '',
            finalTotal: customer.total_cost,
        };

        setQuoteDetails(quote);
        setShowQuoteModal(true);
        setSelectedQuote(quote);
    };

    // Handle payment confirmation
    const handlePaymentConfirmation = async () => {
        setIsRequestInProgress(true);
    
        const finalTotal = quoteDetails.baseTotal - manualDiscount + additionalCost;
        const updatedQuote = {
            ...quoteDetails,
            manualDiscount,
            discountReason,
            additionalCost,
            additionalCostReason,
            total_cost: finalTotal.toFixed(2),
        };
    
        // Prepare the food/drinks payload for bulk decrease
        const foodDrinksToUpdate = customer.drinks_foods.map((item) => ({
            item_name: item.item_name,
            quantityToDecrease: item.quantity
        }));
    
        // Attempt to save the quote, keep retrying until it succeeds
        let quoteSaved = false;
        while (!quoteSaved) {
            try {
                const quoteResponse = await axios.post(
                    'https://playstationbackend.netlify.app/.netlify/functions/server/quotes',
                    updatedQuote
                );
                if (quoteResponse.status === 201) {
                    console.log('Quote saved:', quoteResponse.data);
                    quoteSaved = true; // Exit loop if quote is successfully saved
                }
            } catch (error) {
                console.error('Error saving quote, retrying...', error);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            }
        }
    
        // Attempt to perform bulk decrease for food/drinks, keep retrying until it succeeds
        let bulkDecreaseCompleted = false;
        while (!bulkDecreaseCompleted) {
            try {
                const bulkDecreaseResponse = await axios.post(
                    'https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks/bulk-decrease',
                    { items: foodDrinksToUpdate }
                );
                console.log('Bulk decrease response:', bulkDecreaseResponse.data);
                bulkDecreaseCompleted = true; // Exit loop if the bulk decrease is successful
            } catch (error) {
                console.error('Error during bulk decrease, retrying...', error);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            }
        }
    
        // Reset customer state once everything is successful
        setCustomer({
            ...customer,
            total_cost: 0,
            drinks_foods: [],
        });
    
        setShowQuoteModal(false);
        setIsRequestInProgress(false);
    };
    // Handle printing
    const handlePrint = () => {
        const printSection = printableRef.current;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = <div id="print-section">${printSection.innerHTML}</div>;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    return (
        <Container fluid className="py-4" dir="rtl">
            <Card className="shadow">
                <Card.Header className="text-center bg-primary text-white">
                    <h4>تفاصيل المتجر</h4>
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <strong>وقت فاتورة:</strong> {new Date(customer.start_time).toLocaleString('en-GB')}
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <strong>إجمالي التكلفة:</strong> {customer.total_cost.toFixed(2)}
                        </ListGroup.Item>
                        {customer.drinks_foods.length > 0 && (
                            <ListGroup.Item>
                                <strong>المشروبات/المأكولات:</strong>
                                <ul className="list-unstyled">
                                    {customer.drinks_foods.map((item, index) => (
                                        <li key={index} className="d-flex justify-content-between align-items-center">
                                            <span>
                                                {item.item_name} - {item.price} (الكمية: {item.quantity})
                                            </span>
                                            <Button variant="link" onClick={() => handleDeleteDrinkFood(index)}>
                                                <FaTrash className="text-danger" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </ListGroup.Item>
                        )}
                    </ListGroup>

                    <Row className="mt-4 justify-content-center">
                        <Col xs={12} md={6} className="d-flex flex-wrap justify-content-center gap-2">
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                <FaUtensils className="me-2" /> إضافة طعام/شراب
                            </Button>
                            <Button variant="success" onClick={handleGenerateQuote}>
                                <FaFileInvoiceDollar className="me-2" /> انشاء الفاتورة
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <AddFoodDrinkForm
                show={showForm}
                handleClose={() => setShowForm(false)}
                handleSubmit={handleAddFoodDrink}
            />

            <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>تفاصيل الفاتورة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div dir="rtl">
                        <p><strong>اسم الجهاز:</strong> {quoteDetails?.machine_name}</p>
                        <p><strong>الغرفة:</strong> {quoteDetails?.room}</p>
                        <p><strong>وقت فاتورة:</strong> {quoteDetails?.date}</p>
                        <p><strong>إجمالي التكلفة:</strong> {quoteDetails?.total_cost}</p>
                        <p><strong>تكلفة المأكولات/المشروبات:</strong> {quoteDetails?.foods_drinks_cost}</p>
                        <p><strong>تكلفة استخدام الجهاز:</strong> {quoteDetails?.machine_usage_cost}</p>
                        <h5>السجلات:</h5>
                        <ul>
                            {quoteDetails?.logs.map((log, index) => (
                                <li key={index}>
                                    <strong>السجل {log.log_number}:</strong> تم تغيير الوضع من "{log.old_mode}" إلى "{log.new_mode}" <br />
                                    (الوقت المنقضي: {log.time_spent_hours} ساعات {log.time_spent_minutes} دقائق، التكلفة: {log.time_cost}) <br />
                                    من {log.old_start_time} إلى {log.timestamp}
                                </li>
                            ))}
                        </ul>

                        <h5>المأكولات/المشروبات:</h5>
                        <ul>
                            {quoteDetails?.food_drinks.map((item, index) => (
                                <li key={index}>
                                    <strong>السلعة {item.item_number}:</strong> {item.item_name}, السعر: {item.price}, الكمية: {item.quantity}, التكلفة الإجمالية: {item.total_cost}
                                </li>
                            ))}
                        </ul>

                        <p><strong>التاريخ:</strong> {quoteDetails?.date}</p>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label>الخصم اليدوي</Form.Label>
                        <Form.Control
                            type="number"
                            value={manualDiscount}
                            onChange={(e) => setManualDiscount(parseFloat(e.target.value || 0))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>سبب الخصم</Form.Label>
                        <Form.Control
                            type="text"
                            value={discountReason}
                            onChange={(e) => setDiscountReason(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>تكلفة إضافية</Form.Label>
                        <Form.Control
                            type="number"
                            value={additionalCost}
                            onChange={(e) => setAdditionalCost(parseFloat(e.target.value || 0))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>سبب التكلفة الإضافية</Form.Label>
                        <Form.Control
                            type="text"
                            value={additionalCostReason}
                            onChange={(e) => setAdditionalCostReason(e.target.value)}
                        />
                    </Form.Group>

                    <h5 className="mt-4">الملخص النهائي</h5>
                    <ListGroup>
                        <ListGroup.Item>
                            الإجمالي الأساسي: {quoteDetails?.baseTotal.toFixed(2)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            الخصم: -{manualDiscount.toFixed(2)} ({discountReason})
                        </ListGroup.Item>
                        <ListGroup.Item>
                            تكلفة إضافية: +{additionalCost.toFixed(2)} ({additionalCostReason})
                        </ListGroup.Item>
                        <ListGroup.Item variant="success">
                            الإجمالي النهائي: {(quoteDetails?.baseTotal - manualDiscount + additionalCost).toFixed(2)}
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
                        إغلاق
                    </Button>
                    <Button variant="primary" onClick={handlePaymentConfirmation} disabled={isRequestInProgress}>
                        تأكيد الدفع
                    </Button>
                    {selectedQuote && (
                        <div ref={printableRef} style={{ display: 'none' }}>
                            <QuotePDF quote={selectedQuote} />
                        </div>
                    )}
                    <Button variant="primary" onClick={handlePrint}>
                        <FaPrint /> طباعة كـ PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ShopDetails;