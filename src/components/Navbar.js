// src/components/Navbar.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const CustomNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4"> {/* Add margin-bottom to the Navbar */}
      <Container>
        <Navbar.Brand as={Link} to="/" className="me-4">My App</Navbar.Brand> {/* Add margin-right to the brand */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/customers" className="me-3">Customers</Nav.Link> {/* Add margin-right to Nav.Link */}
                <Nav.Link as={Link} to="/machines" className="me-3">Machines</Nav.Link> {/* Add margin-right to Nav.Link */}
                <Nav.Link as={Link} to="/food-drinks" className="me-3">Food & Drinks</Nav.Link> {/* Add margin-right to Nav.Link */}
                {user.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/quotes" className="me-3">Quotes</Nav.Link> {/* Add margin-right to Nav.Link */}
                    <Nav.Link as={Link} to="/storage" className="me-3">Storage</Nav.Link> {/* Add margin-right to Nav.Link */}
                    <Nav.Link as={Link} to="/admin" className="me-3">Admin Panel</Nav.Link> {/* Add margin-right to Nav.Link */}
                  </>
                )}
              </Nav>
              <Nav>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/register" className="me-3">Register</Nav.Link> {/* Add margin-right to Nav.Link */}
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;