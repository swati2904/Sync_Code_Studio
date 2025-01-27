const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('../src/Actions');

const app = express();
app.use(cors());

// Serve React's static build files
app.use(express.static(path.join(__dirname, '..', 'build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow React app to connect
    methods: ['GET', 'POST'],
  },
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    if (userSocketMap[socket.id]) return;
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// Export the serverless function for Vercel
// module.exports = (req, res) => {
//   if (req.method === 'GET') {
//     res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
//   } else {
//     // This ensures the socket.io connection is handled properly
//     server(req, res);
//   }
// };

//run locally

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
