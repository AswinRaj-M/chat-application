const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup Route
router.post('/signup', authController.signup);

// Login Route
router.post('/login', authController.login);

// Logout Route
router.post('/logout', authController.logout);

// Search Users
router.get('/search', authController.searchUsers);

// Update Profile
router.put('/profile', authController.updateProfile);

module.exports = router;
