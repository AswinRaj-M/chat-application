const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');

// Send Friend Request
router.post('/request', connectionController.sendRequest);

// Respond to Request (Accept/Reject)
router.put('/respond', connectionController.respondToRequest);

// Get Pending Requests for User
router.get('/pending/:userId', connectionController.getPendingRequests);

// Get User's Friends
router.get('/friends/:userId', connectionController.getFriends);

// Get Recommendations (Dating app style)
router.get('/discover/:userId', connectionController.getDiscoveryUsers);

module.exports = router;
