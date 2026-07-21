const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrGetConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
} = require('../controllers/chatController');

router.use(protect);

router.post('/conversations', createOrGetConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);

module.exports = router;
