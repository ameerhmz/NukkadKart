import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // Adjust for production

export const socket = io(URL, {
    autoConnect: false
});
