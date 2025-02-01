import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, InputGroup, FormControl, Card, Pagination, Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaFileInvoiceDollar } from 'react-icons/fa';
import axios from 'axios';

const Quotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentQuote, setCurrentQuote] = useState({
        quote_details: '',
        cost: 0,
        date: '',
    });
    const [selectedQuoteDetails, setSelectedQuoteDetails] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch all quotes
    const fetchQuotes = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/quotes');
            setQuotes(response.data);
            setFilteredQuotes(response.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };

    // Calculate total cost for filtered quotes
    const totalCost = filteredQuotes.reduce((sum, quote) => sum + parseFloat(quote.cost), 0);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuote({
            ...currentQuote,
            [name]: value,
        });
    };

    // Handle form submission (add or update quote)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/quotes/${currentQuote.id}`, currentQuote);
            } else {
                await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/quotes', currentQuote);
            }
            setShowModal(false);
            fetchQuotes();
        } catch (error) {
            console.error('Error saving quote:', error);
        }
    };

    // Handle edit button click
    const handleEdit = (quote) => {
        setCurrentQuote(quote);
        setEditMode(true);
        setShowModal(true);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/quotes/${id}`);
            fetchQuotes();
        } catch (error) {
            console.error('Error deleting quote:', error);
        }
    };

    // Reset form and close modal
    const resetForm = () => {
        setCurrentQuote({
            quote_details: '',
            cost: 0,
            date: '',
        });
        setEditMode(false);
        setShowModal(false);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        filterQuotes(term, filterStartDate, filterEndDate, filterMonth, filterYear);
        setCurrentPage(1);
    };

    // Handle start date filter change
    const handleStartDateFilterChange = (e) => {
        const startDate = e.target.value;
        setFilterStartDate(startDate);
        filterQuotes(searchTerm, startDate, filterEndDate, filterMonth, filterYear);
        setCurrentPage(1);
    };

    // Handle end date filter change
    const handleEndDateFilterChange = (e) => {
        const endDate = e.target.value;
        setFilterEndDate(endDate);
        filterQuotes(searchTerm, filterStartDate, endDate, filterMonth, filterYear);
        setCurrentPage(1);
    };

    // Handle month filter change
    const handleMonthFilterChange = (e) => {
        const month = e.target.value;
        setFilterMonth(month);
        filterQuotes(searchTerm, filterStartDate, filterEndDate, month, filterYear);
        setCurrentPage(1);
    };

    // Handle year filter change
    const handleYearFilterChange = (e) => {
        const year = e.target.value;
        setFilterYear(year);
        filterQuotes(searchTerm, filterStartDate, filterEndDate, filterMonth, year);
        setCurrentPage(1);
    };

    // Filter quotes based on search term, date interval, month, and year
    const filterQuotes = (term, startDate, endDate, month, year) => {
        let filtered = quotes;

        if (term) {
            filtered = filtered.filter((quote) =>
                quote.quote_details.toLowerCase().includes(term.toLowerCase())
            );
        }

        if (startDate && endDate) {
            filtered = filtered.filter((quote) => {
                const quoteDate = new Date(quote.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return quoteDate >= start && quoteDate <= end;
            });
        }

        if (month) {
            filtered = filtered.filter((quote) => {
                const quoteMonth = new Date(quote.date).getMonth() + 1;
                return quoteMonth === parseInt(month, 10);
            });
        }

        if (year) {
            filtered = filtered.filter((quote) => {
                const quoteYear = new Date(quote.date).getFullYear();
                return quoteYear === parseInt(year, 10);
            });
        }

        setFilteredQuotes(filtered);
    };

    // Handle "Show Details" button click
    const handleShowDetails = (quoteDetails) => {
        setSelectedQuoteDetails(quoteDetails);
        setShowDetailsModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuotes = filteredQuotes.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Fetch quotes on component mount
    useEffect(() => {
        fetchQuotes();
    }, []);

    return (
        <div dir="rtl">
            <Container fluid className="my-4">
                <Row className="mb-3">
                    <Col>
                        <h2><FaFileInvoiceDollar className="me-2" /> الفواتير</h2>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <FaPlus className="me-2" /> إضافة فاتورة
                        </Button>
                    </Col>
                </Row>

                {/* Search and Filter Inputs */}
                <Row className="mb-3">
                    <Col md={12}>
                        <InputGroup className="mb-3">
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <FormControl
                                placeholder="بحث حسب التفاصيل..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                            <FormControl
                                type="date"
                                placeholder="تاريخ البداية"
                                value={filterStartDate}
                                onChange={handleStartDateFilterChange}
                            />
                            <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                            <FormControl
                                type="date"
                                placeholder="تاريخ النهاية"
                                value={filterEndDate}
                                onChange={handleEndDateFilterChange}
                            />
                            <Form.Select
                                value={filterMonth}
                                onChange={handleMonthFilterChange}
                            >
                                <option value="">الشهر</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                value={filterYear}
                                onChange={handleYearFilterChange}
                            >
                                <option value="">السنة</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </Form.Select>
                        </InputGroup>
                    </Col>
                </Row>

                {/* Quotes Table */}
                <Row>
                    <Col md={12}>
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>تفاصيل الفاتورة</th>
                                        <th>التكلفة ($)</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentQuotes.map((quote, index) => (
                                        <tr key={quote.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>
                                                {quote.quote_details.length > 50
                                                    ? `${quote.quote_details.substring(0, 50)}...`
                                                    : quote.quote_details}
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleShowDetails(quote.quote_details)}
                                                >
                                                    عرض التفاصيل
                                                </Button>
                                            </td>
                                            <td>{quote.cost}</td>
                                            <td>{quote.date}</td>
                                            <td>
                                                <Button variant="warning" size="sm" onClick={() => handleEdit(quote)} className="me-2">
                                                    <FaEdit /> تعديل
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(quote.id)}>
                                                    <FaTrash /> حذف
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="text-end"><strong>إجمالي التكلفة:</strong></td>
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
                            {Array.from({ length: Math.ceil(filteredQuotes.length / itemsPerPage) }, (_, i) => (
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
                <div dir="rtl">
                    {/* Add/Edit Quote Modal */}
                    <Modal show={showModal} onHide={resetForm} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{editMode ? 'تعديل الفاتورة' : 'إضافة فاتورة'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="quoteDetails" className="mb-3">
                                    <Form.Label>تفاصيل الفاتورة</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="quote_details"
                                        value={currentQuote.quote_details}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="cost" className="mb-3">
                                    <Form.Label>التكلفة</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            name="cost"
                                            value={currentQuote.cost}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group controlId="date" className="mb-3">
                                    <Form.Label>التاريخ</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={currentQuote.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {editMode ? 'تحديث' : 'إضافة'}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
                <div dir="rtl">
                    {/* Show Details Modal */}
                    <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>تفاصيل الفاتورة</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Card>
                                <Card.Body>
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedQuoteDetails}</pre>
                                </Card.Body>
                            </Card>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                                إغلاق
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Container>
        </div>
    );
};

export default Quotes;
