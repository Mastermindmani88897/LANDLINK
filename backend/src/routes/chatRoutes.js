const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getThreads, getChatHistory, sendMessage } = require('../controllers/chatController');

router.get('/threads', protect, getThreads);
router.get('/history/:targetUserId', protect, getChatHistory);
router.post('/', protect, sendMessage);

module.exports = router;
