import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnectionAttemp: 'Infinity',
    timeout: 10000,
    transport: ['websocket'],
  };

  const backendURL = 'http://localhost:5000';
  return io(backendURL, options);
};
