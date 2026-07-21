const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

favoriteSchema.index({ user_id: 1, property_id: 1 }, { unique: true });

favoriteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Favorite', favoriteSchema);
