const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  property_id: { type: Schema.Types.ObjectId, ref: 'Property' },
  last_message: { type: String, default: '' },
  last_message_at: { type: Date, default: Date.now },
  unread_count: { type: Map, of: Number, default: {} },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', ConversationSchema);
