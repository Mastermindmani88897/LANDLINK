const mongoose = require('mongoose');
const { Schema } = mongoose;

const offerSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offer_amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'], default: 'pending' },
    counter_amount: { type: Number, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at' } }
);

offerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Offer', offerSchema);
