const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Property = require('../models/Property');

const createError = (msg, code) => { const e = new Error(msg); e.statusCode = code; return e; };

// GET /api/v1/chat/threads
const getThreads = async (req, res) => {
  const userId = req.user._id;
  const messages = await ChatMessage.find({
    $or: [{ sender_id: userId }, { receiver_id: userId }],
  }).sort({ created_at: -1 });

  const seenUsers = new Set();
  const threads = [];

  for (const msg of messages) {
    const targetId = msg.sender_id.toString() === userId.toString() ? msg.receiver_id : msg.sender_id;
    if (seenUsers.has(targetId.toString())) continue;
    seenUsers.add(targetId.toString());

    const targetUser = await User.findById(targetId).select('-password_hash');
    if (!targetUser) continue;

    const prop = msg.property_id ? await Property.findById(msg.property_id).select('title expected_price') : null;
    const json = msg.toJSON();

    threads.push({
      target_user: { id: targetUser._id.toString(), full_name: targetUser.full_name, email: targetUser.email, profile_image_url: targetUser.profile_image_url },
      last_message: { id: json.id, message_text: json.message_text, image_url: json.image_url, read_receipt: json.read_receipt, created_at: json.created_at, sender_id: json.sender_id },
      property: prop ? { id: prop._id.toString(), title: prop.title, expected_price: prop.expected_price } : null,
    });
  }

  res.json(threads);
};

// GET /api/v1/chat/history/:targetUserId
const getChatHistory = async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;

  const messages = await ChatMessage.find({
    $or: [
      { sender_id: userId, receiver_id: targetUserId },
      { sender_id: targetUserId, receiver_id: userId },
    ],
  }).sort({ created_at: 1 });

  // Mark unread messages from target as read
  const unread = messages.filter((m) => m.receiver_id.toString() === userId.toString() && !m.read_receipt);
  if (unread.length) {
    await ChatMessage.updateMany(
      { _id: { $in: unread.map((m) => m._id) } },
      { $set: { read_receipt: true } }
    );
  }

  res.json(messages.map((m) => m.toJSON()));
};

// POST /api/v1/chat/
const sendMessage = async (req, res) => {
  const { receiver_id, property_id, message_text, image_url } = req.body;
  const receiver = await User.findById(receiver_id);
  if (!receiver) throw createError('Recipient user not found', 404);

  const msg = await ChatMessage.create({
    sender_id: req.user._id,
    receiver_id,
    property_id: property_id || null,
    message_text,
    image_url: image_url || null,
    read_receipt: false,
  });

  res.status(201).json(msg.toJSON());
};

module.exports = { getThreads, getChatHistory, sendMessage };
