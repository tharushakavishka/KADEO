import { Router, Request, Response } from 'express';
import { ShopModel } from '../models/Shop';
import { authenticateToken, requireSeller, AuthenticatedRequest } from '../middleware/auth';

export const shopsRouter = Router();

// GET /api/shops — Public list of shops
shopsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const shops = await ShopModel.find().lean();
    res.json(shops);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:identifier — Public shop details by slug or ID
shopsRouter.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const shop = await ShopModel.findOne({
      $or: [{ slug: identifier }, { id: identifier }],
    }).lean();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    res.json(shop);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shops — Create new shop
shopsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const shopData = req.body;
    if (!shopData.id) {
      shopData.id = `shop-${Date.now()}`;
    }
    const newShop = await ShopModel.create(shopData);
    res.status(201).json(newShop);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shops/:identifier — Update shop (Only Shop Owner or Admin)
shopsRouter.put('/:identifier', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { identifier } = req.params;
    const shop = await ShopModel.findOne({
      $or: [{ id: identifier }, { slug: identifier }],
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Ownership check: seller must own this shop, or be admin
    if (req.user!.role !== 'admin' && req.user!.shopId !== shop.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own shop settings.' });
    }

    const updated = await ShopModel.findOneAndUpdate(
      { id: shop.id },
      { $set: req.body },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
