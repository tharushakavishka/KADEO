import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { authenticateToken, requireSeller, AuthenticatedRequest } from '../middleware/auth';

export const productsRouter = Router();

// GET /api/products — Public product catalog (filter by shopId, categoryId, status)
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { shopId, categoryId, status } = req.query;
    const filter: Record<string, any> = {};

    if (shopId) filter.shopId = shopId;
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;

    const products = await ProductModel.find(filter).lean();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — Public single product by ID or Slug
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findOne({
      $or: [{ id }, { slug: id }],
    }).lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — Create product (Seller owns shop or Admin)
productsRouter.post('/', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `prod-${Date.now()}`;
    }

    // Ownership check: seller can only create products for their own shop
    if (req.user!.role !== 'admin' && req.user!.shopId !== data.shopId) {
      return res.status(403).json({ error: 'Forbidden: You can only create products for your own shop.' });
    }

    // Synchronize stock and stockQuantity
    if (data.stockQuantity !== undefined && data.stock === undefined) {
      data.stock = data.stockQuantity;
    }

    const created = await ProductModel.create(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — Update product (Seller owns shop or Admin)
productsRouter.put('/:id', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findOne({ id });

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (req.user!.role !== 'admin' && req.user!.shopId !== existing.shopId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit products belonging to your shop.' });
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    if (updates.stockQuantity !== undefined) {
      updates.stock = updates.stockQuantity;
    }

    const updated = await ProductModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — Delete product (Seller owns shop or Admin)
productsRouter.delete('/:id', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findOne({ id });

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (req.user!.role !== 'admin' && req.user!.shopId !== existing.shopId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete products belonging to your shop.' });
    }

    await ProductModel.findOneAndDelete({ id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
