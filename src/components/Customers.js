// src/components/Customers.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Row, Col, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import notificationSound from './notification.mp3'; // Add a sound file for notification
const audio = new Audio(notificationSound); // Ensure notificationSound is imported
const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDrinksModal, setShowDrinksModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editModefood, setEditModeFood] = useState(false);
    const [timers, setTimers] = useState({}); // Store timers for each customer
    const [foodDrinks, setFoodDrinks] = useState([]);
    const [userInteracted, setUserInteracted] = useState(true); // Track user interaction
    const [triggeredTimers, setTriggeredTimers] = useState({}); // Track triggered timers
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [sessionEndedTrigger, setSessionEndedTrigger] = useState({});
    const [quoteDetails, setQuoteDetails] = useState({
        quote_details: '',
        cost: 0,
        date: '',
    });
    const [currentCustomer, setCurrentCustomer] = useState({
        customer_name: '',
        end_time: '',
        total_cost: 0,
        drinks_foods: [],
        current_machine: {
            machine_name: '',
            price_per_hour_single: 0,
            price_per_hour_multi: 0,
            multi_single: 'single', // Add this field
            logs: []
        },
        duration_hours: 0,
        duration_minutes: 0,
        is_open_time: false,
        price_per_hour: 0,
    });
    const [currentDrinkFood, setCurrentDrinkFood] = useState({
        item_name: '',
        price: 0,
        quantity: 1,
    });
    // Add the handleGenerateQuote function
    const handleGenerateQuote = (customer) => {
        // Set the current customer to the one whose quote is being generated
        setCurrentCustomer(customer);

        // Check if the session ended trigger is true for this customer
        if (!sessionEndedTrigger[customer.id]) {
            alert('Please confirm that the session has ended.');
            return; // Exit the function early
        }

        // Format logs
        const logsDetails = customer.current_machine.logs
            .map((log, index) => (
                `Log ${index + 1}: Machine ${log.machine_name} (${log.machine_type}), ` +
                `Time Spent: ${(log.time_spent * 60).toFixed(2)} minutes, ` +
                `Price Type: ${log.price_type}, ` +
                `Timestamp: ${new Date(log.timestamp).toLocaleString()}`
            ))
            .join('\n');

        // Format foods and drinks
        const foodDrinksDetails = customer.drinks_foods
            .map((item, index) => (
                `Item ${index + 1}: ${item.item_name}, ` +
                `Price: $${item.price}, ` +
                `Quantity: ${item.quantity}`
            ))
            .join('\n');

        // Combine all details into quote_details
        const quote = {
            quote_details: (
                `Customer: ${customer.customer_name}\n` +
                `Machine: ${customer.current_machine.machine_name}\n\n` +
                `Logs:\n${logsDetails}\n\n` +
                `Foods/Drinks:\n${foodDrinksDetails}`
            ),
            cost: customer.total_cost,
            date: new Date().toLocaleDateString(),
        };

        setQuoteDetails(quote);
        setShowQuoteModal(true);
    };
    const handlePaymentConfirmation = async (quoteDetails, customerId) => {
        try {
            // Step 1: Create a new quote
            const quoteResponse = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/quotes', {
                quote_details: quoteDetails.quote_details,
                cost: quoteDetails.cost,
                date: quoteDetails.date,
            });

            // Check if the quote was created successfully
            if (quoteResponse.status === 201) {
                console.log('Quote created successfully:', quoteResponse.data);
                console.log(customerId)
                // Step 2: Delete the customer after payment confirmation
                const deleteResponse = await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customerId}`);

                if (deleteResponse.status === 200) {
                    console.log('Customer deleted successfully:', deleteResponse.data);
                    setShowQuoteModal(false); // Close the modal
                    fetchCustomers(); // Refresh the customer list
                    resetForm()
                } else {
                    console.error('Failed to delete customer:', deleteResponse.data);
                }
            } else {
                console.error('Failed to create quote:', quoteResponse.data);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
        }
    };
    // Fetch all customers
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Fetch all machines
    const fetchMachines = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/machines');
            setMachines(response.data);
            initializeTimers(response.data); // Initialize timers after fetching customers
        } catch (error) {
            console.error('Error fetching machines:', error);
        }
    };
    // Fetch all food/drinks
    const fetchFoodDrinks = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks');
            setFoodDrinks(response.data);
        } catch (error) {
            console.error('Error fetching food/drinks:', error);
        }
    };
    const initializeTimers = (customers) => {
        const newTimers = {};
        const currentTime = new Date().getTime(); // Get the current time once

        customers.forEach((customer) => {
            if (customer.end_time) {
                // If end_time exists, calculate remaining time
                const startTime = new Date(customer.start_time).getTime();
                const endTime = new Date(customer.end_time).getTime();
                const remainingTime = endTime - currentTime;

                if (remainingTime > 0) {
                    newTimers[customer.id] = remainingTime;
                } else {
                    newTimers[customer.id] = 0;

                }
            } else {
                // If no end_time, calculate elapsed time (increasing timer)
                const startTime = new Date(customer.start_time).getTime();
                const elapsedTime = currentTime - startTime;
                newTimers[customer.id] = elapsedTime;
            }
        });

        setTimers(newTimers);
    };

    // Play alert sound and focus on the page
    const playNotificationSound = () => {
        if (userInteracted) {
            audio.play().catch((error) => {
                console.error('Failed to play audio:', error);
            });

            // Focus on the page if it's in the background
            if (document.visibilityState === 'hidden') {
                window.focus(); // Bring the page to the foreground
            }

            // Display a browser notification
            if (Notification.permission === 'granted') {
                new Notification('Timer Ended', {
                    body: 'A customer session has ended.',
                    icon: '/path/to/icon.png', // Add an icon if needed
                });
            }
        }
    };
    const formatTime = (milliseconds) => {
        const absoluteMilliseconds = Math.abs(milliseconds); // Handle negative values
        const hours = Math.floor(absoluteMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((absoluteMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absoluteMilliseconds % (1000 * 60)) / 1000);

        if (milliseconds < 0) {
            return `-${hours}h ${minutes}m ${seconds}s`; // Negative time (remaining time)
        }
        return `${hours}h ${minutes}m ${seconds}s`; // Positive time (elapsed time)
    };
    // Handle ending a customer's session
    const handleEndSession = async (customerId) => {
        try {
            // Call the backend API to end the session
            await axios.post(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customerId}/end-time`);

            // Refresh the customer list to reflect the changes
            fetchCustomers();

            // Set the session ended trigger for this specific customer
            setSessionEndedTrigger((prev) => ({
                ...prev,
                [customerId]: true, // Set the trigger for this customer
            }));
        } catch (error) {
            console.error('Error ending session:', error);
        }
    };
    // Handle form input changes for customer
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "multi_single") {
            // Update the multi_single field inside current_machine
            setCurrentCustomer({
                ...currentCustomer,
                current_machine: {
                    ...currentCustomer.current_machine,
                    multi_single: value,
                },
                price_per_hour: value === 'single'
                    ? currentCustomer.current_machine.price_per_hour_single
                    : currentCustomer.current_machine.price_per_hour_multi,
            });
        } else {
            // Handle other fields
            setCurrentCustomer({
                ...currentCustomer,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    // Handle form input changes for drinks/foods
    const handleDrinkFoodChange = (e) => {
        const { name, value } = e.target;
        setCurrentDrinkFood({
            ...currentDrinkFood,
            [name]: value,
        });
    };

    // Handle form submission (add or update customer)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate end_time if the session is not open
            let endTime = null;

            if (!currentCustomer.is_open_time) {
                const startTime = new Date(currentCustomer.start_time || new Date());
                const durationHours = currentCustomer.duration_hours || 0;
                const durationMinutes = currentCustomer.duration_minutes || 0;
                endTime = new Date(
                    startTime.getTime() + durationHours * 60 * 60 * 1000 + durationMinutes * 60 * 1000
                ).toISOString();
            }

            // Prepare the customer data
            const customerData = {
                ...currentCustomer,
                end_time: endTime,
                current_machine: {
                    ...currentCustomer.current_machine,
                    multi_single: currentCustomer.current_machine.multi_single || 'single', // Ensure multi_single is included
                },
            };

            if (editMode) {
                // Update customer
                await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${currentCustomer.id}`, customerData);
            } else {
                // Add new customer
                await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/customers', customerData);
            }

            setShowModal(false);
            fetchCustomers(); // Refresh the list
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    // Handle add/edit drinks/foods
    const handleDrinkFoodSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedCustomer = { ...currentCustomer };

            if (editModefood) {
                // Update drinks/foods list
                const oldItem = updatedCustomer.drinks_foods[currentDrinkFood.index];
                const newItem = { ...currentDrinkFood };

                // Calculate the cost difference
                const oldCost = oldItem.price * oldItem.quantity;
                const newCost = newItem.price * newItem.quantity;
                const costDifference = newCost - oldCost;

                updatedCustomer.drinks_foods = updatedCustomer.drinks_foods.map((item, index) =>
                    index === currentDrinkFood.index ? newItem : item
                );

                // Update total_cost
                updatedCustomer.total_cost += costDifference;
            } else {
                // Add new drink/food item
                const newItem = { ...currentDrinkFood };
                const newCost = newItem.price * newItem.quantity;

                updatedCustomer.drinks_foods = [...updatedCustomer.drinks_foods, newItem];
                updatedCustomer.total_cost += newCost;
            }

            // Update the customer in the backend
            await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${updatedCustomer.id}`, updatedCustomer);

            // Reset the form and close the modal
            setCurrentDrinkFood({
                item_name: '',
                price: 0,
                quantity: 1,
            });
            setShowDrinksModal(false);
            fetchCustomers(); // Refresh the list
        } catch (error) {
            console.error('Error saving drink/food:', error);
        }
    };

    // Handle edit button click for customer
    const handleEdit = (customer) => {
        setCurrentCustomer(customer);
        setEditMode(true);
        setShowModal(true);
    };

    // Handle delete button click for customer
    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${id}`);
            fetchCustomers(); // Refresh the list

            // Remove the trigger for this customer
            setSessionEndedTrigger((prev) => {
                const newTrigger = { ...prev };
                delete newTrigger[id];
                return newTrigger;
            });
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    // Handle edit button click for drinks/foods
    const handleEditDrinkFood = (item, index) => {
        setCurrentDrinkFood({ ...item, index });
        setEditModeFood(true);
        setShowDrinksModal(true);
    };

    // Handle delete button click for drinks/foods
    const handleDeleteDrinkFood = async (customerId, index) => {
        try {
            const customer = customers.find((c) => c.id === customerId);
            const updatedDrinksFoods = customer.drinks_foods.filter((_, i) => i !== index);

            // Calculate the removed item's cost
            const removedItem = customer.drinks_foods[index];
            const removedCost = removedItem.price * removedItem.quantity;

            // Update the customer in the backend
            await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/customers/${customerId}`, {
                ...customer,
                drinks_foods: updatedDrinksFoods,
                total_cost: customer.total_cost - removedCost, // Update total_cost
            });

            fetchCustomers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting drink/food:', error);
        }
    };
    // Reset form and close modal
    const resetForm = () => {
        setCurrentCustomer({
            customer_name: '',
            end_time: '',
            total_cost: 0,
            drinks_foods: [],
            current_machine: {
                machine_name: '',
                price_per_hour_single: 0,
                price_per_hour_multi: 0,
                multi_single: 'single', // Initialize with 'single'
                logs: []
            },
            duration_hours: 0,
            duration_minutes: 0,
            is_open_time: false,
            price_per_hour: 0,
        });
        setCurrentDrinkFood({
            item_name: '',
            price: 0,
            quantity: 1,
        });
        setEditMode(false);
        setEditModeFood(false);
        setShowModal(false);
        setShowDrinksModal(false);
        setSessionEndedTrigger({}); // Reset all triggers
    };
    // Request notification permission
    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            const updatedTimers = { ...timers };
            const updatedTriggeredTimers = { ...triggeredTimers };
            const currentTime = new Date().getTime();

            customers.forEach((customer) => {
                if (customer.end_time) {
                    // Handle customers with end_time (decreasing timer)
                    const startTime = new Date(customer.start_time).getTime();
                    const endTime = new Date(customer.end_time).getTime();
                    const remainingTime = endTime - currentTime;

                    if (remainingTime > 0) {
                        updatedTimers[customer.id] = remainingTime;
                    } else {
                        updatedTimers[customer.id] = 0;

                        // Play alert sound only once
                        if (!updatedTriggeredTimers[customer.id]) {
                            playNotificationSound();
                            updatedTriggeredTimers[customer.id] = true; // Mark as triggered
                        }
                    }
                } else {
                    // Handle customers without end_time (increasing timer)
                    const startTime = new Date(customer.start_time).getTime();
                    const elapsedTime = currentTime - startTime;
                    updatedTimers[customer.id] = elapsedTime;
                }
            });

            setTimers(updatedTimers);
            setTriggeredTimers(updatedTriggeredTimers);
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [customers, timers, triggeredTimers]);


    useEffect(() => {
        fetchCustomers();
        fetchMachines();
        fetchFoodDrinks(); // Fetch food/drinks
    }, []);
    useEffect(() => {
        setTriggeredTimers({}); // Reset triggered timers when customers change
    }, [customers]);

    return (
        <div className="m-3"> {/* Add margin around the entire component */}
  <h2 className="mb-3">Customers</h2> {/* Add margin-bottom to the heading */}
  <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
    Add Customer
  </Button>

  {/* Customer Cards */}
  <Row className="mt-3">
    {customers.map((customer) => (
      <Col key={customer.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
        <Card className={timers[customer.id] <= 0 ? 'bg-danger text-white' : ''}>
          <Card.Body>
            <Card.Title className="mb-2">{customer.customer_name}</Card.Title> {/* Add margin-bottom to the title */}
            <Card.Text className="mb-3"> {/* Add margin-bottom to the text */}
              <strong>Start Time:</strong> {new Date(customer.start_time).toLocaleString()}<br />
              <strong>End Time:</strong> {customer.end_time ? new Date(customer.end_time).toLocaleString() : 'Open'}<br />
              <strong>Total Cost:</strong> ${customer.total_cost}<br />
              <strong>Price Per Hour:</strong> ${customer.price_per_hour}<br />
              <strong>Open Session:</strong> {!customer.end_time ? 'Yes' : 'No'}<br />
              <strong>Room Session:</strong> {customer.current_machine.room}<br />
              <strong>Machine Name:</strong> {customer.current_machine.machine_name}<br />
              <strong>Elapsed Time:</strong> {formatTime(timers[customer.id] || 0)}
            </Card.Text>
            <div className="d-flex flex-wrap gap-2 mb-3"> {/* Add margin-bottom to the button group */}
              <Button variant="warning" onClick={() => handleEdit(customer)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(customer.id)}>
                Delete
              </Button>
              <Button variant="secondary" onClick={() => handleEndSession(customer.id)}>
                End Session
              </Button>
              <Button
                variant="info"
                onClick={() => handleGenerateQuote(customer)}
                disabled={!customer.end_time || !sessionEndedTrigger[customer.id]}
              >
                Quote
              </Button>
            </div>
            <hr className="my-3" /> {/* Add margin-top and margin-bottom to the horizontal rule */}
            <h6 className="mb-2">Drinks/Foods:</h6> {/* Add margin-bottom to the heading */}
            <ListGroup className="mb-3"> {/* Add margin-bottom to the list group */}
              {customer.drinks_foods?.map((item, index) => (
                <ListGroup.Item key={index} className={timers[customer.id] <= 0 ? 'bg-danger text-white' : ''}>
                  {item.item_name} - ${item.price} x {item.quantity}
                  <Button
                    variant="link"
                    className={timers[customer.id] <= 0 ? 'text-white' : ''}
                    onClick={() => handleDeleteDrinkFood(customer.id, index)}
                  >
                    Delete
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Button
              variant="success"
              size="sm"
              className="mt-2 mb-3"
              onClick={() => {
                setCurrentCustomer(customer);
                setShowDrinksModal(true);
              }}
            >
              Add Drink/Food
            </Button>
            <hr className="my-3" /> {/* Add margin-top and margin-bottom to the horizontal rule */}
            <h6 className="mb-2">Logs:</h6> {/* Add margin-bottom to the heading */}
            <ListGroup>
              {customer.current_machine?.logs?.map((log, index) => (
                <ListGroup.Item key={index} className={timers[customer.id] <= 0 ? 'bg-danger text-white' : ''}>
                  <strong>Machine:</strong> {log.machine_name} ({log.machine_type})<br />
                  <strong>Time Spent:</strong> {(log.time_spent * 60).toFixed(2)} minutes<br />
                  <strong>Price Type:</strong> {log.price_type}<br />
                  <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>

  {/* Quote Modal */}
  <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Quote Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {quoteDetails && (
        <div>
          <h5 className="mb-3">Quote Details:</h5> {/* Add margin-bottom to the heading */}
          <pre style={{ whiteSpace: 'pre-wrap' }}>{quoteDetails.quote_details}</pre>
          <hr className="my-3" /> {/* Add margin-top and margin-bottom to the horizontal rule */}
          <h6 className="mb-3">Total Cost: ${quoteDetails.cost}</h6> {/* Add margin-bottom to the heading */}
          <hr className="my-3" /> {/* Add margin-top and margin-bottom to the horizontal rule */}
          <h6 className="mb-3">Date: {quoteDetails.date}</h6> {/* Add margin-bottom to the heading */}
        </div>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
        Close
      </Button>
      <Button
        variant="success"
        onClick={() => handlePaymentConfirmation(quoteDetails, currentCustomer.id)}
      >
        Paid
      </Button>
    </Modal.Footer>
  </Modal>

  {/* Add/Edit Customer Modal */}
  <Modal show={showModal} onHide={resetForm}>
    <Modal.Header closeButton>
      <Modal.Title>{editMode ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="customerName" className="mb-3">
          <Form.Label>Customer Name</Form.Label>
          <Form.Control
            type="text"
            name="customer_name"
            value={currentCustomer.customer_name}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="endTime" className="mb-3">
          <Form.Label>End Time (Duration)</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="number"
                placeholder="Hours"
                value={currentCustomer.duration_hours || 0}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    duration_hours: parseInt(e.target.value, 10),
                  })
                }
                min={0}
                disabled={currentCustomer.is_open_time}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Minutes"
                value={currentCustomer.duration_minutes || 0}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    duration_minutes: parseInt(e.target.value, 10),
                  })
                }
                min={0}
                max={59}
                disabled={currentCustomer.is_open_time}
              />
            </Col>
          </Row>
        </Form.Group>
        <Form.Group controlId="currentMachine" className="mb-3">
          <Form.Label>Current Machine</Form.Label>
          <Form.Select
            name="current_machine"
            value={currentCustomer.current_machine.machine_name || ''}
            onChange={(e) => {
              const selectedMachine = machines.find((m) => m.machine_name === e.target.value);
              if (selectedMachine) {
                setCurrentCustomer({
                  ...currentCustomer,
                  current_machine: selectedMachine,
                  price_per_hour: selectedMachine.price_per_hour_single,
                });
              } else {
                setCurrentCustomer({
                  ...currentCustomer,
                  current_machine: {},
                  price_per_hour: 0,
                });
              }
            }}
            required
          >
            <option value="">Select a machine</option>
            {machines.map((machine) => (
              <option key={machine.id} value={machine.machine_name}>
                {machine.machine_name} (
                ${machine.price_per_hour_single}/hr (single), ${machine.price_per_hour_multi}/hr (multi)
                )
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {currentCustomer.current_machine.machine_name && (
          <Form.Group controlId="pricingType" className="mb-3">
            <Form.Label>Pricing Type</Form.Label>
            <Form.Select
              name="multi_single"
              value={currentCustomer.current_machine.multi_single || 'single'}
              onChange={handleInputChange}
              required
            >
              <option value="single">Single: ${currentCustomer.current_machine.price_per_hour_single}/hr</option>
              <option value="multi">Multi: ${currentCustomer.current_machine.price_per_hour_multi}/hr</option>
            </Form.Select>
          </Form.Group>
        )}
        <Form.Group controlId="pricePerHour" className="mb-3">
          <Form.Label>Price Per Hour</Form.Label>
          <Form.Control
            type="number"
            name="price_per_hour"
            value={currentCustomer.price_per_hour}
            readOnly
            required
          />
        </Form.Group>
        <Form.Group controlId="isOpenTime" className="mb-3">
          <Form.Check
            type="checkbox"
            name="is_open_time"
            label="Open Session"
            checked={currentCustomer.is_open_time}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          {editMode ? 'Update' : 'Add'}
        </Button>
      </Form>
    </Modal.Body>
  </Modal>

  {/* Add/Edit Drinks/Foods Modal */}
  <Modal show={showDrinksModal} onHide={resetForm}>
    <Modal.Header closeButton>
      <Modal.Title>{editModefood ? 'Edit Drink/Food' : 'Add Drink/Food'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleDrinkFoodSubmit}>
        <Form.Group controlId="selectFoodDrink" className="mb-3">
          <Form.Label>Select Food/Drink</Form.Label>
          <Form.Select
            name="item_name"
            value={currentDrinkFood.item_name}
            onChange={(e) => {
              const selectedItem = foodDrinks.find((item) => item.item_name === e.target.value);
              if (selectedItem) {
                setCurrentDrinkFood({
                  ...currentDrinkFood,
                  item_name: selectedItem.item_name,
                  price: selectedItem.price,
                });
              }
            }}
            required
          >
            <option value="">Select a food/drink</option>
            {foodDrinks.map((item) => (
              <option key={item.id} value={item.item_name}>
                {item.item_name} - ${item.price}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="quantity" className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            name="quantity"
            value={currentDrinkFood.quantity}
            onChange={handleDrinkFoodChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          {editModefood ? 'Update' : 'Add'}
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
</div>
    );
};

export default Customers;