import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/users/login', formData);
      setMessage(response.data.message);
      onLogin(response.data); // Update user state in App.js
      if (response.data.role === 'admin') {
        navigate('/'); // Redirect admins to the admin panel
      } else {
        navigate('/'); // Redirect users to the home page
      }
    } catch (error) {
      setError('بيانات غير صحيحة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl">
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: '20px', margin: '15px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Card.Body>
          <h2 className="text-center mb-4">تسجيل الدخول</h2>
          {message && <Alert variant="success" className="mb-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><FaEnvelope /> البريد الإلكتروني أو <FaPhone /> تلفون</Form.Label>
              <Form.Control
                type="text"
                name="emailOrPhone"
                placeholder="أدخل بريدك الإلكتروني أو تلفون مسجل"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaLock /> كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
              style={{ borderRadius: '20px', padding: '10px' }}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
};

export default Login;
