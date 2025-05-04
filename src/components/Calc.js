import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { FaPlaystation, FaClock, FaMoneyBillWave } from 'react-icons/fa'; // Import icons

const Calc = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [priceType, setPriceType] = useState("single"); // "single" or "multi"
  const [cost, setCost] = useState(0);

  // Fetch machines when the component mounts
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get('http://localhost:8888/.netlify/functions/server/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  // When the user selects a machine, update the selectedMachine state
  const handleMachineChange = (e) => {
    const machineId = e.target.value;
    const machine = machines.find((m) => m.id === machineId);
    setSelectedMachine(machine);
    recalcCost(machine, hours, minutes, priceType);
  };

  // Update hours input
  const handleHoursChange = (e) => {
    const h = parseFloat(e.target.value) || 0;
    setHours(h);
    recalcCost(selectedMachine, h, minutes, priceType);
  };

  // Update minutes input
  const handleMinutesChange = (e) => {
    const m = parseFloat(e.target.value) || 0;
    setMinutes(m);
    recalcCost(selectedMachine, hours, m, priceType);
  };

  // Handle price type change (Single or Multi)
  const handlePriceTypeChange = (e) => {
    const selectedType = e.target.value;
    setPriceType(selectedType);
    recalcCost(selectedMachine, hours, minutes, selectedType);
  };

  // Calculate the cost based on the machine's hourly rate (single or multi) and the entered time
  const recalcCost = (machine, h, m, type) => {
    if (!machine) {
      setCost(0);
      return;
    }
    // Calculate total time in hours (hours + minutes/60)
    const totalHours = h + m / 60;
    // Choose the hourly rate based on the selected price type
    const hourlyPrice = parseFloat(
      type === "single" ? machine.price_per_hour_single : machine.price_per_hour_multi
    );
    const calculatedCost = hourlyPrice * totalHours;
    setCost(calculatedCost.toFixed(2)); // Round to two decimals
  };

  // Determine the hourly price to display (if a machine is selected)
  const displayHourlyPrice = selectedMachine 
    ? priceType === "single" 
      ? selectedMachine.price_per_hour_single 
      : selectedMachine.price_per_hour_multi 
    : 0;

  return (
    <div dir="rtl">
    <Container className="mt-4" dir="rtl">
      <h2 className="mb-4 text-center">
        <FaPlaystation className="me-2" /> الحاسبة 
      </h2>
      <Card className="shadow">
        <Card.Body>
          <Form>
            {/* Machine selection */}
            <Form.Group as={Row} className="mb-3" controlId="machineSelect">
              <Form.Label column sm="3">
                <FaPlaystation className="me-2" /> اختر الجهاز:
              </Form.Label>
              <Col sm="9">
                <Form.Control as="select" onChange={handleMachineChange} defaultValue="">
                  <option value="">-- اختر جهاز --</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.machine_name} غرفة {machine.room}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>

            {/* Price type selection */}
            <Form.Group as={Row} className="mb-3" controlId="priceTypeSelect">
              <Form.Label column sm="3">
                <FaMoneyBillWave className="me-2" /> نوع السعر:
              </Form.Label>
              <Col sm="9">
                <Form.Check
                  inline
                  label="Single"
                  name="priceType"
                  type="radio"
                  id="priceTypeSingle"
                  value="single"
                  checked={priceType === "single"}
                  onChange={handlePriceTypeChange}
                />
                <Form.Check
                  inline
                  label="Multi"
                  name="priceType"
                  type="radio"
                  id="priceTypeMulti"
                  value="multi"
                  checked={priceType === "multi"}
                  onChange={handlePriceTypeChange}
                />
              </Col>
            </Form.Group>

            {/* Time inputs for hours and minutes */}
            <Form.Group as={Row} className="mb-3" controlId="timeInput">
              <Form.Label column sm="3">
                <FaClock className="me-2" /> المدة:
              </Form.Label>
              <Col sm="4">
                <Form.Label>الساعات</Form.Label>
                <Form.Control 
                  type="number"
                  placeholder="أدخل عدد الساعات"
                  value={hours}
                  onChange={handleHoursChange}
                  min="0"
                />
              </Col>
              <Col sm="4">
                <Form.Label>الدقائق</Form.Label>
                <Form.Control 
                  type="number"
                  placeholder="أدخل عدد الدقائق"
                  value={minutes}
                  onChange={handleMinutesChange}
                  min="0"
                  max="59"
                />
              </Col>
            </Form.Group>

            {/* Display the calculated cost */}
            <Row className="mb-3">
              <Col className="text-center">
                <h3>
                  <FaMoneyBillWave className="me-2" /> التكلفة الإجمالية: {cost} ج.م
                </h3>
              </Col>
            </Row>

            {/* Display the hourly price in the middle */}
            {selectedMachine && (
              <Row className="mb-3">
                <Col className="text-center">
                  <h4>
                    سعر لكل ساعة ({priceType === "single" ? "Single" : "Multi"}): {displayHourlyPrice} ج.م
                  </h4>
                </Col>
              </Row>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
};

export default Calc;