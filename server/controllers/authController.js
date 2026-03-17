const User = require('../models/User');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ 
            message: 'User created successfully', 
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
                bio: newUser.bio,
                location: newUser.location
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        user.onlineStatus = true;
        await user.save();

        res.json({ 
            user: { 
                id: user._id, 
                username: user.username, 
                profileImage: user.profileImage,
                coverImage: user.coverImage,
                bio: user.bio,
                location: user.location
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { onlineStatus: false });
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const searchUsers = async (req, res) => {
    const { username } = req.query;
    try {
        const users = await User.find({ 
            username: { $regex: username, $options: 'i' } 
        }, 'username onlineStatus profileImage');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { userId, username, profileImage, coverImage, bio, location, age, qualification } = req.body;
    try {
        const updateData = {};
        
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            updateData.username = username;
        }

        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (age !== undefined) updateData.age = age;
        if (qualification !== undefined) updateData.qualification = qualification;

        const user = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    searchUsers,
    updateProfile
};
