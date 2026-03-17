const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./socket/index');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// CORS Configuration
const io = socketIo(server, {
    cors: {
        origin: '*', // In production, replace with specific domain
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');
const User = require('./models/User'); // Still needed for some inline routes

app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);

// Debug/Health Routes
app.get('/', (req, res) => {
    res.send("Chat App Server is running in MODULAR mode.");
});

app.get('/check-users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error checking users' });
    }
});

// Socket Handling
socketHandler(io);

// Server Listening
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        console.log(`Health check available at http://localhost:${port}/`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server failed to start:', err);
        }
    });
};

startServer(PORT);
