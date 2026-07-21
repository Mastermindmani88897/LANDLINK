import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_URL.replace(/\/api\/v1\/?$/, '');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  if (userId) {
    s.emit('register_user', userId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
