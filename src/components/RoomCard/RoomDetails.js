import React, { useState ,useEffect} from 'react';
import { Card, ListGroup, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaUtensils, FaGamepad, FaClock, FaMoneyBillWave, FaTrash, FaSyncAlt, FaStopCircle, FaFileInvoiceDollar, FaTimesCircle } from 'react-icons/fa'; // Import icons
import axios from 'axios';
import AddFoodDrinkForm from './AddFoodDrinkForm';
import ChangeModeModal from './ChangeModeModal';

const RoomDetails = ({ customer: initialCustomer, fetchCustomers, updateCustomer }) => {
    const [customer, setCustomer] = useState(initialCustomer);
    const [showForm, setShowForm] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [sessionEndedTrigger, setSessionEndedTrigger] = useState({});

    // Helper function to calculate time difference and update total_cost
    const calculateTotalCost = (customer) => {
        const lastTimeCheck = new Date(customer.last_time_check || customer.start_time).getTime();
        const currentTime = new Date().getTime();
        const timeSpent = (currentTime - lastTimeCheck) / (1000 * 60 * 60); // Time in hours

        // Calculate cost based on time spent and price_per_hour
        const timeCost = timeSpent * parseFloat(customer.price_per_hour);

        // Calculate additional costs (e.g., food/drinks)
        const additionalCost = customer.drinks_foods?.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0) || 0;

        // Update total_cost
        return timeCost + additionalCost;
    };

    // Function to refresh the total cost
    const refreshTotalCost = async () => {
        try {
            const updatedCustomer = { ...customer };

            // Calculate the time-based cost for the current session
            const timeCost = calculateTotalCost(updatedCustomer);

            // Update total_cost by adding the time-based cost and additional costs
            updatedCustomer.total_cost += timeCost;

            // Update the last_time_check to the current time
            updatedCustomer.last_time_check = new Date().toISOString();

            // Update the customer on the server
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // Update the local state
            setCustomer(updatedCustomer);

            // Notify the parent component
            updateCustomer(updatedCustomer);
        } catch (error) {
            console.error('Error refreshing total cost:', error);
        }
    };

    // Handle adding a food/drink item
    const handleAddFoodDrink = async (item) => {
        try {
            const updatedCustomer = { ...customer };

            // Check if the item already exists
            const existingItemIndex = updatedCustomer.drinks_foods.findIndex(
                (drinkFood) => drinkFood.item_name === item.item_name
            );

            if (existingItemIndex !== -1) {
                // If the item exists, update its quantity
                const existingItem = updatedCustomer.drinks_foods[existingItemIndex];
                const newQuantity = existingItem.quantity + item.quantity;

                updatedCustomer.drinks_foods[existingItemIndex] = {
                    ...existingItem,
                    quantity: newQuantity,
                };
            } else {
                // If the item does not exist, add it
                updatedCustomer.drinks_foods = [...(updatedCustomer.drinks_foods || []), item];
            }

            // Calculate the cost of the added item(s)
            const addedCost = item.price * item.quantity;

            // Add the cost of the added item(s) to the total_cost
            updatedCustomer.total_cost += addedCost;

            // Update the last_time_check to the current time
            updatedCustomer.last_time_check = new Date().toISOString();

            // Update the customer on the server
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // Update the local state
            setCustomer(updatedCustomer);

            // Notify the parent component
            updateCustomer(updatedCustomer);

            // Close the form
            setShowForm(false);
        } catch (error) {
            console.error('Error adding/updating drink/food:', error);
        }
    };

    // Handle deleting a food/drink item
    const handleDeleteDrinkFood = async (index) => {
        try {
            const updatedCustomer = { ...customer };

            // Remove the item from the drinks_foods array
            const deletedItem = updatedCustomer.drinks_foods.splice(index, 1)[0];

            // Calculate the cost of the deleted item(s)
            const deletedCost = deletedItem.price * deletedItem.quantity;

            // Subtract the cost of the deleted item(s) from the total_cost
            updatedCustomer.total_cost -= deletedCost;

            // Ensure total_cost doesn't go below zero
            if (updatedCustomer.total_cost < 0) {
                updatedCustomer.total_cost = 0;
            }

            // Update the last_time_check to the current time
            updatedCustomer.last_time_check = new Date().toISOString();

            // Update the customer on the server
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // Update the local state
            setCustomer(updatedCustomer);

            // Notify the parent component
            updateCustomer(updatedCustomer);
        } catch (error) {
            console.error('Error deleting drink/food:', error);
        }
    };

    // Handle changing the mode and price per hour
    const handleChangeMode = async (oldMode, newMode, oldPricePerHour, newPricePerHour) => {
        try {
            const updatedCustomer = { ...customer };

            // Calculate the time spent since the last_time_check
            const lastTimeCheck = new Date(updatedCustomer.last_time_check || updatedCustomer.start_time).getTime();
            const currentTime = new Date().getTime();
            const timeSpentMilliseconds = currentTime - lastTimeCheck;

            // Convert time spent to hours and minutes
            const timeSpentHours = Math.floor(timeSpentMilliseconds / (1000 * 60 * 60));
            const timeSpentMinutes = Math.floor((timeSpentMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

            // Calculate the cost for the time spent in the old mode
            const timeCost = (timeSpentMilliseconds / (1000 * 60 * 60)) * parseFloat(oldPricePerHour);

            // Add the time cost to the total cost
            updatedCustomer.total_cost += timeCost;

            // Create a log entry for the mode change
            const logEntry = {
                old_mode: oldMode,
                new_mode: newMode,
                old_price_per_hour: oldPricePerHour,
                new_price_per_hour: newPricePerHour,
                old_start_time: updatedCustomer.start_time,
                time_spent_hours: timeSpentHours,
                time_spent_minutes: timeSpentMinutes,
                time_cost: timeCost, // Add the cost of the time spent
                timestamp: new Date().toISOString(),
            };

            // Initialize logs array if it doesn't exist
            updatedCustomer.current_machine.logs = updatedCustomer.current_machine.logs || [];
            updatedCustomer.current_machine.logs.push(logEntry);

            // Update the start time to the current time
            updatedCustomer.start_time = new Date().toISOString();

            // Update the last_time_check to the current time
            updatedCustomer.last_time_check = new Date().toISOString();

            // Update the mode and price_per_hour
            updatedCustomer.current_machine.multi_single = newMode;
            updatedCustomer.price_per_hour = parseFloat(newPricePerHour);

            // Update the customer on the server
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // Update the local state
            setCustomer(updatedCustomer);

            // Notify the parent component
            updateCustomer(updatedCustomer);
        } catch (error) {
            console.error('Error changing mode:', error);
        }
    };

    // Function to handle canceling the session
    const handleCancelSession = async () => {
        try {
            // Delete the customer
            const deleteResponse = await axios.delete(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customer.id}`
            );

            if (deleteResponse.status === 200) {
                console.log('Customer deleted successfully:', deleteResponse.data);
                window.location.reload(); // Refresh the page
            } else {
                console.error('Failed to delete customer:', deleteResponse.data);
            }
        } catch (error) {
            console.error('Error canceling session:', error);
        }
    };

    // Handle generating a quote
    const handleGenerateQuote = () => {
        // Check if the session ended trigger is true for this customer
        if (!sessionEndedTrigger[customer.id]) {
            alert('من فضلك تأكد من أن الجلسة انتهت');
            return; // Exit the function early
        }

        // Format logs
        const logsDetails = customer.current_machine.logs
            .map((log, index) => (
                `السجل ${index + 1}: تم تغيير الوضع من "${log.old_mode}" إلى "${log.new_mode}" (الوقت المنقضي: ${log.time_spent_hours} ساعة ${log.time_spent_minutes} دقيقة، التكلفة: $${log.time_cost.toFixed(2)}) من ${new Date(log.old_start_time).toLocaleString()} إلى ${new Date(log.timestamp).toLocaleString()}`
            ))
            .join('\n');

        // Format foods and drinks
        const foodDrinksDetails = customer.drinks_foods
            .map((item, index) => (
                `السلعة ${index + 1}: ${item.item_name}, السعر: ${item.price}, الكمية: ${item.quantity}`
            ))
            .join('\n');

        // Combine all details into quote_details
        const quote = {
            quote_details: (
                `العميل: ${customer.customer_name}\n` +
                `الجهاز: ${customer.current_machine.machine_name}\n\n` +
                `السجلات:\n${logsDetails}\n\n` +
                `المأكولات/المشروبات:\n${foodDrinksDetails}`
            ),
            cost: customer.total_cost,
            date: new Date().toLocaleDateString(),
        };

        setQuoteDetails(quote);
        setShowQuoteModal(true);
    };

    // Handle payment confirmation
    const handlePaymentConfirmation = async () => {
        try {
            // Step 1: Create a new quote
            const quoteResponse = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/quotes', {
                quote_details: quoteDetails.quote_details,
                cost: quoteDetails.cost,
                date: quoteDetails.date,
            });

            // Check if the quote was created successfully
            if (quoteResponse.status === 201) {
                console.log('تم إنشاء الاقتباس بنجاح:', quoteResponse.data);

                // Step 2: Delete the customer after payment confirmation
                const deleteResponse = await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customer.id}`);

                if (deleteResponse.status === 200) {
                    console.log('تم حذف العميل بنجاح:', deleteResponse.data);
                    setShowQuoteModal(false); // Close the modal
                    fetchCustomers(); // Refresh the customer list
                    window.location.reload();
                } else {
                    console.error('فشل حذف العميل:', deleteResponse.data);
                }
            } else {
                console.error('فشل إنشاء الاقتباس:', quoteResponse.data);
            }
        } catch (error) {
            console.error('خطأ في تأكيد الدفع:', error);
        }
    };

    // Handle ending a customer's session
    const handleEndSession = async () => {
        try {
            // Get the current time
            const currentTime = new Date().toISOString();

            // Calculate the time spent since the last_time_check or start_time
            const lastTimeCheck = new Date(customer.last_time_check || customer.start_time).getTime();
            const currentTimeMillis = new Date().getTime();
            const timeSpentMilliseconds = currentTimeMillis - lastTimeCheck;

            // Convert time spent to hours and minutes
            const timeSpentHours = Math.floor(timeSpentMilliseconds / (1000 * 60 * 60));
            const timeSpentMinutes = Math.floor((timeSpentMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

            // Calculate the cost for the time spent
            const timeCost = (timeSpentMilliseconds / (1000 * 60 * 60)) * parseFloat(customer.price_per_hour);

            // Create a log entry for the session end
            const logEntry = {
                old_mode: customer.current_machine.multi_single, // Current mode before session ends
                new_mode: 'تم إنهاء الجلسة', // Indicate that the session has ended
                old_price_per_hour: customer.price_per_hour, // Current price per hour
                new_price_per_hour: 0, // Price per hour after session ends (set to 0)
                old_start_time: customer.start_time, // Start time of the session
                time_spent_hours: timeSpentHours, // Time spent in hours
                time_spent_minutes: timeSpentMinutes, // Time spent in minutes
                time_cost: timeCost, // Cost of the time spent
                timestamp: currentTime, // Timestamp of the session end
            };

            // Create an updated customer object
            const updatedCustomer = {
                ...customer,
                end_time: currentTime, // Set the end_time to the current time
                total_cost: customer.total_cost + timeCost, // Update the total cost
                last_time_check: currentTime, // Update the last_time_check
                current_machine: {
                    ...customer.current_machine,
                    logs: [...(customer.current_machine.logs || []), logEntry], // Add the log entry
                },
            };

            // Update the customer on the server using a PUT request
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // Update the local state to reflect the changes
            setCustomer(updatedCustomer);

            // Notify the parent component
            updateCustomer(updatedCustomer);

            // Set the session ended trigger for this specific customer
            setSessionEndedTrigger((prev) => ({
                ...prev,
                [customer.id]: true, // Set the trigger for this customer
            }));

            // Refresh the customer list to reflect the changes
            fetchCustomers();
        } catch (error) {
            console.error('Error ending session:', error);
        }
    };
    // Use useEffect to set up a timer for refreshing the total cost every minute
    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshTotalCost();
        }, 5000); // 60000 milliseconds = 1 minute

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []); // Re-run effect if customer changes
    // Render the component
    if (!customer) {
        return <p>لا توجد بيانات للعميل.</p>;
    }

    return (
        <div dir="rtl">
            <Card className="mt-4">

                <Card.Header className="text-center bg-dark text-white">
                    <h4>تفاصيل الغرفة</h4>
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <strong>الغرفة:</strong> {customer.current_machine.room}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>اسم الجهاز:</strong> {customer.current_machine.machine_name}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>الوضع:</strong> {customer.current_machine.multi_single}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>وقت البداية:</strong> {new Date(customer.start_time).toLocaleString()}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>وقت النهاية:</strong> {customer.end_time ? new Date(customer.end_time).toLocaleString() : 'لم ينته بعد'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>إجمالي التكلفة:</strong> {customer.total_cost.toFixed(2)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>السعر لكل ساعة:</strong> {customer.price_per_hour}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>المدة:</strong> {customer.duration_hours} ساعات {customer.duration_minutes} دقائق
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>حالة الغرفة:</strong> {customer.is_open_time ? 'Open' : 'مؤقت'}
                        </ListGroup.Item>
                        {customer.drinks_foods && (
                            <ListGroup.Item>
                                <strong>المشروبات/المأكولات:</strong>
                                <ul>
                                    {customer.drinks_foods.map((item, index) => (
                                        <li key={index}>
                                            {item.item_name} - {item.price} (الكمية: {item.quantity})
                                            <Button
                                                variant="link"
                                                onClick={() => handleDeleteDrinkFood(index)}
                                            >
                                                <FaTrash className="text-danger" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </ListGroup.Item>
                        )}
                        {customer.current_machine.logs && customer.current_machine.logs.length > 0 && (
                            <ListGroup.Item>
                                <strong>السجلات:</strong>
                                <ul>
                                    {customer.current_machine.logs.map((log, index) => {
                                        // تنسيق الوقت المنقضي
                                        const timeSpent = `${log.time_spent_hours} ساعات ${log.time_spent_minutes} دقائق`;

                                        // تنسيق وقت البداية القديم
                                        const oldStartTime = new Date(log.old_start_time).toLocaleString();

                                        // تنسيق تكلفة الوقت المنقضي
                                        const timeCost = `${log.time_cost.toFixed(2)}`;

                                        return (
                                            <li key={index}>
                                                <strong>السجل {index + 1}:</strong> تم تغيير الوضع من "{log.old_mode}" إلى "{log.new_mode}" <br />(الوقت المنقضي: {timeSpent}, التكلفة: {timeCost}) <br /> من {oldStartTime} إلى {new Date(log.timestamp).toLocaleString()}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ListGroup.Item>
                        )}
                    </ListGroup>

                    {/* الأزرار في المنتصف */}
                    <Row className="mt-4 justify-content-center">
                        <Col xs={12} md={6} className="d-flex flex-wrap justify-content-center gap-2">
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                <FaUtensils className="me-2" /> إضافة طعام/شراب
                            </Button>
                            <Button variant="secondary" onClick={() => setShowModeModal(true)}>
                                <FaGamepad className="me-2" /> تغيير الوضع
                            </Button>
                            <Button variant="info" onClick={refreshTotalCost}>
                                <FaSyncAlt className="me-2" /> تحديث التكلفة
                            </Button>
                            <Button variant="warning" onClick={handleEndSession}>
                                <FaStopCircle className="me-2" /> إنهاء الجلسة
                            </Button>
                            <Button variant="success" onClick={handleGenerateQuote}>
                                <FaFileInvoiceDollar className="me-2" /> انشاء الفاتورة
                            </Button>
                            <Button variant="danger" onClick={handleCancelSession}>
                                <FaTimesCircle className="me-2" /> إلغاء الجلسة
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* نموذج إضافة طعام/شراب */}
            <AddFoodDrinkForm
                show={showForm}
                handleClose={() => setShowForm(false)}
                handleSubmit={handleAddFoodDrink}
            />

            {/* نموذج تغيير الوضع */}
            <ChangeModeModal
                show={showModeModal}
                handleClose={() => setShowModeModal(false)}
                currentMode={customer.current_machine.multi_single}
                pricePerHourSingle={customer.current_machine.price_per_hour_single}
                pricePerHourMulti={customer.current_machine.price_per_hour_multi}
                handleChangeMode={handleChangeMode}
            />

            {/* نموذج عرض الأسعار والدفع */}
            <div dir="rtl">
                <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>تفاصيل عرض الأسعار</Modal.Title>
                    </Modal.Header>
                    <div dir="rtl">
                        <Modal.Body>
                            <div dir="rtl">
                                <pre>{quoteDetails?.quote_details}</pre>
                            </div>
                            <p><strong>إجمالي التكلفة:</strong>{quoteDetails?.cost.toFixed(2)}</p>
                            <p><strong>التاريخ:</strong> {quoteDetails?.date}</p>
                        </Modal.Body>
                    </div>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
                            إغلاق
                        </Button>
                        <Button variant="primary" onClick={handlePaymentConfirmation}>
                            تأكيد الدفع
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>


    );
};

export default RoomDetails;