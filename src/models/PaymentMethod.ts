import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'bank_wire'],
    required: true
  },
  cardNumber: {
    type: String,
    // Only store last 4 digits for security
    maxlength: 4
  },
  cardExpiry: String,
  cardHolderName: String,
  bankName: String,
  accountNumber: String,
  routingNumber: String,
  accountHolderName: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);
    await PaymentMethod.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema); 