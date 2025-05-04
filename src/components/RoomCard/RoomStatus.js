// src/components/RoomCard/RoomStatus.js
import React from 'react';

const RoomStatus = ({ isOpen, mode, startTime, endTime }) => {
    return (
        <div className="mt-3">
            {/* <p><strong>Room Status:</strong> {isOpen ? 'Open' : 'Timer'}</p>
            <p><strong>Mode:</strong> {mode || 'Not selected'}</p>
            <p><strong>Start Time:</strong> {startTime ? startTime.toLocaleTimeString() : 'Not started'}</p>
            <p><strong>End Time:</strong> {endTime ? endTime.toLocaleTimeString() : 'Not ended'}</p> */}
        </div>
    );
};

export default RoomStatus;