import bcrypt from 'bcryptjs';
import { UserModel } from './models/User';
import { ShopModel } from './models/Shop';
import { ProductModel } from './models/Product';
import { CategoryModel } from './models/Category';
import { INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_SHOPS, INITIAL_PRODUCTS } from '../src/data/initialData';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial users...');
      const usersWithHashedPasswords = INITIAL_USERS.map(u => ({
        ...u,
        password: bcrypt.hashSync(u.role === 'admin' ? 'admin1234' : 'seller1234', 10),
      }));
      await UserModel.insertMany(usersWithHashedPasswords);
    } else {
      // Ensure existing seeded users have secure bcrypt passwords set
      const adminPass = bcrypt.hashSync('admin1234', 10);
      const sellerPass = bcrypt.hashSync('seller1234', 10);

      await UserModel.updateOne(
        { role: 'admin', $or: [{ password: { $exists: false } }, { password: '' }] },
        { $set: { password: adminPass } }
      );

      await UserModel.updateMany(
        { role: 'seller', $or: [{ password: { $exists: false } }, { password: '' }] },
        { $set: { password: sellerPass } }
      );
    }

    const shopCount = await ShopModel.countDocuments();
    if (shopCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial shops...');
      await ShopModel.insertMany(INITIAL_SHOPS);
    }

    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial categories...');
      await CategoryModel.insertMany(INITIAL_CATEGORIES);
    }

    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial products...');
      const prodsWithStock = INITIAL_PRODUCTS.map(p => ({
        ...p,
        stock: p.stockQuantity,
      }));
      await ProductModel.insertMany(prodsWithStock);
    } else {
      // Fix any products where stockQuantity was zeroed out due to schema discrepancy
      for (const initialProd of INITIAL_PRODUCTS) {
        await ProductModel.updateOne(
          { id: initialProd.id, $or: [{ stockQuantity: { $exists: false } }, { stockQuantity: 0 }] },
          {
            $set: {
              stockQuantity: initialProd.stockQuantity,
              stock: initialProd.stockQuantity,
              featured: initialProd.featured ?? false,
              isFeatured: initialProd.featured ?? false,
            },
          }
        );
      }
    }
  } catch (err: any) {
    console.warn('⚠️ [MongoDB Atlas] Seed check completed with notice:', err.message);
  }
};
