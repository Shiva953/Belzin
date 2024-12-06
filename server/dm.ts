import express from 'express';
import { randomBytes } from 'crypto';
import { createServer } from "http";
import { Server } from "socket.io";

const hostname = "localhost";
const port = 3002;

const app = express();
const httpServer = createServer(app);

interface Message {
  id: string
  content: string
  senderId: string
  sender: string
  timestamp: Date
}


const rooms = new Map<string, {
  users: Set<string>,
  messages: Message[],
  lastActive: number
}>

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

//similar implementation as global chat, but events are only transmitted to rooms with roomId
// roomId of client should match that of server

io.on('connection', (socket) => {
    let roomCode;

    socket.on('set-user-id', (userId: string) => {
      console.log('User connected: ', userId)
    });

    socket.on('create-room', (code) => {
      roomCode = randomBytes(3).toString('hex').toUpperCase();
      rooms.set(roomCode, { 
        users: new Set<string>(),
        messages: [],
        lastActive: Date.now()
      });
      socket.emit('room-created', roomCode);
    })

    socket.on('join-room', (data) => {
      //getting the room
      const parsedData = JSON.parse(data);
      const roomCode = parsedData.roomId;
      const room = rooms.get(roomCode);

      if(!room){
        socket.emit('error', 'Room Not Found')
        return;
      }

      //joining the room
      socket.join(roomCode);
      room.users.add(socket.id);
      room.lastActive = Date.now();
      socket.emit('joined-room', { roomCode, messages: room.messages });

      //event ONLY transmitted to USERS IN THE ROOM with given ROOM CODE
      io.to(roomCode).emit('user-joined', room.users.size);
    })

    socket.on('send-message', ({roomCode, message, userId, name}) => {
      const room = rooms.get(roomCode);
      if (room) {
        const messageData = {
          id: randomBytes(4).toString('hex'),
          content: message,
          senderId: userId,
          sender: name,
          timestamp: new Date()
        };
        room.messages.push(messageData); //updating room messages state in backend
        io.to(roomCode).emit('new-message', messageData)
      }
    })

    // socket.on('user-joined', (userCount) => {
    //   userCount+=1;
    //   socket.emit('user-joined', userCount)
    // })

    // socket.on('user-left', (userCount) => {
    //   userCount-=1;
    //   socket.emit('user-joined', userCount)
    // })

    // socket.on('new-message', (message) => {
    //   let room = rooms.get(roomCode!)
    //   if(room){
    //     room?.messages.push(message);
    //     io.to(roomCode!).emit('new-message', message)
    //   } 
    // })

    // socket.on('set-user-id', () => {
        
    // })

    socket.on('disconnect', () => {
      rooms.forEach((room, roomCode) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomCode).emit('user-left', room.users.size);
  
          if (room.users.size === 0) {
            console.log(`Deleting empty room: ${roomCode}`);
            rooms.delete(roomCode);
          }
        }
      });
    });
})

setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomCode) => {
    if (room.users.size === 0 && now - room.lastActive > 3600000) {
      console.log(`Cleaning up inactive room: ${roomCode}`);
      rooms.delete(roomCode);
    }
  });
}, 3600000);

httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });