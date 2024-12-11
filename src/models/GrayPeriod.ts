import mongoose, { Schema, Document } from 'mongoose';

interface IGrayPeriod extends Document {
  grayPeriod: number;
}

const grayPeriodSchema = new Schema<IGrayPeriod>({
  grayPeriod: { type: Number, required: true, default: -1 }, // Default to -1
});

const GrayPeriod = mongoose.models.GrayPeriod || mongoose.model<IGrayPeriod>('GrayPeriod', grayPeriodSchema);

export default GrayPeriod;
