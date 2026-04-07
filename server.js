const express = require('express');
const bodyParser = require("body-parser");
const dbConnect = require('./config/dbConnect');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/message');
const authRouter = require('./routes/authRoute');
const messageRouter = require("./routes/messageRoute");
const cors = require('cors');

const app = express();
const PORT = 5000;

const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {

  socket.on('register', (userId) => {
    if (!userId) return;
    onlineUsers.set(userId.toString(), socket.id);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      if (!msg.fromUserId || !msg.toUserId || !msg.messageContent) {
        return;
      }

      const savedMessage = await Message.create({
        fromUserId: msg.fromUserId,
        toUserId: msg.toUserId,
        messageContent: msg.messageContent,
        createDate: new Date()
      });

      const data = savedMessage.toObject();

      const toSocketId = onlineUsers.get(msg.toUserId.toString());
      if (toSocketId) {
        io.to(toSocketId).emit("receiveMessage", data);
      }

      const fromSocketId = onlineUsers.get(msg.fromUserId.toString());
      if (fromSocketId) {
        io.to(fromSocketId).emit("receiveMessage", data);
      }

      io.emit("updateConversations");

    } catch (err) {
      console.error("Save message error:", err);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", authRouter);
// app.use("/api/message", messageRouter);   

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});