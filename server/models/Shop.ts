import mongoose, { Schema, Document } from 'mongoose';

export interface IShopDocument extends Document {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  coverVideo?: string;
  coverMediaType?: 'image' | 'video';
  whatsappNumber: string;
  displayPhone: string;
  contactDetails: {
    email: string;
    address: string;
    city: string;
    instagram?: string;
    deliveryCoverage?: string;
  };
  themeId: 'minimal' | 'beauty' | 'modern';
  heroBanner?: Record<string, any>;
  status: 'active' | 'suspended';
  createdAt: string;
  subscriptionPlanId: 'free' | 'starter' | 'pro';
}

const ShopSchema = new Schema<IShopDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    coverVideo: { type: String },
    coverMediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    whatsappNumber: { type: String, default: '' },
    displayPhone: { type: String, default: '' },
    contactDetails: {
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      instagram: { type: String, default: '' },
      deliveryCoverage: { type: String, default: '' },
    },
    themeId: { type: String, enum: ['minimal', 'beauty', 'modern'], default: 'minimal' },
    heroBanner: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    subscriptionPlanId: { type: String, enum: ['free', 'starter', 'pro'], default: 'starter' },
  },
  {
    timestamps: true,
  }
);

export const ShopModel = mongoose.models.Shop || mongoose.model<IShopDocument>('Shop', ShopSchema);
