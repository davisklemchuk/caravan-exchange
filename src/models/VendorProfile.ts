import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  inventory: [{
    currency: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    markup: {
      type: Number,
      required: true,
      default: 0,  // 0 means no markup, 0.05 means 5% markup
      min: -0.5,   // Allow up to 50% discount
      max: 0.5     // Allow up to 50% markup
    }
  }],
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

vendorProfileSchema.index({ userId: 1, 'inventory.currency': 1 }, { unique: true });

export default mongoose.models.VendorProfile || mongoose.model('VendorProfile', vendorProfileSchema); 