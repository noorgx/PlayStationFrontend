import React, { useState } from 'react';
import { Table, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faMoneyBillWave, faCalendar, faCoins, faChartLine, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const FinancialReport = ({ filteredQuotes, filteredPayments, netTotal, totalExpenses,totalIncome, reportType }) => {
    const [isTableExpanded, setIsTableExpanded] = useState(false); // State to manage table visibility

    // Function to group payments by type for yearly report
    const groupPaymentsByType = (payments) => {
        const grouped = {
            once: [],
            daily: [],
            monthly: [],
            yearly: []
        };

        payments.forEach(p => {
            if (grouped[p.type]) {
                grouped[p.type].push(p);
            }
        });

        return grouped;
    };

    function formatAndFlipDateTime(dateTimeString) {
        const [datePart, timePart] = dateTimeString.replace(/\//g, '-').split(' ');
        const [day, month, year] = datePart.split('-');
        const flippedDatePart = `${year}-${month}-${day}`;
        const flippedDateTimeString = `${flippedDatePart} ${timePart}`;
        const date = new Date(flippedDateTimeString);
        const formattedDate = date.toLocaleString('en-GB');
        return formattedDate; 
    }

    // Group payments by type for yearly report
    const groupedPayments = reportType === 'yearly' ? groupPaymentsByType(filteredPayments) : null;

    // Toggle table visibility
    const toggleTable = () => setIsTableExpanded(!isTableExpanded);

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    التقرير المالي
                </h5>
            </Card.Header>
            <Card.Body>
                {/* Toggle Button */}
                {/* <div className="mb-3 text-end">
                    <a href="#!" onClick={toggleTable}>
                        {isTableExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        <FontAwesomeIcon icon={isTableExpanded ? faChevronUp : faChevronDown} className="ms-2" />
                    </a>
                </div> */}

                {/* Main Table for Quotes and Payments */}
                <Table striped bordered hover responsive className="mb-4">
                    <thead className="bg-light">
                        <tr>
                            {/* <th>#</th>
                            <th>النوع</th>
                            <th>المستخدم</th>
                            <th>الاسم</th>
                            <th>المبلغ</th>
                            <th>التاريخ</th> */}
                        </tr>
                    </thead>
                    
                    {/* Conditionally render table body based on isTableExpanded */}
                    {isTableExpanded && (
                        <tbody>
                            {filteredQuotes.map((q, i) => (
                                <tr key={q.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                        فاتورة
                                    </td>
                                    <td>{q.user_name}</td>
                                    <td>{q.machine_name}</td>
                                    <td className="text-success">+{q.total_cost}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                        {formatAndFlipDateTime(q.date)}
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.map((p, i) => (
                                <tr key={p.id}>
                                    <td>{filteredQuotes.length + i + 1}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                        مصروفات
                                    </td>
                                    <td>admin</td>
                                    <td>{p.name}</td>
                                    <td className="text-danger">-{p.cost}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                        {p.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}

                    {/* Show only the footer by default */}
                    <tfoot className="bg-light">
                        <tr>
                            <td colSpan="4" className="text-end"><strong> الإجمالي:</strong></td>
                            <td className={totalIncome >= 0 ? 'text-success' : 'text-danger'}>
                                <strong>{totalIncome.toFixed(2)}</strong>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan="4" className="text-end"><strong> الخصومات:</strong></td>
                            <td className='text-danger'>
                                <strong>{totalExpenses.toFixed(2)}</strong>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan="4" className="text-end"><strong>صافي الربح:</strong></td>
                            <td className="text-success">
                                <strong>{(netTotal).toFixed(2)}</strong>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </Table>

                {/* Yearly Expenses Table */}
                {reportType === 'yearly' && (
                    <Card className="mt-4 shadow-sm">
                        <Card.Header className="bg-secondary text-white">
                            <h5 className="mb-0">
                                <FontAwesomeIcon icon={faCoins} className="me-2" />
                                تفاصيل المصروفات السنوية
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead className="bg-light">
                                    <tr>
                                        <th>النوع</th>
                                        <th>عدد الدفعات</th>
                                        <th>التكلفة السنوية</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedPayments).map(([type, payments]) => (
                                        <tr key={type}>
                                            <td>
                                                {type === 'once' ? 'مرة واحدة' : type === 'daily' ? 'يومي' : type === 'monthly' ? 'شهري' : 'سنوي'}
                                            </td>
                                            <td>{payments.length}</td>
                                            <td className="text-danger">
                                                {payments.reduce((sum, p) => {
                                                    if (type === 'daily') return sum + (parseFloat(p.cost || 0) * 365);
                                                    if (type === 'monthly') return sum + (parseFloat(p.cost || 0) * 12);
                                                    return sum + parseFloat(p.cost || 0);
                                                }, 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}
            </Card.Body>
        </Card>
    );
};

export default FinancialReport;
