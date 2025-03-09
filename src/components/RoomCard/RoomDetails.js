import React, { useState, useEffect, useRef } from 'react';
import { Card, ListGroup, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { FaUtensils, FaGamepad, FaClock, FaMoneyBillWave, FaTrash, FaSyncAlt, FaStopCircle, FaFileInvoiceDollar, FaTimesCircle, FaPrint } from 'react-icons/fa'; // Import icons
import axios from 'axios';
import AddFoodDrinkForm from './AddFoodDrinkForm';
import ChangeModeModal from './ChangeModeModal';
import QuotePDF from '../Quotes/QuotePDF';
import TimerModal from './TimerModalAdd';
const RoomDetails = ({ customer: initialCustomer, fetchCustomers, updateCustomer }) => {
    const [customer, setCustomer] = useState(initialCustomer);
    const [initialStartTime, setInitialStartTime] = useState(initialCustomer.start_time); // Track initial start time
    const [showCancelButton, setShowCancelButton] = useState(true); // Control button visibility
    const [showForm, setShowForm] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [sessionEndedTrigger, setSessionEndedTrigger] = useState({});
    const [isDisabled, setIsDisabled] = useState(false);
    // Add new state for discount and additional cost
    const [manualDiscount, setManualDiscount] = useState(0);
    const [discountReason, setDiscountReason] = useState('');
    const [additionalCost, setAdditionalCost] = useState(0);
    const [additionalCostReason, setAdditionalCostReason] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    // Ref for the PDF content
    const printableRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    // Function to handle printing
    const handlePrint = () => {
        const printSection = printableRef.current;
        const originalContent = document.body.innerHTML;

        // Wrap the content inside a div with ID "print-section" for visibility control
        document.body.innerHTML = `<div id="print-section">${printSection.innerHTML}</div>`;

        // Trigger print
        window.print();

        // Restore the original content after printing
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload the page to restore the app's state
    };

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
        return timeCost;
    };

    // Function to refresh the total cost
    const refreshTotalCost = async () => {
        if (loading) return; // Don't refresh if an update is in progress
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

            // Notify the parent component
            updateCustomer(updatedCustomer);
            // Update the local state
            setCustomer(updatedCustomer);
        } catch (error) {
            console.error('Error refreshing total cost:', error);
        }
    };

    // Handle adding a food/drink item
    const handleAddFoodDrink = async (item) => {
        setLoading(true); // Start loading
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
        } finally {
            setLoading(false); // End loading
        }
    };

    // Handle deleting a food/drink item
    const handleDeleteDrinkFood = async (index) => {
        setLoading(true); // Start loading
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
        } finally {
            setLoading(false); // End loading
        }
    };
    const handleTimerSubmit = async () => {
        try {
            // Get current end_time as a Date object
            const currentEndTime = new Date(customer.end_time);

            // Add the input hours and minutes to the current end_time
            const newEndTime = new Date(currentEndTime);
            newEndTime.setHours(currentEndTime.getHours() + hours);
            newEndTime.setMinutes(currentEndTime.getMinutes() + minutes);

            // Create an updated customer object
            const updatedCustomer = {
                ...customer,
                end_time: newEndTime.toISOString(), // Store the new end_time as ISO string to keep format consistent
            };

            // Send the updated customer data to the server via PUT request
            await axios.put(
                `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`,
                updatedCustomer
            );

            // If successful, update the local customer state with the new end_time
            setCustomer(updatedCustomer);
            updateCustomer(updatedCustomer);
            // Close the modal after successful submission
            setShowTimerModal(false);

            console.log('Customer time updated successfully');
        } catch (error) {
            console.error('Error updating customer time:', error);
            // You could also add error handling logic here, such as showing a message to the user
        }
    };
    // Handle changing the mode and price per hour
    const handleChangeMode = async (oldMode, newMode, oldPricePerHour, newPricePerHour, newMachine, newRoom) => {
        setLoading(true); // Start loading
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

            // Create a log entry for the mode, machine, and room change
            const logEntry = {
                old_mode: oldMode,
                new_mode: newMode,
                old_price_per_hour: oldPricePerHour,
                new_price_per_hour: newPricePerHour,
                old_machine: updatedCustomer.current_machine.machine_name,
                new_machine: newMachine,
                old_room: updatedCustomer.current_machine.room,
                new_room: newRoom,
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

            // Update the mode, machine, room, and price_per_hour
            updatedCustomer.current_machine.multi_single = newMode;
            console.log(newMachine)
            updatedCustomer.current_machine.machine_name = newMachine;
            updatedCustomer.current_machine.room = newRoom;
            updatedCustomer.price_per_hour = parseFloat(newPricePerHour) - ((updatedCustomer.current_machine.discount / 100) * parseFloat(newPricePerHour));

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
        } finally {
            setLoading(false); // End loading
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
        const currentTime = new Date().getTime();

        if (initialCustomer.end_time <= currentTime) {
            return; // Exit the function early
        }

        // Calculate the total cost of foods and drinks
        const foodsDrinksCost = customer.drinks_foods.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);

        // Calculate the machine usage cost (total_cost - foods/drinks cost)
        const machineUsageCost = customer.total_cost - foodsDrinksCost;
        const baseTotal = customer.total_cost;
        // Format logs
        const logsDetails = customer.current_machine.logs.map((log, index) => ({
            log_number: index + 1,
            old_mode: log.old_mode,
            new_mode: log.new_mode,
            time_spent_hours: log.time_spent_hours,
            time_spent_minutes: log.time_spent_minutes,
            time_cost: log.time_cost.toFixed(2),
            old_start_time: new Date(log.old_start_time).toLocaleString('en-GB'),
            timestamp: new Date(log.timestamp).toLocaleString('en-GB'),
        }));

        // Format foods and drinks
        const foodDrinksDetails = customer.drinks_foods.map((item, index) => ({
            item_number: index + 1,
            item_name: item.item_name,
            price: item.price,
            quantity: item.quantity,
            total_cost: (item.price * item.quantity).toFixed(2), // Total cost for this item
        }));

        // Combine all details into a structured quote object
        const quote = {
            user_name: JSON.parse(localStorage.getItem('user')).name,
            machine_name: customer.current_machine.machine_name,
            room: customer.current_machine.room,
            start_time: new Date(customer.start_time).toLocaleString('en-GB'),
            end_time: customer.end_time ? new Date(customer.end_time).toLocaleString('en-GB') : 'لم ينته بعد',
            total_cost: customer.total_cost.toFixed(2), // Total cost (foods/drinks + machine usage)
            foods_drinks_cost: foodsDrinksCost.toFixed(2), // Total cost for foods/drinks
            machine_usage_cost: machineUsageCost.toFixed(2), // Total cost for machine usage
            logs: logsDetails,
            food_drinks: foodDrinksDetails,
            date: new Date().toLocaleString('en-GB'),
            baseTotal: baseTotal,
            manualDiscount: 0,
            discountReason: '',
            additionalCost: 0,
            additionalCostReason: '',
            finalTotal: baseTotal,
        };

        // Set the quote details
        setQuoteDetails(quote);
        setShowQuoteModal(true);
        setSelectedQuote(quote);
    };

    // Modified payment confirmation handler
    const handlePaymentConfirmation = async () => {
        const finalTotal = quoteDetails.baseTotal - manualDiscount + additionalCost;

        const quoteToSend = {
            ...quoteDetails,
            manualDiscount: manualDiscount,
            discountReason: discountReason,
            additionalCost: additionalCost,
            additionalCostReason: additionalCostReason,
            total_cost: finalTotal.toFixed(2),
        };

        try {
            const quoteResponse = await axios.post(
                'https://playstationbackend.netlify.app/.netlify/functions/server/quotes',
                quoteToSend
            );

            if (quoteResponse.status === 201) {
                await axios.delete(
                    `https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customer.id}`
                );
                setShowQuoteModal(false);
                fetchCustomers();
                window.location.reload();
            }
        } catch (error) {
            console.error('خطأ في تأكيد الدفع:', error);
        }
    };

    // Handle ending a customer's session
    const handleEndSession = async () => {
        setLoading(true); // Start loading
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
            setIsDisabled(true);
        } catch (error) {
            console.error('Error ending session:', error);
        } finally {
            setLoading(false); // End loading
        }
    };
    // Update initialStartTime when initialCustomer changes
    useEffect(() => {
        setCustomer(initialCustomer);
        setInitialStartTime(initialCustomer.start_time);
    }, [initialCustomer]);

    // Check if 10 minutes have passed since the session started
    useEffect(() => {
        const checkTime = () => {
            const startTime = new Date(initialStartTime).getTime();
            const currentTime = new Date().getTime();
            const difference = currentTime - startTime;
            const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

            setShowCancelButton(difference <= tenMinutes);
        };

        checkTime(); // Initial check
        const intervalId = setInterval(checkTime, 1000 * 60); // Check every minute

        return () => clearInterval(intervalId); // Cleanup
    }, [initialStartTime]);
    // Use useEffect to set up a timer for refreshing the total cost every minute
    useEffect(() => {
        const currentTime = new Date().getTime();
        if (initialCustomer.end_time) {
            const end_time = new Date(initialCustomer.end_time).getTime();

            if (!loading && end_time >= currentTime) { // Only refresh if not loading
                const intervalId = setInterval(() => {
                    refreshTotalCost();
                }, 5000);

                return () => clearInterval(intervalId);
            }
        }
        else {
            if (!loading) { // Only refresh if not loading
                const intervalId = setInterval(() => {
                    refreshTotalCost();
                }, 5000);

                return () => clearInterval(intervalId);
            }
        }
    }, [customer, loading]); // Re-run effect if customer or loading changes

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
                            <strong>وقت البداية:</strong> {new Date(customer.start_time).toLocaleString('en-GB')}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>وقت النهاية:</strong> {customer.end_time ? new Date(customer.end_time).toLocaleString('en-GB') : 'لم ينته بعد'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>إجمالي التكلفة:</strong> {customer.total_cost.toFixed(2)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>السعر لكل ساعة:</strong> {customer.price_per_hour}
                        </ListGroup.Item>
                        {/* <ListGroup.Item>
                            <strong>المدة:</strong> {customer.duration_hours} ساعات {customer.duration_minutes} دقائق
                        </ListGroup.Item> */}
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
                                        const oldStartTime = new Date(log.old_start_time).toLocaleString('en-GB');

                                        // تنسيق تكلفة الوقت المنقضي
                                        const timeCost = `${log.time_cost.toFixed(2)}`;

                                        return (
                                            <li key={index}>
                                                <strong>السجل {index + 1}:</strong> تم تغيير الوضع من "{log.old_mode}" إلى "{log.new_mode}" <br />(الوقت المنقضي: {timeSpent}, التكلفة: {timeCost}) <br /> من {oldStartTime} إلى {new Date(log.timestamp).toLocaleString('en-GB')}
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
                            <Button onClick={() => setShowTimerModal(true)}>
                                تعديل الوقت
                            </Button>

                            <TimerModal
                                show={showTimerModal}
                                onHide={() => setShowTimerModal(false)}
                                handleTimerSubmit={handleTimerSubmit}
                                hours={hours}
                                setHours={setHours}
                                minutes={minutes}
                                setMinutes={setMinutes}
                            />
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                <FaUtensils className="me-2" /> إضافة طعام/شراب
                            </Button>
                            <Button variant="secondary" onClick={() => setShowModeModal(true)}>
                                <FaGamepad className="me-2" /> تغيير الوضع
                            </Button>
                            <Button variant="info" onClick={refreshTotalCost} disabled={isDisabled}>
                                <FaSyncAlt className="me-2" /> تحديث التكلفة
                            </Button>
                            <Button variant="warning" onClick={handleEndSession}>
                                <FaStopCircle className="me-2" /> إنهاء الجلسة
                            </Button>
                            <Button variant="success" onClick={handleGenerateQuote}>
                                <FaFileInvoiceDollar className="me-2" /> انشاء الفاتورة
                            </Button>
                            {showCancelButton && (
                                <Button variant="danger" onClick={handleCancelSession}>
                                    <FaTimesCircle className="me-2" /> إلغاء الجلسة
                                </Button>
                            )}
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
                currentMachine={customer.current_machine.machine_name}
                currentRoom={customer.current_machine.room}
                currentMode={customer.current_machine.multi_single}
                pricePerHourSingle={customer.current_machine.price_per_hour_single}
                pricePerHourMulti={customer.current_machine.price_per_hour_multi}
                handleChangeMode={handleChangeMode}
            />

            {/* نموذج عرض الأسعار والدفع */}
            <div dir="rtl">
                <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>تفاصيل الفاتورة</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div dir="rtl">
                            <p><strong>اسم الجهاز:</strong> {quoteDetails?.machine_name}</p>
                            <p><strong>الغرفة:</strong> {quoteDetails?.room}</p>
                            <p><strong>وقت البداية:</strong> {quoteDetails?.start_time}</p>
                            <p><strong>وقت النهاية:</strong> {quoteDetails?.end_time}</p>
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
                        <Button variant="primary" onClick={handlePaymentConfirmation}>
                            تأكيد الدفع
                        </Button>
                        {selectedQuote ? (
                            <div ref={printableRef} style={{ display: 'none' }}>
                                <QuotePDF quote={selectedQuote} />
                            </div>
                        ) : (
                            <p>لا توجد تفاصيل للعرض</p>
                        )}
                        <Button variant="primary" onClick={handlePrint}>
                            <FaPrint /> طباعة كـ PDF
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>


    );
};

export default RoomDetails;