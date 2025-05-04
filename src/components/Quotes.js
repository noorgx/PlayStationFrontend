import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Table, InputGroup, FormControl, Card, Pagination, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaFileInvoiceDollar, FaPrint, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print'; // Import the library
import './QuotePDF.css';

const Quotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [quotesPerPage] = useState(15); // Number of quotes per page
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
    const [filterRoom, setFilterRoom] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [loading, setLoading] = useState(true); // Loading state
    const [sortColumn, setSortColumn] = useState(null); // Track the column to sort
    const [sortDirection, setSortDirection] = useState('asc'); // Track sorting direction
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

    // Function to handle sorting
    const handleSort = (column) => {
        let direction = 'asc';
        if (sortColumn === column && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortColumn(column);
        setSortDirection(direction);

        const sortedQuotes = [...filteredQuotes].sort((a, b) => {
            if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredQuotes(sortedQuotes);
    };

    // Function to render sorting icon
    const renderSortIcon = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
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



    const handleDateFilterChange = (e) => {
        const date = e.target.value;
        setFilterDate(date);
        filterQuotes(date); // Add the filterDate
    };

    // Fetch all quotes
    const fetchQuotes = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get('http://localhost:8888/.netlify/functions/server/quotes');
            setQuotes(response.data);
            console.log(response.data)
            setFilteredQuotes(response.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    // Calculate total cost for filtered quotes
    const totalCost = filteredQuotes.reduce((sum, quote) => sum + parseFloat(quote.cost), 0);
    // Calculate the index of the first and last quote on the current page
    const indexOfLastQuote = currentPage * quotesPerPage;
    const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
    const currentQuotes = filteredQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    // Render Pagination
    const renderPagination = () => {
        const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
        const maxVisiblePages = 10; // Maximum number of visible page buttons
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);

        // Calculate the start and end of the visible page range
        let startPage = Math.max(1, currentPage - halfVisiblePages);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust the start page if the end page exceeds the total pages
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Generate the visible page numbers
        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <Pagination>
                {/* Previous Button */}
                <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                />

                {/* First Page Button (if not in the visible range) */}
                {startPage > 1 && (
                    <>
                        <Pagination.Item
                            key={1}
                            active={1 === currentPage}
                            onClick={() => paginate(1)}
                        >
                            1
                        </Pagination.Item>
                        {startPage > 2 && <Pagination.Ellipsis />} {/* Show ellipsis if there's a gap */}
                    </>
                )}

                {/* Visible Page Buttons */}
                {pageNumbers.map(number => (
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => paginate(number)}
                    >
                        {number}
                    </Pagination.Item>
                ))}

                {/* Last Page Button (if not in the visible range) */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <Pagination.Ellipsis />} {/* Show ellipsis if there's a gap */}
                        <Pagination.Item
                            key={totalPages}
                            active={totalPages === currentPage}
                            onClick={() => paginate(totalPages)}
                        >
                            {totalPages}
                        </Pagination.Item>
                    </>
                )}

                {/* Next Button */}
                <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        );
    };
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
                await axios.put(`http://localhost:8888/.netlify/functions/server/quotes/${currentQuote.id}`, currentQuote);
            } else {
                await axios.post('http://localhost:8888/.netlify/functions/server/quotes', currentQuote);
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
            await axios.delete(`http://localhost:8888/.netlify/functions/server/quotes/${id}`);
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
    function formatAndFlipDateTime(dateTimeString) {
        // Split the date and time
        const [datePart, timePart] = dateTimeString.replace(/\//g, '-').split(' ');

        // Split the date part by '-'
        const [day, month, year] = datePart.split('-');

        // Re-arrange to YYYY-MM-DD format
        const flippedDatePart = `${year}-${month}-${day}`;

        // Combine the flipped date with the time part
        const flippedDateTimeString = `${flippedDatePart} ${timePart}`;

        // Parse the modified date string into a Date object
        const date = new Date(flippedDateTimeString);

        // Format the date and time using 'en-GB' locale (DD/MM/YYYY HH:MM:SS)
        const formattedDate = date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY

        // Return the formatted date and time
        return formattedDate;
    }
    function formatAndFlipDateTime_str(dateTimeString) {
        // Split the date and time
        const [datePart, timePart] = dateTimeString.replace(/\//g, '-').split(' ');

        // Split the date part by '-'
        const [day, month, year] = datePart.split('-');

        // Re-arrange to YYYY-MM-DD format
        const flippedDatePart = `${year}-${month}-${day}`;

        // Combine the flipped date with the time part
        const flippedDateTimeString = `${flippedDatePart} ${timePart}`;

        // Parse the modified date string into a Date object
        const date = new Date(flippedDateTimeString);

        // Format the date and time using 'en-GB' locale (DD/MM/YYYY HH:MM:SS)
        const formattedDate = date.toLocaleString('en-GB'); // Format as DD/MM/YYYY

        // Return the formatted date and time
        return formattedDate;
    }

    // Filter quotes based on search term, date interval, day, month, and year
    const filterQuotes = (selectedDate, selectedRoom) => {
        let filtered = quotes;

        if (selectedDate) {
            filtered = filtered.filter((quote) => {
                const quoteDate = formatAndFlipDateTime(quote.date);
                return quoteDate === new Date(selectedDate).toLocaleDateString('en-GB');
            });
        }

        if (selectedRoom) {
            filtered = filtered.filter((quote) => quote.room === selectedRoom);
        }

        setFilteredQuotes(filtered);
    };

    const getUniqueRooms = (quotes) => {
        const rooms = quotes.map(quote => quote.room); // Extract all rooms
        const uniqueRooms = [...new Set(rooms)]; // Remove duplicates
        return uniqueRooms.filter(room => room); // Filter out empty/null values
    };

    // Handle "Show Details" button click
    const handleShowDetails = (quote) => {
        setSelectedQuoteDetails(quote);
        setSelectedQuote(quote);  // This ensures the quote is available for printing
        setShowDetailsModal(true);
    };
    const handleRoomFilterChange = (e) => {
        const room = e.target.value;
        setFilterRoom(room);
        filterQuotes(filterDate, room); // Pass both date and room filters
    };
    // Fetch quotes on component mount
    useEffect(() => {
        fetchQuotes();
    }, []);

    return (
        <div dir="rtl">
            <Container fluid className="my-4" dir="rtl">
                {/* Loading Spinner */}
                {loading && (
                    <div className="text-center my-4">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">جاري التحميل...</span>
                        </Spinner>
                        <p>جاري تحميل البيانات...</p>
                    </div>
                )}
                {/* Modal Form */}
                <Modal show={showModal} onHide={resetForm} centered dir="rtl">
                    <Modal.Header closeButton >
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
                                <Form.Label>السجلات:</Form.Label>
                                <ul>
                                    {currentQuote.logs?.map((log, index) => (
                                        <li key={index}>
                                            <strong>السجل #{log.log_number}:</strong> {log.new_mode} (السابق: {log.old_mode})<br />
                                            <strong>وقت البدء السابق:</strong> {log.old_start_time}<br />
                                            <strong>التكلفة:</strong> {log.time_cost}<br />
                                            <strong>الوقت المستغرق:</strong> {log.time_spent_hours} ساعات و {log.time_spent_minutes} دقائق<br />
                                            <strong>الوقت:</strong> {log.timestamp}
                                        </li>
                                    ))}
                                </ul>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>الأطعمة/المشروبات :</Form.Label>
                                <ul>
                                    {currentQuote.food_drinks?.map((item, index) => (
                                        <li key={index}>
                                            <strong>المنتج:</strong> {item.item_name} <br />
                                            <strong>الكمية:</strong> {item.quantity} <br />
                                            <strong>السعر:</strong> {item.price} <br />
                                            <strong>التكلفة الإجمالية:</strong> {(item.price * item.quantity).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                {editMode ? 'تحديث' : 'إضافة'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                <Row className="mb-3">
                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Form.Group controlId="filterDate">
                            <Form.Label>فلترة حسب التاريخ</Form.Label>
                            <Form.Control
                                type="date"
                                value={filterDate}
                                onChange={handleDateFilterChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Form.Group controlId="filterRoom">
                            <Form.Label>فلترة حسب الغرفة</Form.Label>
                            <Form.Control
                                as="select"
                                value={filterRoom}
                                onChange={handleRoomFilterChange}
                            >
                                <option value="">كل الغرف</option>
                                <option value="متجر">متجر</option>
                                {getUniqueRooms(quotes).map((room, index) => (
                                    <option key={index} value={room}>{room}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>


                {/* Updated Table Structure */}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th onClick={() => handleSort('user_name')}>
                                المستخدم {renderSortIcon('user_name')}
                            </th>
                            <th onClick={() => handleSort('machine_name')}>
                                الجهاز {renderSortIcon('machine_name')}
                            </th>
                            <th onClick={() => handleSort('room')}>
                                الغرفة {renderSortIcon('room')}
                            </th>
                            <th onClick={() => handleSort('total_cost')}>
                                المجموع {renderSortIcon('total_cost')}
                            </th>
                            <th onClick={() => handleSort('date')}>
                                التاريخ {renderSortIcon('date')}
                            </th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentQuotes.map((quote, index) => (
                            <tr key={quote.id}>
                                <td>{index + 1}</td>
                                <td>{quote.user_name}</td>
                                <td>{quote.machine_name}</td>
                                <td>{quote.room}</td>
                                <td>{quote.total_cost}</td>
                                <td>{formatAndFlipDateTime_str(quote.date)}</td>
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
                {/* Pagination Controls */}
                <div className="d-flex justify-content-center">
                    {renderPagination()}
                </div>
            </Container>
        </div>
    );
};

export default Quotes;