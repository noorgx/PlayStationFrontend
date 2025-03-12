import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaCalendarAlt, FaUtensils, FaMoneyBillWave, FaChartBar, FaList } from 'react-icons/fa';
import axios from 'axios';
import ReportTypeSelector from './ReportTypeSelector';
import DateSelector from './DateSelector';
import MachineSelector from './MachineSelector';
import HourSelector from './HourSelector';
import FinancialReport from './FinancialReport';
import MachineReport from './MachineReport';

const Reports = () => {
    const [quotes, setQuotes] = useState([]);
    const [payments, setPayments] = useState([]);
    const [foodDrinks, setFoodDrinks] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Set today as default date
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMachine, setSelectedMachine] = useState('');
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [showFinancial, setShowFinancial] = useState(true);
    const [showSalesSummary, setShowSalesSummary] = useState(false); // Add state for 'الكمية مباعة'
    const [loading, setLoading] = useState(true); // Loading state

    const fetchData = async () => {
        try {
            const quotesResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/quotes');
            const paymentsResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/payments');
            // console.log(quotesResponse.data)
            setQuotes(quotesResponse.data);
            setPayments(paymentsResponse.data);

            const uniqueMachines = [...new Set(quotesResponse.data.map(quote => quote.machine_name))];
            setMachines(uniqueMachines);

        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false); // Set loading to false even if there is an error
        }
    };

    const fetchFoodDrinks = async () => {
        try {
            const response = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/food-drinks');
            setFoodDrinks(response.data);
        } catch (error) {
            console.error('Error fetching food/drinks:', error);
        }
    };

    const handleReportTypeChange = (e) => {
        setReportType(e.target.value);
        setSelectedDate(new Date().toISOString().split('T')[0]); // Reset selectedDate to today
        setSelectedMonth('');
        setSelectedYear('');
        setSelectedMachine('');
        setStartHour('');
        setEndHour('');
    };

    const calculateYearlyExpenses = (filteredPayments) => {
        return filteredPayments.reduce((sum, p) => {
            const paymentDate = new Date(p.date).toLocaleDateString('en-GB');
            const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();

            if (p.type === 'one-time' && new Date(p.date).getFullYear() === year) {
                return sum + parseFloat(p.cost || 0);
            }

            if (p.type === 'daily') {
                const daysInYear = (year % 4 === 0) ? 366 : 365;
                return sum + (parseFloat(p.cost || 0) * daysInYear);
            }

            if (p.type === 'monthly') {
                return sum + (parseFloat(p.cost || 0) * 12);
            }

            if (p.type === 'yearly') {
                return sum + parseFloat(p.cost || 0);
            }

            return sum;
        }, 0);
    };
    function getDayFromDate(dateTimeString) {
        const [datePart] = dateTimeString.split(' ');
        const [day] = datePart.split('/');
        return parseInt(day, 10);
    }
    function getMonthFromDate(dateTimeString) {
        const [datePart] = dateTimeString.split(' ');
        const [, month] = datePart.split('/');
        return parseInt(month, 10);
    }
    function getYearFromDate(dateTimeString) {
        const [datePart] = dateTimeString.split(' ');
        const [, , year] = datePart.split('/');
        return parseInt(year, 10);
    }

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
    function formatAndFlipDateTime_toLocaleString(dateTimeString) {
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
    const filterData = () => {
        let filteredQ = quotes;
        let filteredP = payments;
        console.log(filteredP)
        filteredP = payments.filter(p => {
            const paymentDate = new Date(p.date).toLocaleDateString('en-GB');
            const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();
            if (p.type === 'one-time') {
                switch (reportType) {
                    case 'daily':
                        return paymentDate === new Date(selectedDate).toLocaleDateString('en-GB');
                    case 'monthly':
                        return new Date(p.date).getMonth() + 1 === parseInt(selectedMonth);
                    case 'yearly':
                        return new Date(p.date).getFullYear() === year;
                    default:
                        return true;
                }
            }
            return p.type === reportType;
        });

        switch (reportType) {
            case 'daily':
                filteredQ = quotes.filter(q =>
                    formatAndFlipDateTime(q.date) === new Date(selectedDate).toLocaleDateString('en-GB')
                );
                break;
            case 'monthly':
                filteredQ = quotes.filter(q =>
                    getMonthFromDate(formatAndFlipDateTime(q.date)) === parseInt(selectedMonth) &&
                    getYearFromDate(formatAndFlipDateTime(q.date)) === (selectedYear ? parseInt(selectedYear) : new Date().getFullYear())
                );
                break;
            case 'yearly':
                filteredQ = quotes.filter(q =>
                    getYearFromDate(formatAndFlipDateTime(q.date)) === parseInt(selectedYear)
                );
                break;
            case 'machine':
                filteredQ = quotes.filter(q => {
                    if (q.machine_name !== selectedMachine) return false;
                    const quoteDate = formatAndFlipDateTime(q.date);
                    if (selectedDate) {
                        return quoteDate === new Date(selectedDate).toLocaleDateString('en-GB');
                    }
                    if (selectedMonth) {
                        const monthMatch = getMonthFromDate(quoteDate) === parseInt(selectedMonth);
                        const yearMatch = selectedYear ? getYearFromDate(quoteDate) === parseInt(selectedYear) : true;
                        return monthMatch && yearMatch;
                    }
                    if (selectedYear) {
                        return getYearFromDate(quoteDate) === parseInt(selectedYear);
                    }
                    return true;
                });
                break;
        }
        // console.log(selectedDate);
        // console.log(reportType)
        setFilteredQuotes(filteredQ);
        setFilteredPayments(filteredP);
        setLoading(false); // Set loading to false when data is fetched
    };

    useEffect(() => {
        fetchData();
        fetchFoodDrinks();
    }, []);
    // Use useEffect to filter data whenever relevant states (like quotes) change
    useEffect(() => {
        if (quotes.length > 0 || payments.length > 0) {
            if ((reportType === 'daily' && selectedDate) ||
                (reportType === 'monthly' && selectedMonth) ||
                (reportType === 'yearly' && selectedYear) ||
                (reportType === 'machine' && selectedMachine)) {
                filterData();
            }
        }
    }, [quotes, payments, reportType, selectedDate, selectedMonth, selectedYear, selectedMachine, startHour, endHour]);


    const totalIncome = filteredQuotes.reduce((sum, q) => sum + parseFloat(q.total_cost || 0) - parseFloat(q.foods_drinks_cost || 0), 0);
    const totalExpenses = reportType === 'yearly'
        ? calculateYearlyExpenses(filteredPayments)
        : filteredPayments.reduce((sum, p) => sum + parseFloat(p.cost || 0), 0);
    const netTotal = totalIncome - totalExpenses;

    const calculateSoldFoodDrinks = (filteredQuotes) => {
        const soldItems = {};

        filteredQuotes.forEach(quote => {
            if (quote.food_drinks && Array.isArray(quote.food_drinks)) {
                quote.food_drinks.forEach(item => {
                    if (soldItems[item.item_name]) {
                        soldItems[item.item_name].quantity += item.quantity;
                    } else {
                        soldItems[item.item_name] = { ...item };
                    }
                });
            }
        });

        return soldItems;
    };

    const calculateTotalFoodDrinksProfit = (soldItems) => {
        return Object.values(soldItems).reduce((sum, soldItem) => {
            const matchedItem = foodDrinks.find(fd => fd.item_name === soldItem.item_name);
            if (matchedItem) {
                const profitPerItem = (matchedItem.price - matchedItem.total_price) * soldItem.quantity;
                return sum + profitPerItem;
            }
            return sum;
        }, 0);
    };

    const soldItems = calculateSoldFoodDrinks(filteredQuotes);
    const totalFoodDrinksProfit = calculateTotalFoodDrinksProfit(soldItems);
    // Render loading spinner until data is fetched
    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }
    return (
        <div dir="rtl">
            <Container fluid className="my-4">
                <Row className="mb-3">
                    <Col>
                        <h2><FaFileInvoiceDollar className="me-2" />التقارير</h2>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <ReportTypeSelector reportType={reportType} handleReportTypeChange={handleReportTypeChange} />
                    </Col>
                </Row>

                <Row className="mb-3">
                    {reportType !== 'machine' ? (
                        <DateSelector
                            reportType={reportType}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                        />
                    ) : (
                        <MachineSelector
                            machines={machines}
                            selectedMachine={selectedMachine}
                            setSelectedMachine={setSelectedMachine}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                        />
                    )}
                </Row>

                {/* Toggle Button to Switch Between Reports */}
                <Row className="mb-4">
                    <Col>
                        <ButtonGroup aria-label="Report toggle">
                            <Button variant={showFinancial ? "primary" : "outline-primary"} onClick={() => setShowFinancial(true)}>
                                <FaMoneyBillWave className="me-2" /> التقارير المالية
                            </Button>
                            <Button variant={!showFinancial && !showSalesSummary ? "primary" : "outline-primary"} onClick={() => { setShowFinancial(false); setShowSalesSummary(false); }}>
                                <FaUtensils className="me-2" /> مأكولات ومشروبات
                            </Button>
                            <Button variant={showSalesSummary && !showFinancial ? "primary" : "outline-primary"} onClick={() => { setShowFinancial(false); setShowSalesSummary(true); }}>
                                <FaList className="me-2" /> الكمية مباعة
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {showFinancial ? (
                    <FinancialReport
                        filteredQuotes={filteredQuotes}
                        filteredPayments={filteredPayments}
                        netTotal={netTotal}
                        totalFoodDrinksProfit={totalFoodDrinksProfit}
                    />
                ) : showSalesSummary ? (
                    <Row className="mt-4">
                        <Col>
                            <Card>
                                <Card.Header>
                                    <FaList className="me-2" />
                                    الكمية مباعة
                                </Card.Header>
                                <Card.Body>
                                    {filteredQuotes.length > 0 ? (
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>اسم العنصر</th>
                                                    <th>الكمية الإجمالية المباعة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Aggregate the quantity sold per item, excluding items with empty names */}
                                                {Object.entries(
                                                    filteredQuotes.reduce((acc, quote) => {
                                                        quote.food_drinks?.forEach(item => {
                                                            if (item.item_name && item.item_name.trim() !== '') {
                                                                if (!acc[item.item_name]) {
                                                                    acc[item.item_name] = 0;
                                                                }
                                                                acc[item.item_name] += item.quantity;
                                                            }
                                                        });
                                                        return acc;
                                                    }, {})
                                                ).map(([itemName, totalQuantity], index) => (
                                                    <tr key={index}>
                                                        <td>{itemName}</td>
                                                        <td>{totalQuantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p className="text-muted text-center">لا توجد بيانات مبيعات للفترة المحددة</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <Row className="mt-4">
                        <Col>
                            <Card>
                                <Card.Header>
                                    <FaCalendarAlt className="me-2" />
                                    تفاصيل المأكولات والمشروبات المباعة
                                </Card.Header>
                                <Card.Body>
                                    {filteredQuotes.some(quote => quote.food_drinks?.length > 0) ? (
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>التاريخ</th>
                                                    <th>اسم العنصر</th>
                                                    <th>الكمية</th>
                                                    <th>سعر الشراء</th>
                                                    <th>سعر البيع</th>
                                                    <th>الإجمالي</th>
                                                    <th>الربح</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredQuotes.map(quote =>
                                                    quote.food_drinks?.map((item, index) => {
                                                        const foodItem = foodDrinks.find(fd => fd.item_name === item.item_name);
                                                        if (!foodItem) return null;

                                                        const totalSale = item.quantity * foodItem.total_price;
                                                        const totalCost = item.quantity * foodItem.price;
                                                        const profit = totalSale - totalCost;

                                                        return (
                                                            <tr key={`${quote._id}-${index}`}>
                                                                <td>{formatAndFlipDateTime(quote.date)}</td>
                                                                <td>{item.item_name}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>{foodItem.price} </td>
                                                                <td>{foodItem.total_price} </td>
                                                                <td>{totalSale} </td>
                                                                <td className="text-success">{profit} </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p className="text-muted text-center">لا توجد مأكولات أو مشروبات مباعة في الفترة المحددة</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Reports;
