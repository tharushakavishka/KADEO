import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Shop, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, shop: Shop, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: (shopId?: string) => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toast: { message: string; shopName: string } | null;
  dismissToast: () => void;
  itemsByShop: Record<string, { shop: Shop; items: CartItem[]; subtotal: number }>;
}

const CART_STORAGE_KEY = 'kadeo_cart_items_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; shopName: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart to localStorage', err);
    }
  }, [items]);

  const dismissToast = () => setToast(null);

  const addItem = (product: Product, shop: Shop, quantity: number = 1): boolean => {
    if (product.stockQuantity <= 0) return false;

    let success = true;
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.product.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(product.stockQuantity, currentQty + quantity);

        if (newQty === currentQty) {
          success = false;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const qtyToAdd = Math.min(product.stockQuantity, Math.max(1, quantity));
        return [...prevItems, { product, shop, quantity: qtyToAdd }];
      }
    });

    if (success) {
      setToast({
        message: `Added "${product.name}" to cart`,
        shopName: shop.name,
      });
      setTimeout(() => {
        setToast(prev => (prev?.message.includes(product.name) ? null : prev));
      }, 3500);
    }

    return success;
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(item.product.stockQuantity, quantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = (shopId?: string) => {
    if (shopId) {
      setItems(prev => prev.filter(i => i.shop.id !== shopId));
    } else {
      setItems([]);
    }
  };

  const validItems = items.filter(
    item => Boolean(item && item.product && item.product.id && item.shop && item.shop.id)
  );
  const totalItems = validItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = validItems.reduce(
    (sum, item) => sum + (item.product.price || 0) * (item.quantity || 1),
    0
  );

  // Group items by shop for structured checkout with robust null-safety
  const itemsByShop = validItems.reduce((acc, item) => {
    const sId = item.shop.id;
    if (!acc[sId]) {
      acc[sId] = {
        shop: item.shop,
        items: [],
        subtotal: 0,
      };
    }
    acc[sId].items.push(item);
    acc[sId].subtotal += (item.product.price || 0) * (item.quantity || 1);
    return acc;
  }, {} as Record<string, { shop: Shop; items: CartItem[]; subtotal: number }>);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        toast,
        dismissToast,
        itemsByShop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
