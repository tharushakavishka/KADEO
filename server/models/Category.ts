import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    iconName: { type: String },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);
