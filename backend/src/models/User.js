const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // password_hash is optional for Google-only accounts
    password_hash: { type: String, default: null },
    full_name: { type: String, required: true, trim: true },
    role: { type: String, default: 'user' },
    phone_number: { type: String, default: null },
    whatsapp_number: { type: String, default: null },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    profile_image_url: { type: String, default: null },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    // Google OAuth fields
    google_id: { type: String, default: null, sparse: true },
    auth_provider: { type: String, enum: ['local', 'google', 'both'], default: 'local' },
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
    // Expose auth provider info
    ret.authProvider = ret.auth_provider;
    delete ret._id;
    delete ret.__v;
    delete ret.password_hash;
    delete ret.google_id; // keep google_id private
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
