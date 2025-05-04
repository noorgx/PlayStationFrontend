import React from 'react';
import { Card, Table, Row, Col } from 'react-bootstrap';
import { FaMoneyBillWave, FaUtensils, FaCalculator } from 'react-icons/fa';
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
    const formattedDate = date.toLocaleString('en-GB'); // Format as DD/MM/YYYY

    // Return the formatted date and time
    return formattedDate; 
}
const MachineReport = ({ filteredQuotes, totalIncome, totalFoodDrinksProfit }) => {
    return (
        <Card className="shadow-sm mt-4">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">تقرير الآلات</h5>
            </Card.Header>
            <Card.Body>
                <Table responsive striped bordered hover className="mb-4">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>الآلة</th>
                            <th>التاريخ</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotes.map((q, i) => (
                            <tr key={q.id}>
                                <td>{i + 1}</td>
                                <td>{q.machine_name}</td>
                                <td>{formatAndFlipDateTime(q.date)}</td>
                                <td className="text-success">+{q.total_cost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-end">
                                <strong>إجمالي الربح من الآلات:</strong>
                            </td>
                            <td className="text-success">
                                <FaMoneyBillWave className="me-1" />
                                <strong>{totalIncome.toFixed(2)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="text-end">
                                <strong>إجمالي الربح من المأكولات والمشروبات:</strong>
                            </td>
                            <td className="text-success">
                                <FaUtensils className="me-1" />
                                <strong>{totalFoodDrinksProfit.toFixed(2)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="text-end">
                                <strong>الإجمالي الكلي:</strong>
                            </td>
                            <td className="text-success">
                                <FaCalculator className="me-1" />
                                <strong>{(totalIncome + totalFoodDrinksProfit).toFixed(2)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </Table>

                {/* Responsive Summary */}
                <Row className="text-center text-md-end">
                    <Col md={4}>
                        <div className="p-3 bg-light rounded shadow-sm mb-3">
                            <FaMoneyBillWave size={24} className="text-success mb-2" />
                            <p className="mb-0"><strong>إجمالي الربح من الآلات</strong></p>
                            <h5 className="text-success">{totalIncome.toFixed(2)}</h5>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded shadow-sm mb-3">
                            <FaUtensils size={24} className="text-success mb-2" />
                            <p className="mb-0"><strong>إجمالي الربح من المأكولات والمشروبات</strong></p>
                            <h5 className="text-success">{totalFoodDrinksProfit.toFixed(2)}</h5>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded shadow-sm mb-3">
                            <FaCalculator size={24} className="text-success mb-2" />
                            <p className="mb-0"><strong>الإجمالي الكلي</strong></p>
                            <h5 className="text-success">{(totalIncome + totalFoodDrinksProfit).toFixed(2)}</h5>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default MachineReport;
