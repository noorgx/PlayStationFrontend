import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlusCircle, FaImage } from 'react-icons/fa';
import axios from 'axios';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMachine, setCurrentMachine] = useState({
    id: '',
    machine_type: '',
    machine_name: '',
    price_per_hour_single: '',
    price_per_hour_multi: '',
    is_available: true,
    room: '',
    image_link: '', // Added image_link directly
  });

  const [imagePreview, setImagePreview] = useState(''); // State to hold image preview URL

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role;

  const fetchMachines = async () => {
    try {
      const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('حدث خطأ أثناء جلب الآلات:', error);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentMachine({
      ...currentMachine,
      [name]: type === 'checkbox' ? checked : value,
    });

    // If the image link is changed, update the image preview
    if (name === 'image_link') {
      setImagePreview(value); // Update image preview state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const machineData = { ...currentMachine };

      let machineResponse;
      if (editMode) {
        machineResponse = await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/machines/${currentMachine.id}`, machineData);
      } else {
        machineResponse = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/machines', machineData);
      }

      console.log(machineResponse);
      fetchMachines();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ الجهاز:', error);
    }
  };

  const handleEdit = (machine) => {
    setCurrentMachine(machine);
    setEditMode(true);
    setImagePreview(machine.image_link); // Set image preview from existing data
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/machines/${id}`);
      fetchMachines();
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الجهاز:', error);
    }
  };

  const resetForm = () => {
    setCurrentMachine({
      id: '',
      machine_type: '',
      machine_name: '',
      price_per_hour_single: '',
      price_per_hour_multi: '',
      is_available: true,
      room: '',
      image_link: '', // Reset image link as well
    });
    setImagePreview(''); // Reset image preview
    setEditMode(false);
    setShowModal(false);
  };

  return (
    <div dir="rtl">
    <Container className="mt-4">
      <div dir="rtl">
        <h2 className="mb-4">الأجهزة و الترابيزات</h2>

        {userRole === 'admin' && (
          <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3 rounded-pill d-flex align-items-center">
            <FaPlusCircle className="me-2" />
            إضافة جهاز
          </Button>
        )}
      </div>

      <div dir="rtl">
        <Table striped bordered hover responsive className="mb-4">
          <thead>
            <tr>
              <th>النوع</th>
              <th>الاسم</th>
              <th>السعر (Single)</th>
              <th>السعر (Multi)</th>
              <th>متاح</th>
              <th>الغرفة</th>
              {userRole === 'admin' && <th>الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id}>
                <td>{machine.machine_type}</td>
                <td>{machine.machine_name}</td>
                <td>{machine.price_per_hour_single}</td>
                <td>{machine.price_per_hour_multi}</td>
                <td>{machine.is_available ? 'نعم' : 'لا'}</td>
                <td>{machine.room}</td>
                {userRole === 'admin' && (
                  <td>
                    <Button variant="warning" onClick={() => handleEdit(machine)} className="me-2 rounded-circle">
                      <FaEdit />
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(machine.id)} className="rounded-circle">
                      <FaTrashAlt />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div dir="rtl">
        <Modal show={showModal} onHide={resetForm} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? 'تعديل الجهاز' : 'إضافة الجهاز'}</Modal.Title>
          </Modal.Header>
          <div dir="rtl">
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="machineType" className="mb-3">
                    <Form.Label>نوع الجهاز</Form.Label>
                    <Form.Control
                      type="text"
                      name="machine_type"
                      value={currentMachine.machine_type}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="machineName" className="mb-3">
                    <Form.Label>اسم الجهاز</Form.Label>
                    <Form.Control
                      type="text"
                      name="machine_name"
                      value={currentMachine.machine_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="pricePerHourSingle" className="mb-3">
                    <Form.Label>السعر لكل ساعة (Single)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price_per_hour_single"
                      value={currentMachine.price_per_hour_single}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="pricePerHourMulti" className="mb-3">
                    <Form.Label>السعر لكل ساعة (Multi)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price_per_hour_multi"
                      value={currentMachine.price_per_hour_multi}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="room" className="mb-3">
                <Form.Label>الغرفة</Form.Label>
                <Form.Control
                  type="text"
                  name="room"
                  value={currentMachine.room}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              {/* حقل رابط الصورة */}
              <Form.Group controlId="imageLink" className="mb-3">
                <Form.Label>رابط الصورة</Form.Label>
                <Form.Control
                  type="text"
                  name="image_link"
                  value={currentMachine.image_link}
                  onChange={handleInputChange}
                  placeholder="الصق رابط الصورة هنا"
                />
              </Form.Group>

              {/* عرض معاينة الصورة */}
              {imagePreview && (
                <div className="mb-3">
                  <h5>معاينة الصورة:</h5>
                  <img src={imagePreview} alt="معاينة" style={{ width: '100%', height: 'auto', maxWidth: '300px' }} />
                </div>
              )}

              <Button variant="primary" type="submit" className="w-100">
                {editMode ? 'تحديث' : 'إضافة'}
              </Button>
            </Form>
          </Modal.Body>
          </div>
        </Modal>
      </div>
    </Container>
    </div>
  );
};

export default Machines;
