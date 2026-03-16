const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');

// Send Friend Request
router.post('/request', async (req, res) => {
    const { requesterId, recipientId } = req.body;
    try {
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
        res.status(201).json({ message: 'Friend request sent' });
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

        const friends = connections.map(conn => {
            return conn.requester._id.toString() === req.params.userId ? conn.recipient : conn.requester;
        });

        res.json(friends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
