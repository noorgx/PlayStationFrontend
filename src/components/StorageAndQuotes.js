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
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa'; // Icons from react-icons

const StorageAndQuotes = () => {
  const [storageItems, setStorageItems] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    item_name: '',
    quantity: 0,
    price: 0,
    createQuote: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  // Fetch all storage items and quotes
  const fetchStorageAndQuotes = async () => {
    try {
      const storageResponse = await axios.get(
        'https://playstationbackend.netlify.app/.netlify/functions/server/storage'
      );
      const quotesResponse = await axios.get(
        'https://playstationbackend.netlify.app/.netlify/functions/server/quotes'
      );
      setStorageItems(storageResponse.data);
      setQuotes(quotesResponse.data);
      setFilteredQuotes(quotesResponse.data); // Initialize filtered quotes
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
      const { item_name, quantity, price, createQuote } = currentItem;

      if (!item_name || !quantity || !price) {
        alert('اسم العنصر، الكمية، والسعر مطلوبة!');
        return;
      }

      if (editMode) {
        // Update storage item
        await axios.put(
          `https://playstationbackend.netlify.app/.netlify/functions/server/storage/${currentItem.id}`,
          {
            item_name,
            quantity,
            price,
          }
        );
      } else {
        // Add new storage item and optionally create a quote
        const response = await axios.post(
          'https://playstationbackend.netlify.app/.netlify/functions/server/storage',
          {
            item_name,
            quantity,
            price,
            createQuote,
          }
        );

        if (createQuote) {
          setQuotes((prevQuotes) => [
            ...prevQuotes,
            {
              id: response.data.quote_id,
              quote_details: `فاتورة لـ ${item_name}`,
              cost: -(quantity * price),
              date: new Date().toISOString().split('T')[0],
              storage_id: response.data.storage_id,
            },
          ]);
        }
      }

      setShowModal(false);
      fetchStorageAndQuotes(); // Refresh the list
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
      fetchStorageAndQuotes(); // Refresh the list
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
    filterQuotes(term, filterStartDate, filterEndDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle start date filter change
  const handleStartDateFilterChange = (e) => {
    const startDate = e.target.value;
    setFilterStartDate(startDate);
    filterQuotes(searchTerm, startDate, filterEndDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle end date filter change
  const handleEndDateFilterChange = (e) => {
    const endDate = e.target.value;
    setFilterEndDate(endDate);
    filterQuotes(searchTerm, filterStartDate, endDate, filterMonth, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    const month = e.target.value;
    setFilterMonth(month);
    filterQuotes(searchTerm, filterStartDate, filterEndDate, month, filterYear);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle year filter change
  const handleYearFilterChange = (e) => {
    const year = e.target.value;
    setFilterYear(year);
    filterQuotes(searchTerm, filterStartDate, filterEndDate, filterMonth, year);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Filter quotes based on search term, date interval, month, and year
  const filterQuotes = (term, startDate, endDate, month, year) => {
    let filtered = quotes;

    // Filter by search term (quote_details)
    if (term) {
      filtered = filtered.filter((quote) =>
        quote.quote_details.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Filter by date interval
    if (startDate && endDate) {
      filtered = filtered.filter((quote) => {
        const quoteDate = new Date(quote.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return quoteDate >= start && quoteDate <= end;
      });
    }

    // Filter by month
    if (month) {
      filtered = filtered.filter((quote) => {
        const quoteMonth = new Date(quote.date).getMonth() + 1; // Months are 0-indexed
        return quoteMonth === parseInt(month, 10);
      });
    }

    // Filter by year
    if (year) {
      filtered = filtered.filter((quote) => {
        const quoteYear = new Date(quote.date).getFullYear();
        return quoteYear === parseInt(year, 10);
      });
    }

    setFilteredQuotes(filtered);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuotes = filteredQuotes.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fetch data on component mount
  useEffect(() => {
    fetchStorageAndQuotes();
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
              <FaPlus className="me-2" /> إضافة عنصر للمخزون
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
          <Card.Header>عرض فواتير</Card.Header>
          <Card.Body>
            {/* Search and Filters */}
            <InputGroup className="mb-3">
              <InputGroup.Text>بحث:</InputGroup.Text>
              <FormControl
                type="text"
                placeholder="بحث عن فواتير..."
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
                  <th>التفاصيل</th>
                  <th>التكلفة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {currentQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.quote_details}</td>
                    <td>{quote.cost}</td>
                    <td>{quote.date}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <Pagination>
              {Array.from(
                { length: Math.ceil(filteredQuotes.length / itemsPerPage) },
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

export default StorageAndQuotes;
