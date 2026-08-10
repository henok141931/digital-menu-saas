import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    brandColor: {
      type: String,
      default: '#3b82f6', // Default blue
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    secondaryColor: {
      type: String,
      default: '#1e40af', // Default darker blue
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    paymentMethods: [
      {
        name: { type: String, required: true },
        accountNumber: { type: String, required: true }
      }
    ],
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      telegram: { type: String, default: '' },
      tiktok: { type: String, default: '' }
    },
    slug: {
      type: String,
      required: [true, 'URL slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Speeds up QR code menu searches
    },
    description: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'ETB',
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt dates
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;