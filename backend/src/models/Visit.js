const mongoose = require('mongoose');
const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visit_date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'pending' },
    notes: { type: String, default: null },
    seller_reply: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at' } }
);

visitSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ScheduledVisit', visitSchema);
