const Connection = require('../models/Connection');
const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
    const { senderId, receiverId } = req.query;
    try {
        // Friendship check
        const friendship = await Connection.findOne({
            $or: [
                { requester: senderId, recipient: receiverId, status: 'accepted' },
                { requester: receiverId, recipient: senderId, status: 'accepted' }
            ]
        });

        if (!friendship) {
            return res.status(403).json({ message: 'You can only message friends' });
        }

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};
