import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, InputGroup, FormControl, Card, Pagination, Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaFileInvoiceDollar, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPayment, setCurrentPayment] = useState({
        name: '',
        type: '',
        details: '',
        date: '',
        cost: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Fetch all payments
    const fetchPayments = async () => {
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/payments');
            setPayments(response.data);
            setFilteredPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPayment({
            ...currentPayment,
            [name]: value,
        });
    };

    // Handle date filter input changes
    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilter({
            ...dateFilter,
            [name]: value,
        });
    };

    // Apply filters (search and date range)
    const applyFilters = () => {
        let filtered = [...payments];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply date range filter if at least start date is provided
        if (dateFilter.startDate) {
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.date);
                const startDate = new Date(dateFilter.startDate);
                const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date();

                // If only start date is provided, filter payments on that exact date
                if (!dateFilter.endDate) {
                    return paymentDate.toDateString() === startDate.toDateString();
                }
                
                // If both dates are provided, filter payments within the range
                return paymentDate >= startDate && paymentDate <= endDate;
            });
        }

        setFilteredPayments(filtered);
        setCurrentPage(1);
    };

    // Reset date filters
    const resetDateFilters = () => {
        setDateFilter({
            startDate: '',
            endDate: ''
        });
        setSearchTerm('');
        setFilteredPayments(payments);
        setCurrentPage(1);
    };

    // Handle form submission (add or update payment)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`http://localhost:8888/.netlify/functions/server/payments/${currentPayment.id}`, currentPayment);
            } else {
                await axios.post('http://localhost:8888/.netlify/functions/server/payments', currentPayment);
            }
            setShowModal(false);
            fetchPayments();
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    // Handle edit button click
    const handleEdit = (payment) => {
        setCurrentPayment(payment);
        setEditMode(true);
        setShowModal(true);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8888/.netlify/functions/server/payments/${id}`);
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    // Reset form and close modal
    const resetForm = () => {
        setCurrentPayment({
            name: '',
            type: '',
            details: '',
            date: '',
            cost: 0,
        });
        setEditMode(false);
        setShowModal(false);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Calculate total cost for filtered payments
    const totalCost = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.cost || 0), 0);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Apply filters whenever search term or date filters change
    useEffect(() => {
        applyFilters();
    }, [searchTerm, dateFilter.startDate, dateFilter.endDate]);

    // Fetch payments on component mount
    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div dir="rtl">
            <Container fluid className="my-4">
                <Row className="mb-3">
                    <Col>
                        <h2><FaFileInvoiceDollar className="me-2" /> المدفوعات</h2>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <FaPlus className="me-2" /> إضافة دفعة
                        </Button>
                    </Col>
                </Row>

                {/* Search and Filter Section */}
                <Row className="mb-3">
                    <Col md={6}>
                        <InputGroup>
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <FormControl
                                placeholder="بحث بالاسم..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6} className="text-end">
                        <Button 
                            variant={showDateFilter ? 'primary' : 'outline-primary'} 
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className="me-2"
                        >
                            <FaFilter className="me-2" /> فلترة حسب التاريخ
                        </Button>
                        <Button variant="outline-secondary" onClick={resetDateFilters}>
                            إعادة تعيين الفلتر
                        </Button>
                    </Col>
                </Row>

                {/* Date Filter Section */}
                {showDateFilter && (
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>من تاريخ</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={dateFilter.startDate}
                                    onChange={handleDateFilterChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>إلى تاريخ</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={dateFilter.endDate}
                                    onChange={handleDateFilterChange}
                                    min={dateFilter.startDate}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Button variant="primary" onClick={applyFilters}>
                                تطبيق الفلتر
                            </Button>
                        </Col>
                    </Row>
                )}

                {/* Payments Table */}
                <Row>
                    <Col md={12}>
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>الاسم</th>
                                        <th>النوع</th>
                                        <th>التفاصيل</th>
                                        <th>التكلفة ($)</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPayments.map((payment, index) => (
                                        <tr key={payment.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>{payment.name}</td>
                                            <td>{payment.type}</td>
                                            <td>{payment.details}</td>
                                            <td>{payment.cost}</td>
                                            <td>{payment.date}</td>
                                            <td>
                                                <Button variant="warning" size="sm" onClick={() => handleEdit(payment)} className="me-2">
                                                    <FaEdit /> تعديل
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(payment.id)}>
                                                    <FaTrash /> حذف
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" className="text-end"><strong>إجمالي التكلفة:</strong></td>
                                        <td><strong>{totalCost.toFixed(2)}</strong></td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>
                    </Col>
                </Row>

                {/* Pagination */}
                <Row>
                    <Col md={12} className="d-flex justify-content-center">
                        <Pagination>
                            {Array.from({ length: Math.ceil(filteredPayments.length / itemsPerPage) }, (_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => paginate(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </Col>
                </Row>

                {/* Add/Edit Payment Modal */}
                <Modal show={showModal} onHide={resetForm} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'تعديل الدفعة' : 'إضافة دفعة'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="name" className="mb-3">
                                <Form.Label>الاسم</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={currentPayment.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="type" className="mb-3">
                                <Form.Label>النوع</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={currentPayment.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">اختر النوع</option>
                                    <option value="daily">يومي</option>
                                    <option value="monthly">شهري</option>
                                    <option value="yearly">سنوي</option>
                                    <option value="one-time">مرة واحدة</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="details" className="mb-3">
                                <Form.Label>التفاصيل</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="details"
                                    value={currentPayment.details}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="cost" className="mb-3">
                                <Form.Label>التكلفة ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="cost"
                                    value={currentPayment.cost}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="date" className="mb-3">
                                <Form.Label>التاريخ</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={currentPayment.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                {editMode ? 'تحديث' : 'إضافة'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default Payments;