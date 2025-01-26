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
      const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/users');
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users');
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
        await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/users/${editUserId}`, payload);
        setMessage('User updated successfully!');
      } else {
        // Add new user
        await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/users/register', payload);
        setMessage('User added successfully!');
      }
      fetchUsers(); // Refresh the user list
      setFormData({ name: '', emailOrPhone: '', password: '', role: 'user' }); // Reset form
      setEditUserId(null); // Clear edit mode
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving user');
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
      await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/users/${id}`);
      setMessage('User deleted successfully!');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError('Error deleting user');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin Panel</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Add/Edit User Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email or Phone</Form.Label>
              <Form.Control
                type="text"
                name="emailOrPhone"
                placeholder="Enter email or phone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editUserId ? 'Update User' : 'Add User'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* User List */}
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">User List</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
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
  );
};

export default AdminPanel;