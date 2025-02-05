import React from 'react';
import { FaClock } from 'react-icons/fa';

const formatTime = (time) => {
    if (!time) return '00:00:00';
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TimerDisplay = ({ timeLeft }) => {
    return (
        <div className="text-center mb-3">
            <div className="d-flex justify-content-center align-items-center">
                <FaClock className="me-2" size={24} style={{ color: '#007bff' }} />
                <h4 className="mb-0">
                    {timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}
                </h4>
            </div>
        </div>
    );
};

export default TimerDisplay;
