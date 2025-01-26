// src/components/Logout.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';

const Logout = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the onLogout function (e.g., clear user session, JWT token, etc.)
        await onLogout();
        
        // After logout logic completes, redirect to the home page
        navigate('/'); // Or you can redirect to a login page
      } catch (err) {
        setError('An error occurred while logging out. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleLogout();
  }, [onLogout, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return null; // If no loading or error, render nothing
};

export default Logout;
