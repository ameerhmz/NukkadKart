import { io } from 'socket.io-client';

const URL = 'http://localhost:5001'; // Adjust for production

export const socket = io(URL, {
    autoConnect: false
});
