import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Table, InputGroup, FormControl, Card, Pagination, Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print'; // Import the library
import './QuotePDF.css';

const Quotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentQuote, setCurrentQuote] = useState({
        user_name: '',
        machine_name: '',
        room: '',
        start_time: '',
        end_time: '',
        total_cost: 0,
        foods_drinks_cost: 0,
        machine_usage_cost: 0,
        logs: [],
        food_drinks: [],
        date: ''
    });
    const [selectedQuoteDetails, setSelectedQuoteDetails] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    // Ref for the PDF content
    const printableRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    // Function to handle printing
    const handlePrint = () => {
        const printSection = printableRef.current;
        const originalContent = document.body.innerHTML;

        // Wrap the content inside a div with ID "print-section" for visibility control
        document.body.innerHTML = `<div id="print-section">${printSection.innerHTML}</div>`;

        // Trigger print
        window.print();

        // Restore the original content after printing
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload the page to restore the app's state
    };


    const QuotePDF = ({ quote }) => (
        <div dir="rtl" style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'right', marginBottom: '10px' }}>فاتورة الاستخدام</h1>
            <Row>
                <Col md={6}>
                    <p><strong>اسم المستخدم:</strong> {quote.user_name}</p>
                    <p><strong>اسم الجهاز:</strong> {quote.machine_name}</p>
                    <p><strong>الغرفة:</strong> {quote.room}</p>
                </Col>
                <Col md={6}>
                    <p><strong>تاريخ الفاتورة:</strong> {quote.date}</p>
                    <p><strong>وقت البدء:</strong> {quote.start_time}</p>
                    <p><strong>وقت الانتهاء:</strong> {quote.end_time}</p>
                </Col>
            </Row>
            <h5 style={{ marginTop: '10px' }}>تفاصيل التكاليف:</h5>
            <Row>
                <Col md={6}>
                    <p><strong>تكلفة الأكل/الشرب:</strong> {quote.foods_drinks_cost}</p>
                    <p><strong>تكلفة استخدام الجهاز:</strong> {quote.machine_usage_cost}</p>
                </Col>
                <Col md={6}>
                    <p><strong>التكلفة الإضافية:</strong> {quote.additionalCost}</p>
                    <p><strong>سبب التكلفة الإضافية:</strong> {quote.additionalCostReason}</p>
                </Col>
            </Row>
            <h5 style={{ marginTop: '10px' }}>المجموع:</h5>
            <Row>
                <Col md={6}>
                    <p><strong>المجموع الأساسي:</strong> {quote.baseTotal}</p>
                    <p><strong>الخصم اليدوي:</strong> {quote.manualDiscount}</p>
                </Col>
                <Col md={6}>
                    <p><strong>سبب الخصم:</strong> {quote.discountReason}</p>
                    <p><strong>المجموع النهائي:</strong> {quote.finalTotal}</p>
                </Col>
            </Row>
            <h5 style={{ marginTop: '10px' }}>السجلات:</h5>
            <ul>
                {quote.logs?.map((log, index) => (
                    <li key={index}>
                        <strong>السجل #{log.log_number}:</strong> {log.new_mode} (السابق: {log.old_mode})<br />
                        <strong>وقت البدء السابق:</strong> {log.old_start_time}<br />
                        <strong>التكلفة:</strong> {log.time_cost}<br />
                        <strong>الوقت المستغرق:</strong> {log.time_spent_hours} ساعات و {log.time_spent_minutes} دقائق<br />
                        <strong>الوقت:</strong> {log.timestamp}
                    </li>
                ))}
            </ul>
            <h5 style={{ marginTop: '10px' }}>الأطعمة/المشروبات:</h5>
            <ul>
                {quote.food_drinks?.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );




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

    // Update form inputs to match new structure
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuote(prev => ({
            ...prev,
            [name]: name === 'logs' || name === 'food_drinks'
                ? value.split(',')
                : value
        }));
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
    const handleShowDetails = (quote) => {
        setSelectedQuoteDetails(quote);
        setSelectedQuote(quote);  // This ensures the quote is available for printing
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
                {/* Modal Form */}
                <Modal show={showModal} onHide={resetForm} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'تعديل الفاتورة' : 'إضافة فاتورة'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>اسم المستخدم</Form.Label>
                                <Form.Control
                                    name="user_name"
                                    value={currentQuote.user_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>اسم الجهاز</Form.Label>
                                        <Form.Control
                                            name="machine_name"
                                            value={currentQuote.machine_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>الغرفة</Form.Label>
                                        <Form.Control
                                            name="room"
                                            value={currentQuote.room}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>وقت البدء</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="start_time"
                                            value={currentQuote.start_time}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>وقت الانتهاء</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="end_time"
                                            value={currentQuote.end_time}
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>تكلفة الأكل/الشرب</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                name="foods_drinks_cost"
                                                value={currentQuote.foods_drinks_cost}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>تكلفة الاستخدام</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                name="machine_usage_cost"
                                                value={currentQuote.machine_usage_cost}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>المجموع</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                name="total_cost"
                                                value={currentQuote.total_cost}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>السجلات (مفصولة بفواصل)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="logs"
                                    value={currentQuote.logs.join(',')}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>الأطعمة/المشروبات (مفصولة بفواصل)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="food_drinks"
                                    value={currentQuote.food_drinks.join(',')}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                {editMode ? 'تحديث' : 'إضافة'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Updated Table Structure */}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>المستخدم</th>
                            <th>الجهاز</th>
                            <th>الغرفة</th>
                            <th>المجموع</th>
                            <th>التاريخ</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentQuotes.map((quote, index) => (
                            <tr key={quote.id}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{quote.user_name}</td>
                                <td>{quote.machine_name}</td>
                                <td>{quote.room}</td>
                                <td>{quote.total_cost}</td>
                                <td>{new Date(quote.date).toLocaleDateString()}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(quote)} className="me-2">
                                        <FaEdit /> تعديل
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(quote.id)}>
                                        <FaTrash /> حذف
                                    </Button>
                                    <Button variant="info" size="sm" onClick={() => handleShowDetails(quote)} className="me-2">
                                        <FaFileInvoiceDollar /> التفاصيل
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Updated Details Modal */}
                <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>تفاصيل الفاتورة الكاملة</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card>
                            <Card.Body>
                                {selectedQuote ? (
                                    <div ref={printableRef}>
                                        <QuotePDF quote={selectedQuote} />
                                    </div>
                                ) : (
                                    <p>لا توجد تفاصيل للعرض</p>
                                )}
                                <Button variant="primary" onClick={handlePrint} className="mt-3">
                                    <FaPrint /> طباعة كـ PDF
                                </Button>
                            </Card.Body>
                        </Card>
                    </Modal.Body>
                </Modal>

            </Container>
        </div>
    );
};

export default Quotes;