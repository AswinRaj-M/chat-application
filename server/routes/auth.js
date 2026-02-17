const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: '${username}'`);
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // In a real app, generate JWT here
        user.onlineStatus = true;
        await user.save();

        res.json({ user: { id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// FORCE FIX ROUTE
router.get('/fix-db', async (req, res) => {
    try {
        await User.deleteMany({}); // Delete ALL users
        const password = process.env.PASSWORD || '71125';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const users = ['vishnu', 'hima'];
        for (const username of users) {
            const newUser = new User({
                username,
                password: hashedPassword,
                onlineStatus: false
            });
            await newUser.save();
        }
        res.json({ message: "Database FIXED. vishnuHima removed. vishnu and hima created." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout Route
router.post('/logout', async (req, res) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { onlineStatus: false });
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users (for user list)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username onlineStatus');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
