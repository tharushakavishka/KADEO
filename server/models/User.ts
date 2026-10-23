import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'seller' | 'admin' | 'customer';
  status: 'active' | 'suspended';
  shopId?: string;
  avatar?: string;
  createdAt: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['seller', 'admin', 'customer'], default: 'customer' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    shopId: { type: String },
    avatar: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
