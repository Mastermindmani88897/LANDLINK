const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    reviewer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, default: null },
    verified_buyer: { type: Boolean, default: false },
    verified_seller: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Review', reviewSchema);
