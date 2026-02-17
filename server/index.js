const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Log URI (mask password if present)
console.log('Connecting to MongoDB...');

// DB Connection
// Use 127.0.0.1 to avoid localhost IPv6 issues
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime-chat';

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        // Do not exit, keep server running to allow debugging
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', async (req, res) => {
    const { senderId, receiverId } = req.query;
    try {
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send(err);
    }
});




// Socket.IO Logic
let users = {}; // userId -> socketId

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register-user', (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId} -> ${socket.id}`);
        // Update DB
        User.findByIdAndUpdate(userId, { onlineStatus: true }).catch(() => { });
        io.emit('user-status-change', { userId, online: true });
    });

    socket.on('send-message', async (data) => {
        const { senderId, receiverId, text } = data;
        try {
            const newMessage = new Message({ senderId, receiverId, text });
            await newMessage.save();

            const receiverSocketId = users[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive-message', newMessage);
            }
            socket.emit('message-sent', newMessage);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('call-user', (data) => {
        const { userToCall, signalData, from, name, callType } = data;
        const receiverSocketId = users[userToCall];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('incoming-call', {
                signal: signalData,
                from,
                name,
                callType // Pass call type (audio/video)
            });
        }
    });

    socket.on('answer-call', (data) => {
        // data.to might be a Socket ID (from receiver) or User ID. 
        // Try lookup, otherwise assume it's already a socket ID.
        const receiverSocketId = users[data.to] || data.to;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call-accepted', { signal: data.signal, name: data.name });
        }
    });

    socket.on('end-call', (data) => {
        const { to } = data;
        const receiverSocketId = users[to] || to;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call-ended');
        }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user-typing', { senderId });
        }
    });

    socket.on('stop-typing', ({ senderId, receiverId }) => {
        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user-stop-typing', { senderId });
        }
    });

    socket.on('disconnect', async () => {
        const userId = Object.keys(users).find(key => users[key] === socket.id);
        if (userId) {
            delete users[userId];
            // Update online status in DB (optional, fire and forget)
            User.findByIdAndUpdate(userId, { onlineStatus: false }).catch(() => { });
            io.emit('user-status-change', { userId, online: false });
        }
        console.log('Client disconnected');
    });

    socket.on('reject-call', (data) => {
        const { to } = data;
        const receiverSocketId = users[to] || to;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call-rejected');
        }
    });

    socket.on('mute-status', ({ to, isMuted }) => {
        const receiverSocketId = users[to] || to;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('peer-mute-status', { isMuted });
        }
    });

});

const PORT = process.env.PORT || 5000;
const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(PORT);
