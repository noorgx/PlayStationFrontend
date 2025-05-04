import React from 'react';
import { Row, Col } from 'react-bootstrap'; // Import the necessary Bootstrap components

const QuotePDF = ({ quote }) => (
    <div dir="rtl" style={{ padding: '10px', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
        <style>
            {`
            @media print {
                @page {
                    margin: 0;
                    size: auto;
                }
                body {
                    margin: 0;
                    font-size: 10px;
                }
                a[href]:after {
                    content: none !important;
                }
            }
            `}
        </style>
        <h1 style={{ textAlign: 'right', marginBottom: '10px' }}>فاتورة الاستخدام</h1>
        <Row>
            <Col md={6}>
                <p><strong>اسم الكاشير:</strong> {quote.user_name}</p>
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
                <p><strong>تكلفة الأطعمة/المشروبات:</strong> {quote.foods_drinks_cost}</p>
                <p><strong>تكلفة استخدام الجهاز:</strong> {quote.machine_usage_cost}</p>
            </Col>
            <Col md={6}>
                <p><strong>التكلفة الإضافية:</strong> {quote.additionalCost}</p>
                <p><strong>سبب التكلفة الإضافية:</strong> {quote.additionalCostReason}</p>
            </Col>
        </Row>

        {/* Food and Drinks Section */}
        <h5 style={{ marginTop: '10px' }}>الأطعمة/المشروبات:</h5>
        <ul>
            {quote.food_drinks?.map((item, index) => (
                <li key={index}>
                    <strong>المنتج:</strong> {item.item_name} <br />
                    <strong>الكمية:</strong> {item.quantity} <br />
                    <strong>السعر:</strong> {item.price} <br />
                    <strong>التكلفة الإجمالية:</strong> {(item.price * item.quantity).toFixed(2)}
                </li>
            ))}
        </ul>

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
    </div>
);

export default QuotePDF;
