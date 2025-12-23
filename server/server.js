const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const seedAdmin = require('./utils/adminSeeder').default;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
app.use(express.json());
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
connectDB().then(() => {
  seedAdmin();
});
app.set('io', io);
const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);
const Message = require('./models/Message');
io.on('connection', (socket) => {
  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('user_status_changed', { userId, isOnline: true });
    }
  });
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
  });
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });
  socket.on('send_message', async (data) => {
    const { groupId, content, senderId, senderName } = data;
    try {
      const message = await Message.create({
        content,
        group: groupId,
        sender: senderId
      });
      io.to(groupId).emit('receive_message', {
        _id: message._id,
        content,
        sender: { _id: senderId, username: senderName },
        createdAt: message.createdAt
      });
    } catch (err) {
    }
  });
  socket.on('delete_message', async ({ messageId, userId, userName }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.isDeleted = true;
        message.deletedBy = userId;
        await message.save();
        io.to(message.group.toString()).emit('update_message', {
          _id: message._id,
          isDeleted: true,
          deletedBy: { username: userName },
          content: message.content,
          sender: message.sender,
          likes: message.likes,
          createdAt: message.createdAt
        });
      }
    } catch (err) {
    }
  });
  socket.on('like_message', async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        const userIdStr = userId.toString();
        const likeIndex = message.likes.findIndex(id => id.toString() === userIdStr);
        if (likeIndex > -1) {
          message.likes.splice(likeIndex, 1);
        } else {
          message.likes.push(userId);
        }
        await message.save();
        await message.populate('sender', 'username');
        io.to(message.group.toString()).emit('update_message', {
          ...message.toObject(),

          sender: message.sender
        });
      }
    } catch (err) {
    }
  });
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('user_status_changed', { userId: disconnectedUserId, isOnline: false });
    }
  });
});
app.get('/', (req, res) => {
  res.send('StudyCircle API is running...');
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/users', require('./routes/users'));
app.use('/api/threads', require('./routes/threads'));
app.use('/api/files', require('./routes/files'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/private-chat', require('./routes/privateChat'));
app.use('/api/invites', require('./routes/invites'));
app.use('/api/admin', require('./routes/admin'));
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Server Error', error: err.message });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
});
module.exports = app;