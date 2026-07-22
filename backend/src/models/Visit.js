const mongoose = require('mongoose');
const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visit_date: { type: Date, required: true },
    time_slot: { type: String, default: '10:00 AM - 11:00 AM' },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'declined'],
      default: 'pending',
    },
    notes: { type: String, default: null },
    seller_reply: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

visitSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.property_id?._id) ret.property_id = ret.property_id.toJSON ? ret.property_id.toJSON() : ret.property_id;
    if (ret.buyer_id?._id) ret.buyer_id = ret.buyer_id.toJSON ? ret.buyer_id.toJSON() : ret.buyer_id;
    if (ret.owner_id?._id) ret.owner_id = ret.owner_id.toJSON ? ret.owner_id.toJSON() : ret.owner_id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ScheduledVisit', visitSchema);
