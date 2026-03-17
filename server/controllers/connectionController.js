const Connection = require('../models/Connection');
const User = require('../models/User');

const sendRequest = async (req, res) => {
    const { requesterId, recipientId } = req.body;
    try {
        const user = await User.findById(requesterId);
        if (!user) return res.status(404).json({ message: 'Requester not found' });

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

        // Daily limit check
        const today = new Date().setHours(0, 0, 0, 0);
        const lastDate = user.lastRequestDate ? new Date(user.lastRequestDate).setHours(0, 0, 0, 0) : null;

        if (lastDate !== today) {
            user.dailyRequestCount = 0;
            user.lastRequestDate = new Date();
        }

        if (user.dailyRequestCount >= 5) {
            return res.status(403).json({ message: 'Daily limit reached. You can only send 5 requests per day!' });
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

        user.dailyRequestCount += 1;
        await user.save();

        res.status(201).json({ message: 'Friend request sent', remainingRequests: 5 - user.dailyRequestCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const respondToRequest = async (req, res) => {
    const { connectionId, status } = req.body;
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
};

const getPendingRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            recipient: req.params.userId,
            status: 'pending'
        }).populate('requester', 'username onlineStatus profileImage');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getFriends = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [
                { requester: req.params.userId },
                { recipient: req.params.userId }
            ],
            status: 'accepted'
        }).populate('requester', 'username onlineStatus profileImage')
          .populate('recipient', 'username onlineStatus profileImage');

        const friends = connections
            .filter(conn => conn.requester && conn.recipient)
            .map(conn => {
                return conn.requester._id.toString() === req.params.userId ? conn.recipient : conn.requester;
            });

        res.json(friends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDiscoveryUsers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const acceptedConnections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        });

        const excludedIds = acceptedConnections.map(c => 
            c.requester.toString() === userId ? c.recipient.toString() : c.requester.toString()
        );
        excludedIds.push(userId);

        const strangers = await User.find({
            _id: { $nin: excludedIds }
        }).limit(20).lean();

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
};

module.exports = {
    sendRequest,
    respondToRequest,
    getPendingRequests,
    getFriends,
    getDiscoveryUsers
};
