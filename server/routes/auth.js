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

// Seed Route (to ensure default user exists)
router.post('/seed', async (req, res) => {
    try {
        const defaultUser = await User.findOne({ username: 'vishnuHima' });
        if (!defaultUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('71125', salt);
            const newUser = new User({
                username: 'vishnuHima',
                password: hashedPassword
            });
            await newUser.save();
            return res.json({ message: 'Default user created' });
        }
        res.json({ message: 'Default user already exists' });
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
