// src/components/RoomCard/utils/api.js
import axios from 'axios';

export const fetchCustomerData = async (room) => {
    try {
        const response = await axios.get(`https://playstationbackend.netlify.app/.netlify/functions/server/customers?room=${room}`);
        return response.data.find((c) => c.current_machine.room === room);
    } catch (error) {
        console.error('Error fetching customer data:', error);
        return null;
    }
};

export const submitRoomData = async (roomData) => {
    try {
        const response = await axios.post('https://playstationbackend.netlify.app/.netlify/functions/server/customers', roomData);
        return response;
    } catch (error) {
        console.error('Error sending room data:', error);
        throw error;
    }
};