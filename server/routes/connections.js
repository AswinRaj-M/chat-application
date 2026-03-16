const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');

// Send Friend Request
router.post('/request', async (req, res) => {
    const { requesterId, recipientId } = req.body;
    try {
        const user = await User.findById(requesterId);
        if (!user) return res.status(404).json({ message: `Requester not found with ID: ${requesterId || 'null/undefined'}` });

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: 'Recipient user not found' });

        const today = new Date().setHours(0, 0, 0, 0);
        const lastDate = user.lastRequestDate ? new Date(user.lastRequestDate).setHours(0, 0, 0, 0) : null;

        if (lastDate !== today) {
            user.dailyRequestCount = 0;
            user.lastRequestDate = new Date();
        }

        if (user.dailyRequestCount >= 5) {
            return res.status(403).json({ message: 'Daily limit reached. You can only send 5 requests per day like a dating app!' });
        }

        // Check if connection already exists
        const existing = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: 'Request already exists or users are already connected' });
        }

        const newRequest = new Connection({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        await newRequest.save();

        // Increment user's daily count
        user.dailyRequestCount += 1;
        await user.save();

        res.status(201).json({ message: 'Friend request sent', remainingRequests: 5 - user.dailyRequestCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Respond to Request (Accept/Reject)
router.put('/respond', async (req, res) => {
    const { connectionId, status } = req.body; // status: 'accepted' or 'rejected'
    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ message: 'Request not found' });

        connection.status = status;
        connection.updatedAt = Date.now();
        await connection.save();

        res.json({ message: `Request ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Pending Requests for User
router.get('/pending/:userId', async (req, res) => {
    try {
        const requests = await Connection.find({
            recipient: req.params.userId,
            status: 'pending'
        }).populate('requester', 'username onlineStatus profileImage');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User's Friends
router.get('/friends/:userId', async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [
                { requester: req.params.userId },
                { recipient: req.params.userId }
            ],
            status: 'accepted'
        }).populate('requester', 'username onlineStatus profileImage').populate('recipient', 'username onlineStatus profileImage');

        const friends = connections
            .filter(conn => conn.requester && conn.recipient) // Filter out connections with missing users
            .map(conn => {
                return conn.requester._id.toString() === req.params.userId ? conn.recipient : conn.requester;
            });

        res.json(friends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Recommendations (Dating app style)
router.get('/discover/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find users with 'accepted' status to exclude
        const acceptedConnections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        });

        const excludedIds = acceptedConnections.map(c => 
            c.requester.toString() === userId ? c.recipient.toString() : c.requester.toString()
        );
        excludedIds.push(userId); // Also exclude self

        // Find users not in the excluded list
        const strangers = await User.find({
            _id: { $nin: excludedIds }
        }).limit(20).lean();

        // Check if there is a pending connection for each stranger
        const pendingConnections = await Connection.find({
            $or: [
                { requester: userId, status: 'pending' },
                { recipient: userId, status: 'pending' }
            ]
        });

        const strangersWithStatus = strangers.map(s => {
            const pending = pendingConnections.find(p => 
                p.requester.toString() === s._id.toString() || 
                p.recipient.toString() === s._id.toString()
            );
            return {
                ...s,
                connectionStatus: pending ? (pending.requester.toString() === userId ? 'sent' : 'received') : 'none'
            };
        });

        res.json(strangersWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
