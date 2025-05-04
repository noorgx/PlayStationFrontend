import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Card, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '', // Use emailOrPhone instead of email
    password: '',
    role: 'user',
  });
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirect non-admin users
    }
    fetchUsers();
  }, [navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8888/.netlify/functions/server/users');
      setUsers(response.data);
    } catch (error) {
      setError('حدث خطأ أثناء جلب المستخدمين');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (add or update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...formData,
        emailOrPhone: formData.emailOrPhone, // Ensure emailOrPhone is sent
      };

      if (editUserId) {
        // Update user
        await axios.put(`http://localhost:8888/.netlify/functions/server/users/${editUserId}`, payload);
        setMessage('تم تحديث المستخدم بنجاح!');
      } else {
        // Add new user
        await axios.post('http://localhost:8888/.netlify/functions/server/users/register', payload);
        setMessage('تم إضافة المستخدم بنجاح!');
      }
      fetchUsers(); // Refresh the user list
      setFormData({ name: '', emailOrPhone: '', password: '', role: 'user' }); // Reset form
      setEditUserId(null); // Clear edit mode
    } catch (error) {
      setError(error.response?.data?.error || 'حدث خطأ أثناء حفظ المستخدم');
    }
  };

  // Handle edit button click
  const handleEdit = (user) => {
    setFormData({
      ...user,
      emailOrPhone: user.email, // Map email to emailOrPhone for editing
    });
    setEditUserId(user.id); // Set the user ID for update
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8888/.netlify/functions/server/users/${id}`);
      setMessage('تم حذف المستخدم بنجاح!');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError('حدث خطأ أثناء حذف المستخدم');
    }
  };

  return (
    <div dir="rtl">
    <Container className="mt-4">
      <h2 className="text-center mb-4">لوحة التحكم للمشرف</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Add/Edit User Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>الاسم</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="أدخل الاسم"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>البريد الإلكتروني أو الهاتف</Form.Label>
              <Form.Control
                type="text"
                name="emailOrPhone"
                placeholder="أدخل البريد الإلكتروني أو الهاتف"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الوظيفة</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">كاشير</option>
                <option value="admin">ادارة</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editUserId ? 'تحديث المستخدم' : 'إضافة مستخدم'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* User List */}
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">قائمة المستخدمين</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>الاسم</th>
                <th> رقم التلفون/الايميل</th>
                <th>الوظيفة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role=='admin'?'ادارة':'كاشير'}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
};

export default AdminPanel;
