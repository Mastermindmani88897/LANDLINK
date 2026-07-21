const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// POST /api/v1/chat/conversations  (Create or find conversation with target seller/user)
const createOrGetConversation = async (req, res) => {
  const { recipient_id, property_id } = req.body;
  if (!recipient_id) throw createError('Recipient user ID is required', 400);

  if (recipient_id.toString() === req.user._id.toString()) {
    throw createError('You cannot start a conversation with yourself', 400);
  }

  // Find existing conversation between these 2 users
  let conv = await Conversation.findOne({
    participants: { $all: [req.user._id, recipient_id] },
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: [req.user._id, recipient_id],
      property_id: property_id || null,
      last_message: 'Conversation started',
      last_message_at: new Date(),
    });
  } else if (property_id && !conv.property_id) {
    conv.property_id = property_id;
    await conv.save();
  }

  const populated = await Conversation.findById(conv._id)
    .populate('participants', '-password_hash')
    .populate('property_id');

  res.json(populated.toJSON ? populated.toJSON() : populated);
};

// GET /api/v1/chat/conversations  (Get all conversations for current user)
const getMyConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .sort({ last_message_at: -1 })
    .populate('participants', '-password_hash')
    .populate('property_id');

  res.json(conversations);
};

// GET /api/v1/chat/conversations/:id/messages  (Get message history for conversation)
const getConversationMessages = async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) throw createError('Conversation not found', 404);

  // Security check: verify user is participant
  const isParticipant = conv.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) throw createError('Access denied to this conversation', 403);

  // Mark messages as read for this receiver
  await Message.updateMany(
    { conversation_id: req.params.id, receiver: req.user._id, is_read: false },
    { is_read: true }
  );

  // Reset unread count for current user
  if (conv.unread_count && conv.unread_count.has(req.user._id.toString())) {
    conv.unread_count.set(req.user._id.toString(), 0);
    await conv.save();
  }

  const messages = await Message.find({ conversation_id: req.params.id })
    .sort({ created_at: 1 })
    .populate('sender', 'full_name email profile_image_url')
    .populate('receiver', 'full_name email profile_image_url');

  res.json(messages);
};

// POST /api/v1/chat/conversations/:id/messages  (Send message via REST API)
const sendMessage = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) throw createError('Message text cannot be empty', 400);

  const conv = await Conversation.findById(req.params.id);
  if (!conv) throw createError('Conversation not found', 404);

  const isParticipant = conv.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) throw createError('Access denied to this conversation', 403);

  const recipientId = conv.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  const msg = await Message.create({
    conversation_id: conv._id,
    sender: req.user._id,
    receiver: recipientId,
    text: text.trim(),
    created_at: new Date(),
  });

  // Update conversation last_message & unread counter
  conv.last_message = text.trim();
  conv.last_message_at = new Date();

  const currentUnread = conv.unread_count.get(recipientId.toString()) || 0;
  conv.unread_count.set(recipientId.toString(), currentUnread + 1);
  await conv.save();

  const populatedMsg = await Message.findById(msg._id)
    .populate('sender', 'full_name email profile_image_url')
    .populate('receiver', 'full_name email profile_image_url');

  res.status(201).json(populatedMsg);
};

module.exports = {
  createOrGetConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
};
