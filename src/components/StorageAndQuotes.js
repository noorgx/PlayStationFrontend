import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, InputGroup, FormControl, Card, Pagination, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

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
      const storageResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/storage');
      const quotesResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/quotes');
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
        alert('Item name, quantity, and price are required!');
        return;
      }

      if (editMode) {
        // Update storage item
        await axios.put(`https://playstationbackend.netlify.app/.netlify/functions/server/storage/${currentItem.id}`, {
          item_name,
          quantity,
          price,
        });
      } else {
        // Add new storage item and optionally create a quote
        const response = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/storage', {
          item_name,
          quantity,
          price,
          createQuote,
        });

        if (createQuote) {
          setQuotes((prevQuotes) => [
            ...prevQuotes,
            {
              id: response.data.quote_id,
              quote_details: `Quote for ${item_name}`,
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
      await axios.delete(`https://playstationbackend.netlify.app/.netlify/functions/server/storage/${id}`);
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
    <Container fluid className="my-4">
      <Row className="mb-3">
        <Col>
          <h2>Storage and Quotes</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add Item to Storage
          </Button>
        </Col>
      </Row>

      {/* Storage Items Table */}
      <Row className="mb-4">
        <Col>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {storageItems.map((item, index) => {
                  const totalCost = item.quantity * item.price;
                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${totalCost}</td>
                      <td>
                        <Button variant="warning" size="sm" onClick={() => handleEdit(item)} className="me-2">
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* Quotes Section */}
      <Row className="mb-4">
        <Col>
          <h3>Quotes</h3>
        </Col>
      </Row>

      {/* Search and Filter Inputs */}
      <Row className="mb-3">
        <Col md={12}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search by quote details..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <FormControl
              type="date"
              placeholder="Start Date"
              value={filterStartDate}
              onChange={handleStartDateFilterChange}
            />
            <FormControl
              type="date"
              placeholder="End Date"
              value={filterEndDate}
              onChange={handleEndDateFilterChange}
            />
            <Form.Select
              value={filterMonth}
              onChange={handleMonthFilterChange}
            >
              <option value="">Filter by Month</option>
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
              <option value="">Filter by Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Quotes Table */}
      <Row className="mb-4">
        <Col>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Quote Details</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Storage ID</th>
                </tr>
              </thead>
              <tbody>
                {currentQuotes.map((quote, index) => (
                  <tr key={quote.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{quote.quote_details}</td>
                    <td>${quote.cost}</td>
                    <td>{quote.date}</td>
                    <td>{quote.storage_id}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* Pagination */}
      <Row>
        <Col className="d-flex justify-content-center">
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

      {/* Add/Edit Storage Item Modal */}
      <Modal show={showModal} onHide={resetForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Storage Item' : 'Add Storage Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Item Name */}
            <Form.Group controlId="itemName" className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                name="item_name"
                value={currentItem.item_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Quantity */}
            <Form.Group controlId="quantity" className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Price */}
            <Form.Group controlId="price" className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={currentItem.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Create Quote Checkbox */}
            {!editMode && (
              <Form.Group controlId="createQuote" className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="createQuote"
                  label="Create Quote with Negative Cost"
                  checked={currentItem.createQuote}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100">
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StorageAndQuotes;