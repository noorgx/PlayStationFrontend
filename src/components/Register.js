import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaUserTag } from 'react-icons/fa'; // Icons

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    role: 'user',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/users/register', formData);
      setMessage(response.data.message);
      setFormData({ name: '', emailOrPhone: '', password: '', role: 'user' });
      navigate('/login'); // Redirect to login after registration
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
    }
  };

  return (
    <div dir="rtl">
    <Container className="d-flex justify-content-center align-items-center my-4" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: '20px', margin: '20px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">التسجيل</h2>
          {message && <Alert variant="success" className="mb-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            
            {/* Name Input */}
            <Form.Group className="mb-3">
              <Form.Label>الاسم</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaUser /></InputGroup.Text>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="أدخل اسمك"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            {/* Email or Phone Input */}
            <Form.Group className="mb-3">
              <Form.Label>البريد الإلكتروني أو رقم تلفون</Form.Label>
              <InputGroup>
                <InputGroup.Text>{formData.emailOrPhone.includes('@') ? <FaEnvelope /> : <FaPhoneAlt />}</InputGroup.Text>
                <Form.Control
                  type="text"
                  name="emailOrPhone"
                  placeholder="أدخل البريد الإلكتروني أو رقم تلفون"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            {/* Password Input */}
            <Form.Group className="mb-3">
              <Form.Label>كلمة المرور</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaLock /></InputGroup.Text>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100">
              تسجيل
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
};

export default Register;
