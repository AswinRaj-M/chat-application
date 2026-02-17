const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

// Get call history for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const calls = await Call.find({
            $or: [{ callerId: userId }, { receiverId: userId }]
        })
            .populate('callerId', 'username')
            .populate('receiverId', 'username')
            .sort({ timestamp: -1 });

        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
