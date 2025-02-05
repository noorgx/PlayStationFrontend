import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, ButtonGroup, Button } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaCalendarAlt, FaUtensils, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';
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
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMachine, setSelectedMachine] = useState('');
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [showFinancial, setShowFinancial] = useState(true);

    const fetchData = async () => {
        try {
            const quotesResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/quotes');
            const paymentsResponse = await axios.get('https://playstationbackend.netlify.app/.netlify/functions/server/payments');
            setQuotes(quotesResponse.data);
            setPayments(paymentsResponse.data);

            const uniqueMachines = [...new Set(quotesResponse.data.map(quote => quote.machine_name))];
            setMachines(uniqueMachines);
        } catch (error) {
            console.error('Error fetching data:', error);
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
        setSelectedDate('');
        setSelectedMonth('');
        setSelectedYear('');
        setSelectedMachine('');
        setStartHour('');
        setEndHour('');
    };

    const calculateYearlyExpenses = (filteredPayments) => {
        return filteredPayments.reduce((sum, p) => {
            const paymentDate = new Date(p.date);
            const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();

            if (p.type === 'once' && paymentDate.getFullYear() === year) {
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

    const filterData = () => {
        let filteredQ = quotes;
        let filteredP = payments;

        filteredP = payments.filter(p => {
            const paymentDate = new Date(p.date);
            const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();

            if (p.type === 'once') {
                switch (reportType) {
                    case 'daily':
                        return paymentDate.toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
                    case 'monthly':
                        return paymentDate.getMonth() + 1 === parseInt(selectedMonth);
                    case 'yearly':
                        return paymentDate.getFullYear() === year;
                    default:
                        return true;
                }
            }
            return p.type === reportType;
        });

        switch (reportType) {
            case 'daily':
                filteredQ = quotes.filter(q =>
                    new Date(q.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
                );
                break;
            case 'monthly':
                filteredQ = quotes.filter(q =>
                    new Date(q.date).getMonth() + 1 === parseInt(selectedMonth) &&
                    new Date(q.date).getFullYear() === (selectedYear ? parseInt(selectedYear) : new Date().getFullYear())
                );
                break;
            case 'yearly':
                filteredQ = quotes.filter(q =>
                    new Date(q.date).getFullYear() === parseInt(selectedYear)
                );
                break;
            case 'machine':
                filteredQ = quotes.filter(q => {
                    if (q.machine_name !== selectedMachine) return false;
                    const quoteDate = new Date(q.date);
                    if (selectedDate) {
                        return quoteDate.toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
                    }
                    if (selectedMonth) {
                        const monthMatch = quoteDate.getMonth() + 1 === parseInt(selectedMonth);
                        const yearMatch = selectedYear ? quoteDate.getFullYear() === parseInt(selectedYear) : true;
                        return monthMatch && yearMatch;
                    }
                    if (selectedYear) {
                        return quoteDate.getFullYear() === parseInt(selectedYear);
                    }
                    return true;
                });
                break;
        }

        if (startHour && endHour && ['daily', 'monthly', 'yearly'].includes(reportType)) {
            filteredQ = filteredQ.filter(q => {
                const quoteHour = new Date(q.date).getHours();
                return quoteHour >= parseInt(startHour) && quoteHour < parseInt(endHour);
            });
        }

        setFilteredQuotes(filteredQ);
        setFilteredPayments(filteredP);
    };

    useEffect(() => {
        fetchData();
        fetchFoodDrinks();
    }, []);

    useEffect(() => {
        if ((reportType === 'daily' && selectedDate) ||
            (reportType === 'monthly' && selectedMonth) ||
            (reportType === 'yearly' && selectedYear) ||
            (reportType === 'machine' && selectedMachine)) {
            filterData();
        }
    }, [selectedDate, selectedMonth, selectedYear, selectedMachine, startHour, endHour]);

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

                {['daily', 'monthly', 'yearly'].includes(reportType) && (
                    <HourSelector
                        startHour={startHour}
                        setStartHour={setStartHour}
                        endHour={endHour}
                        setEndHour={setEndHour}
                    />
                )}

                {/* Toggle Button to Switch Between Reports */}
                <Row className="mb-4">
                    <Col>
                        <ButtonGroup aria-label="Report toggle">
                            <Button variant={showFinancial ? "primary" : "outline-primary"} onClick={() => setShowFinancial(true)}>
                                <FaMoneyBillWave className="me-2" />التقارير المالية
                            </Button>
                            <Button variant={!showFinancial ? "primary" : "outline-primary"} onClick={() => setShowFinancial(false)}>
                                <FaUtensils className="me-2" />مأكولات ومشروبات
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
                                                        const profit = totalCost - totalSale;

                                                        return (
                                                            <tr key={`${quote._id}-${index}`}>
                                                                <td>{new Date(quote.date).toLocaleDateString()}</td>
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
