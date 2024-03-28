import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttemp: "Infinity",
    timeout: 10000,
    transport: ["websocket"],
  };

  const backendURL = process.env.REACT_APP_BACKEND_URL;
  return io(backendURL, options);
};
