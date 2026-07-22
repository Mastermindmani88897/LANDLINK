const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requested_date: { type: Date, required: true },
    time_slot: { type: String, required: true },
    message: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    rejection_reason: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.requestId = ret.id;
    ret.propertyId = ret.property_id;
    ret.buyerId = ret.buyer_id;
    ret.ownerId = ret.owner_id;
    ret.requestedDate = ret.requested_date;
    ret.requestedTimeSlot = ret.time_slot;
    ret.rejectionReason = ret.rejection_reason;

    if (ret.property_id && typeof ret.property_id === 'object') {
      ret.propertyTitle = ret.property_id.title;
      ret.propertyImage = (ret.property_id.images && ret.property_id.images[0]) || ret.property_id.image_url;
    }
    if (ret.buyer_id && typeof ret.buyer_id === 'object') {
      ret.buyerName = ret.buyer_id.full_name || ret.buyer_id.name || 'Interested Buyer';
      ret.buyerEmail = ret.buyer_id.email;
      ret.buyerPhone = ret.buyer_id.phone_number || ret.buyer_id.phone;
    }
    if (ret.owner_id && typeof ret.owner_id === 'object') {
      ret.ownerName = ret.owner_id.full_name || ret.owner_id.name || 'Property Owner';
      ret.ownerEmail = ret.owner_id.email;
      ret.ownerPhone = ret.owner_id.phone_number || ret.owner_id.phone;
    }

    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
