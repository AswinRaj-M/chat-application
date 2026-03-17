const User = require('../models/User');
const Connection = require('../models/Connection');
const Message = require('../models/Message');

const socketHandler = (io) => {
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
                // Socket level check for friendship
                const friendship = await Connection.findOne({
                    $or: [
                        { requester: senderId, recipient: receiverId, status: 'accepted' },
                        { requester: receiverId, recipient: senderId, status: 'accepted' }
                    ]
                });

                if (!friendship) return;

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
            console.log(`Call attempt from ${name} (${from}) to ${userToCall}. Receiver Socket: ${receiverSocketId || 'NOT FOUND'}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incoming-call', {
                    signal: signalData,
                    from,
                    name,
                    callType
                });
            }
        });

        socket.on('answer-call', (data) => {
            const receiverSocketId = users[data.to] || data.to;
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call-accepted', { signal: data.signal, name: data.name });
            }
        });

        socket.on('end-call', (data) => {
            const { to } = data;
            const targetId = users[to] || to;
            if (targetId) {
                io.to(targetId).emit('call-ended');
            }
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

        socket.on('send-friend-request', ({ recipientId, requesterName }) => {
            const receiverSocketId = users[recipientId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('friend-request-received', { requesterName });
            }
        });

        socket.on('accept-friend-request', ({ requesterId, acceptorName }) => {
            const receiverSocketId = users[requesterId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('friend-request-accepted', { acceptorName });
            }
        });

        socket.on('disconnect', async () => {
            const userId = Object.keys(users).find(key => users[key] === socket.id);
            if (userId) {
                delete users[userId];
                User.findByIdAndUpdate(userId, { onlineStatus: false }).catch(() => { });
                io.emit('user-status-change', { userId, online: false });
            }
            console.log('Client disconnected');
        });
    });
};

module.exports = socketHandler;
