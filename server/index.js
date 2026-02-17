const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const Message = require('./models/Message');
const Call = require('./models/Call');
const callRoutes = require('./routes/calls');

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

// Health Check
app.get('/', (req, res) => {
    res.send("DEPLOYMENT SUCCESS! Server is running with NEW code.");
});

app.get('/check-users', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

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

app.use('/api/calls', callRoutes);




// Socket.IO Logic
let users = {}; // userId -> socketId
let calls = {}; // socketId -> callId

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

    socket.on('call-user', async (data) => {
        const { userToCall, signalData, from, name, callType } = data;
        const receiverSocketId = users[userToCall];

        try {
            const newCall = new Call({
                callerId: from,
                receiverId: userToCall,
                status: 'initiated'
            });
            await newCall.save();

            calls[socket.id] = newCall._id;
            if (receiverSocketId) calls[receiverSocketId] = newCall._id;

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incoming-call', {
                    signal: signalData,
                    from,
                    name,
                    callType,
                    callId: newCall._id
                });
            } else {
                newCall.status = 'missed';
                await newCall.save();
            }
        } catch (err) {
            console.error("Error logging call:", err);
        }
    });

    socket.on('answer-call', async (data) => {
        const receiverSocketId = users[data.to] || data.to;

        const callId = data.callId || calls[socket.id];
        if (callId) {
            await Call.findByIdAndUpdate(callId, { status: 'accepted', startTime: Date.now() });
        }

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call-accepted', { signal: data.signal, name: data.name });
        }
    });

    socket.on('end-call', async (data) => {
        const { to } = data;
        const receiverSocketId = users[to] || to;

        const callId = calls[socket.id];
        if (callId) {
            const call = await Call.findById(callId);
            if (call) {
                call.endTime = Date.now();
                call.duration = (call.endTime - call.startTime) / 1000;
                if (call.status === 'initiated') call.status = 'missed';
                else call.status = 'ended';
                await call.save();
            }
            delete calls[socket.id];
            if (receiverSocketId) delete calls[receiverSocketId];
        }

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

    socket.on('reject-call', async (data) => {
        const { to } = data;
        const receiverSocketId = users[to] || to;

        const callId = calls[socket.id];
        if (callId) {
            await Call.findByIdAndUpdate(callId, { status: 'rejected' });
            delete calls[socket.id];
            if (receiverSocketId) delete calls[receiverSocketId];
        }

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
console.log(`Starting server in mode: ${process.env.NODE_ENV || 'development'}`);
console.log(`Current working directory: ${process.cwd()}`);

const startServer = (port) => {
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        console.log(`Health check available at http://0.0.0.0:${port}/`);
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
