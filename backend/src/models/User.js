const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true, trim: true },
    role: { type: String, default: 'user' },
    phone_number: { type: String, default: null },
    whatsapp_number: { type: String, default: null },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    profile_image_url: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.name = ret.full_name;
    ret.phone = ret.phone_number;
    ret.profileImage = ret.profile_image_url;
    delete ret._id;
    delete ret.__v;
    delete ret.password_hash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
