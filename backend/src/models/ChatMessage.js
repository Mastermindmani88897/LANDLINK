const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', default: null },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message_text: { type: String, required: true },
    image_url: { type: String, default: null },
    read_receipt: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at' } }
);

chatMessageSchema.index({ sender_id: 1, receiver_id: 1 });

chatMessageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.sender_id = ret.sender_id?.toString();
    ret.receiver_id = ret.receiver_id?.toString();
    ret.property_id = ret.property_id?.toString() || null;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
