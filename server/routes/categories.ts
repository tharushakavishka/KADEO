import { Router, Request, Response } from 'express';
import { CategoryModel } from '../models/Category';
import { optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth';
import { INITIAL_CATEGORIES } from '../../src/data/initialData';
import mongoose from 'mongoose';

export const categoriesRouter = Router();

// GET /api/categories — Public list of categories
categoriesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    let categories = await CategoryModel.find().lean();
    if (!categories || categories.length === 0) {
      // Auto-seed if database collection is empty
      try {
        await CategoryModel.insertMany(INITIAL_CATEGORIES);
        categories = await CategoryModel.find().lean();
      } catch (seedErr) {
        // Fallback to in-memory initial categories if database insert is busy
        return res.json(INITIAL_CATEGORIES);
      }
    }
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories — Create category (Seller or Admin)
categoriesRouter.post('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `cat-${Date.now()}`;
    }
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    const created = await CategoryModel.create(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id — Update category (Seller or Admin)
categoriesRouter.put('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const query: any = { $or: [{ id }, { slug: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }

    const updated = await CategoryModel.findOneAndUpdate(
      query,
      { $set: req.body },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — Delete category (Seller or Admin)
categoriesRouter.delete('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const query: any = { $or: [{ id }, { slug: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }

    const deleted = await CategoryModel.findOneAndDelete(query).lean();
    res.json({ success: true, message: 'Category deleted successfully', deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
