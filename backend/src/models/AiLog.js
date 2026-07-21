const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiLogSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', default: null },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    feature_name: { type: String, required: true },
    prompt: { type: String, default: null },
    response: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at' } }
);

aiLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('AiLog', aiLogSchema);
