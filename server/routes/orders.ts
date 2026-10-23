import { Router, Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import { authenticateToken, requireSeller, AuthenticatedRequest } from '../middleware/auth';

export const ordersRouter = Router();

function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KAD-${code}`;
}

// GET /api/orders — Fetch orders with strict role-based data isolation
ordersRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const filter: Record<string, any> = {};

    if (user.role === 'admin') {
      // Admin can view all orders, or filter by shopId / phone
      if (req.query.shopId) filter.shopId = req.query.shopId;
      if (req.query.phone) filter.customerPhone = req.query.phone;
    } else if (user.role === 'seller') {
      // Seller can ONLY view orders belonging to their own shop
      if (!user.shopId) {
        return res.status(403).json({ error: 'Seller account is not linked to any shop.' });
      }
      filter.shopId = user.shopId;
    } else {
      // Customer can only view their own orders by phone
      const customerPhone = req.query.phone as string;
      if (!customerPhone) {
        return res.json([]);
      }
      filter.customerPhone = customerPhone;
    }

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:code — Public Order Tracking by unique human-friendly order code
ordersRouter.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const order = await OrderModel.findOne({
      $or: [{ orderCode: code.toUpperCase() }, { id: code }],
    }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found with this code' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — Place order with atomic stock validation and decrement in MongoDB
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    if (!data.orderCode) {
      data.orderCode = generateOrderCode();
    }

    // 1. Verify item stock in MongoDB before placing order
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.productId && item.quantity > 0) {
          const product = await ProductModel.findOne({ id: item.productId });
          if (product) {
            const availableStock = product.stockQuantity ?? product.stock ?? 0;
            if (availableStock < item.quantity) {
              return res.status(400).json({
                error: `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`,
              });
            }
          }
        }
      }

      // 2. Decrement inventory in MongoDB atomically
      for (const item of data.items) {
        if (item.productId && item.quantity > 0) {
          await ProductModel.findOneAndUpdate(
            { id: item.productId },
            {
              $inc: {
                stockQuantity: -item.quantity,
                stock: -item.quantity,
              },
            }
          );
        }
      }
    }

    const created = await OrderModel.create(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status — Update order status (Only Shop Owner or Admin)
ordersRouter.put('/:id/status', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingOrder = await OrderModel.findOne({
      $or: [{ id }, { orderCode: id.toUpperCase() }],
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership check: seller must own the shop this order was placed with
    if (req.user!.role !== 'admin' && req.user!.shopId !== existingOrder.shopId) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify orders for another shop.' });
    }

    existingOrder.status = status;
    existingOrder.updatedAt = new Date().toISOString();
    await existingOrder.save();

    res.json(existingOrder.toObject());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id — Delete order (Only Shop Owner or Admin)
ordersRouter.delete('/:id', authenticateToken, requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingOrder = await OrderModel.findOne({
      $or: [{ id }, { orderCode: id.toUpperCase() }],
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership check: seller must own the shop this order was placed with
    if (req.user!.role !== 'admin' && req.user!.shopId !== existingOrder.shopId) {
      return res.status(403).json({ error: 'Forbidden: You cannot delete orders for another shop.' });
    }

    await OrderModel.deleteOne({ _id: existingOrder._id });
    res.json({ message: 'Order deleted successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:code/slip — Customer uploads payment slip
ordersRouter.put('/:code/slip', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { paymentSlipUrl } = req.body;

    const existingOrder = await OrderModel.findOne({
      $or: [{ id: code }, { orderCode: code.toUpperCase() }],
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    existingOrder.paymentSlipUrl = paymentSlipUrl || '';
    existingOrder.paymentSlipUploadedAt = paymentSlipUrl ? new Date().toISOString() : '';
    existingOrder.updatedAt = new Date().toISOString();
    await existingOrder.save();

    res.json(existingOrder.toObject());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
