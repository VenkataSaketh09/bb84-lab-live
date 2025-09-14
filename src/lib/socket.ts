import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    // Use deployed backend URL or fallback to localhost for development
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
      (import.meta.env.PROD ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001');
    
    socket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
      forceNew: true
    });
    
    socket.on('connect', () => {
      console.log('Connected to server:', serverUrl);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};