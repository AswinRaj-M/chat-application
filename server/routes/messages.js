const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get messages between two users
router.get('/', messageController.getMessages);

module.exports = router;
