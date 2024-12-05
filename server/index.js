import express from 'express';
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = express()
const handler = app.getRequestHandler();


  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  }});

  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    socket.on('send-message', ({message, userId}) => {
      const messageData = {
        id: randomBytes(4).toString('hex'),
        content: message,
        senderId: userId,
        timestamp: new Date()
      };
      room.messages.push(messageData);
      io.to(roomCode).emit('new-message', messageData);
    })
  });

    const broadcastMessage = (message) => {
        io.emit('message', message);
    };

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });