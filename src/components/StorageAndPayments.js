import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Form,
  Table,
  InputGroup,
  FormControl,
  Card,
  Pagination,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
const StorageAndPayments = () => {
  const [storageItems, setStorageItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    item_name: '',
    quantity: 0,
    price: 0,
    createPayment: true,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch all storage items and quotes
  const fetchStorageAndPayments = async () => {
    try {
      const storageResponse = await axios.get(
        'https://playstationbackend.netlify.app/.netlify/functions/server/storage'
      );
      const paymentsResponse = await axios.get(
        'https://playstationbackend.netlify.app/.netlify/functions/server/payments'
      );
      setStorageItems(storageResponse.data);
      setPayments(paymentsResponse.data);
      setFilteredPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission (add or update storage item)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { item_name, quantity, price, createPayment } = currentItem;

      if (!item_name || !quantity || !price) {
        alert('اسم العنصر، الكمية، والسعر مطلوبة!');
        return;
      }

      if (editMode) {
        await axios.put(
          `https://playstationbackend.netlify.app/.netlify/functions/server/storage/${currentItem.id}`,
          { item_name, quantity, price }
        );
      } else {
        const response = await axios.post(
          'https://playstationbackend.netlify.app/.netlify/functions/server/storage',
          { item_name, quantity, price, createPayment }
        );

        if (createPayment) {
          const paymentData = {
            name: `شراء ${item_name}`,
            type: 'once',
            details: `شراء ${item_name}`,
            date: new Date().toISOString().split('T')[0],
            cost: (quantity * price)
          };

          const paymentResponse = await axios.post(
            'https://playstationbackend.netlify.app/.netlify/functions/server/payments',
            paymentData
          );

          setPayments(prev => [...prev, paymentResponse.data]);
        }
      }

      setShowModal(false);
      fetchStorageAndPayments();
    } catch (error) {
      console.error('Error saving storage item:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setCurrentItem({ ...item, createQuote: false });
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://playstationbackend.netlify.app/.netlify/functions/server/storage/${id}`
      );
      fetchStorageAndPayments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting storage item:', error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setCurrentItem({
      item_name: '',
      quantity: 0,
      price: 0,
      createQuote: false,
    });
    setEditMode(false);
    setShowModal(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterPayments(term, filterStartDate, filterEndDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle start date filter change
  const handleStartDateFilterChange = (e) => {
    const startDate = e.target.value;
    setFilterStartDate(startDate);
    filterPayments(searchTerm, startDate, filterEndDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle end date filter change
  const handleEndDateFilterChange = (e) => {
    const endDate = e.target.value;
    setFilterEndDate(endDate);
    filterPayments(searchTerm, filterStartDate, endDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    const month = e.target.value;
    setFilterMonth(month);
    filterPayments(searchTerm, filterStartDate, filterEndDate, month, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle year filter change
  const handleYearFilterChange = (e) => {
    const year = e.target.value;
    setFilterYear(year);
    filterPayments(searchTerm, filterStartDate, filterEndDate, filterMonth, year);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Filter quotes based on search term, date interval, month, and year
  const filterPayments = (term, startDate, endDate, month, year) => {
    let filtered = payments;

    if (term) {
      filtered = filtered.filter(payment =>
        payment.name.toLowerCase().includes(term.toLowerCase()) ||
        payment.details?.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return paymentDate >= start && paymentDate <= end;
      });
    }

    if (month) {
      filtered = filtered.filter(payment => {
        const paymentMonth = new Date(payment.date).getMonth() + 1;
        return paymentMonth === parseInt(month, 10);
      });
    }

    if (year) {
      filtered = filtered.filter(payment => {
        const paymentYear = new Date(payment.date).getFullYear();
        return paymentYear === parseInt(year, 10);
      });
    }

    setFilteredPayments(filtered);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fetch data on component mount
  useEffect(() => {
    fetchStorageAndPayments();
  }, []);

  return (
    <div dir="rtl">
      <Container fluid className="my-4" dir="rtl">
        <Row className="mb-3">
          <Col>
            <h2>المخزن وفواتير</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" /> إضافة عنصر للمخزن
            </Button>
          </Col>
        </Row>
        <div dir="rtl">
          {/* Modal for Add/Edit storage item */}
          <Modal show={showModal} onHide={resetForm}>
            <Modal.Header closeButton>
              <Modal.Title>{editMode ? 'تعديل العنصر' : 'إضافة عنصر'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div dir="rtl">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم العنصر</Form.Label>
                  <Form.Control
                    type="text"
                    name="item_name"
                    value={currentItem.item_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الكمية</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={currentItem.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={currentItem.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                {!editMode && (
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="إنشاء فاتورة"
                      name="createQuote"
                      checked={currentItem.createQuote}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                )}
                <Button variant="primary" type="submit">
                  {editMode ? 'تحديث' : 'إضافة'}
                </Button>
              </Form>
              </div>
            </Modal.Body>
          </Modal>
        </div>
        <div dir="rtl">
        {/* Storage Table */}
        <Card className="mb-4">
          <Card.Header> المخزن</Card.Header>
          <Card.Body>
            <Table responsive bordered>
              <thead>
                <tr>
                  <th>اسم العنصر</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {storageItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrashAlt />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        </div>
        <div dir="rtl">
        {/* Filter and Quotes Table */}
        <Card className="mb-4">
        <Card.Header>المدفوعات</Card.Header>
          <Card.Body>
            {/* Search and Filters */}
            <InputGroup className="mb-3">
              <InputGroup.Text>بحث:</InputGroup.Text>
              <FormControl
                placeholder="بحث بالاسم أو التفاصيل..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
            <Row className="mb-3">
              <Col>
                <Form.Control
                  type="date"
                  placeholder="تصفية بتاريخ البدء"
                  value={filterStartDate}
                  onChange={handleStartDateFilterChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="date"
                  placeholder="تصفية بتاريخ النهاية"
                  value={filterEndDate}
                  onChange={handleEndDateFilterChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="تصفية بالشهر"
                  value={filterMonth}
                  onChange={handleMonthFilterChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="تصفية بالسنة"
                  value={filterYear}
                  onChange={handleYearFilterChange}
                />
              </Col>
            </Row>

            {/* Quotes Table */}
            <Table responsive bordered>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>التفاصيل</th>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.name}</td>
                    <td>{payment.type}</td>
                    <td>{payment.details || '-'}</td>
                    <td>{payment.date}</td>
                    <td className={payment.cost < 0 ? 'text-danger' : 'text-success'}>
                      {payment.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <Pagination>
              {Array.from(
                { length: Math.ceil(filteredPayments.length / itemsPerPage) },
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
            </Pagination>
          </Card.Body>
        </Card>
        </div>
      </Container>
    </div>
  );
};

export default StorageAndPayments;
