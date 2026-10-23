import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDocument extends Document {
  id: string;
  orderCode: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerCity: string;
  customerNote?: string;
  items: Array<{
    id: string;
    productId: string;
    productNameSnapshot: string;
    unitPriceSnapshot: number;
    quantity: number;
    lineTotal: number;
    imageSnapshot: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentSlipUrl?: string;
  paymentSlipUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true },
    productNameSnapshot: { type: String, required: true },
    unitPriceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    imageSnapshot: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderCode: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true },
    customerCity: { type: String, required: true },
    customerNote: { type: String, default: '' },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'cod' },
    paymentSlipUrl: { type: String, default: '' },
    paymentSlipUploadedAt: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
