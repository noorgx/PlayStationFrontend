import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaGamepad, FaDoorOpen, FaUtensils, FaCalculator, FaQuoteRight, FaWarehouse, FaUserShield, FaSignOutAlt, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const CustomNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/PlayStationFrontend/login');
  };

  return (
    <div dir="rtl">
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4"> {/* Add margin-bottom to the Navbar */}
      <Container>
        <Navbar.Brand as={Link} to="/PlayStationFrontend/" className="me-4">Playstation</Navbar.Brand> {/* Add margin-right to the brand */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/PlayStationFrontend/rooms" className="me-3 d-flex align-items-center">
                  <FaDoorOpen className="me-2" /> الغرف
                </Nav.Link> {/* Add margin-right to Nav.Link */}
                <Nav.Link as={Link} to="/PlayStationFrontend/machines" className="me-3 d-flex align-items-center">
                  <FaGamepad className="me-2" /> الأجهزة
                </Nav.Link> {/* Add margin-right to Nav.Link */}
                <Nav.Link as={Link} to="/PlayStationFrontend/food-drinks" className="me-3 d-flex align-items-center">
                  <FaUtensils className="me-2" /> المأكولات و المشروبات
                </Nav.Link> {/* Add margin-right to Nav.Link */}
                <Nav.Link as={Link} to="/PlayStationFrontend/calc" className="me-3 d-flex align-items-center">
                  <FaCalculator className="me-2" /> الحاسبة
                </Nav.Link> {/* Add margin-right to Nav.Link */}
                {user.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/PlayStationFrontend/quotes" className="me-3 d-flex align-items-center">
                      <FaQuoteRight className="me-2" /> الفواتير
                    </Nav.Link> {/* Add margin-right to Nav.Link */}
                    <Nav.Link as={Link} to="/PlayStationFrontend/storage" className="me-3 d-flex align-items-center">
                      <FaWarehouse className="me-2" /> المخزن
                    </Nav.Link> {/* Add margin-right to Nav.Link */}
                    <Nav.Link as={Link} to="/PlayStationFrontend/admin" className="me-3 d-flex align-items-center">
                      <FaUserShield className="me-2" /> لوحة التحكم
                    </Nav.Link> {/* Add margin-right to Nav.Link */}
                  </>
                )}
              </Nav>
              <Nav>
                <Nav.Link onClick={handleLogout} className="d-flex align-items-center">
                  <FaSignOutAlt className="me-2" /> تسجيل الخروج
                </Nav.Link>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/PlayStationFrontend/register" className="me-3 d-flex align-items-center">
                <FaUserPlus className="me-2" /> التسجيل
              </Nav.Link> {/* Add margin-right to Nav.Link */}
              <Nav.Link as={Link} to="/PlayStationFrontend/login" className="d-flex align-items-center">
                <FaSignInAlt className="me-2" /> تسجيل الدخول
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
};

export default CustomNavbar;
