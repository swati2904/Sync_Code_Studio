const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"], // Allow only GET and POST requests
    credentials: true, // Allow sending cookies and credentials
  },
});

app.use(cors()); // Enable CORS for all routes in Express

const userSocketMap = {};
const socketRoomMap = {};

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    //  Ensure unique usernames
    if (Object.values(userSocketMap).includes(username)) {
      socket.emit(ACTIONS.ERROR, "Username already taken");
      return;
    }

    userSocketMap[socket.id] = username;
    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;

    const clients = getAllConnectedClients(roomId);
    io.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socketRoomMap[socket.id];
    const username = userSocketMap[socket.id]; // Retrieve username before deletion
    delete userSocketMap[socket.id];
    delete socketRoomMap[socket.id];

    if (roomId) {
      // Notify other users in the room about the disconnection
      io.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: username,
      });
    }
  });
});

function getAllConnectedClients(roomId) {
  // map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
