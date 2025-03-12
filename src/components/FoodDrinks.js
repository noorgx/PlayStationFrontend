import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaImage, FaUtensils, FaGlassCheers, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import DateSelector from './DateSelector'; // Import the DateSelector component
import './FoodPDF.css'; // Make sure to import the custom CSS

const FoodDrinks = () => {
  const [foodDrinks, setFoodDrinks] = useState([]);
  const printableRef = useRef(); // Create a ref for the printable content

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

  // Print function to trigger printing
  const handlePrint = () => {
    const printSection = printableRef.current;
    const originalContent = document.body.innerHTML;

    // Create a simplified table with only item_name and quantity
    const printContent = `
      <div id="print-section">
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الكمية</th>
            </tr>
          </thead>
          <tbody>
            ${foodDrinks
        .map(
          (item) => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.quantity}</td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `;

    // Replace the body content with the printable content
    document.body.innerHTML = printContent;

    // Trigger print
    window.print();

    // Restore the original content after printing
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload the page to restore the app's state
  };

  return (
    <div dir="rtl">
      <Container className="mt-4">
        <h2 className="mb-4 text-center">
          <FaUtensils className="me-2" /> المطبخ <FaGlassCheers className="ms-2" />
        </h2>

        {/* Responsive Table for Display */}
        <Card className="shadow">
          {/* Button to Print PDF */}
          <div className="text-center mt-4">
            <Button variant="danger" onClick={handlePrint}>
              <FaFilePdf className="me-2" /> طباعة PDF
            </Button>
          </div>
          <Card.Body>

            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {foodDrinks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.item_type}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Hidden div for printable content */}
        <div style={{ display: 'none' }}>
          <div ref={printableRef}>
            <h2>قائمة الطعام والمشروبات</h2>
            <Table striped bordered responsive>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {foodDrinks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FoodDrinks;