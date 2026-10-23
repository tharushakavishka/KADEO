import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDocument extends Document {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: string[];
  stockQuantity: number;
  stock?: number;
  sku: string;
  status: 'draft' | 'active' | 'archived';
  featured?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  variants?: Array<{
    id: string;
    name: string;
    options: string[];
    priceModifier: number;
    stock: number;
    sku?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const VariantSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    options: { type: [String], default: [] },
    priceModifier: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    images: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    featured: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

// Ensure stockQuantity and stock are kept in sync on save
ProductSchema.pre('save', function () {
  if (this.stockQuantity !== undefined && (this.stock === undefined || this.stock === 0)) {
    this.stock = this.stockQuantity;
  } else if (this.stock !== undefined && (this.stockQuantity === undefined || this.stockQuantity === 0)) {
    this.stockQuantity = this.stock;
  }
  if (this.featured !== undefined && this.isFeatured === undefined) {
    this.isFeatured = this.featured;
  }
});

export const ProductModel = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
