const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
