import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shop } from '../types';
import { StorageService } from '../services/storageService';

export const STOREFRONT_STORAGE_KEY = 'kadeo_active_storefront_slug';

export const setActiveStorefrontSlug = (slug: string | null) => {
  if (typeof window === 'undefined') return;
  if (slug) {
    localStorage.setItem(STOREFRONT_STORAGE_KEY, slug);
    sessionStorage.setItem(STOREFRONT_STORAGE_KEY, slug);
  } else {
    localStorage.removeItem(STOREFRONT_STORAGE_KEY);
    sessionStorage.removeItem(STOREFRONT_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent('kadeo_storefront_changed'));
};

export const getSavedStorefrontSlug = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(STOREFRONT_STORAGE_KEY) ||
    localStorage.getItem(STOREFRONT_STORAGE_KEY) ||
    null
  );
};

export function useActiveStorefront(): Shop | undefined {
  const location = useLocation();
  const [shop, setShop] = useState<Shop | undefined>(() => resolveShop(location));

  function resolveShop(loc: typeof location): Shop | undefined {
    const { pathname, search } = loc;

    // Marketplace routes that should ALWAYS show the main marketplace navbar
    if (pathname === '/' || pathname === '/categories' || pathname === '/search') {
      // User explicitly browsed to the marketplace home or global search
      if (typeof window !== 'undefined' && pathname === '/') {
        localStorage.removeItem(STOREFRONT_STORAGE_KEY);
        sessionStorage.removeItem(STOREFRONT_STORAGE_KEY);
      }
      return undefined;
    }

    // Admin & Seller Portal internal dashboards have their own layout
    if (pathname.startsWith('/admin') || (pathname.startsWith('/seller') && !pathname.includes('/login'))) {
      return undefined;
    }

    // 1. Direct Storefront routes: /shop/:slug or /shop/:slug/product/:productSlug
    const shopSlugMatch = pathname.match(/^\/shop\/([^/#?]+)/);
    if (shopSlugMatch && shopSlugMatch[1]) {
      const found = StorageService.getShopBySlug(shopSlugMatch[1]);
      if (found) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STOREFRONT_STORAGE_KEY, found.slug);
          localStorage.setItem(STOREFRONT_STORAGE_KEY, found.slug);
        }
        return found;
      }
    }

    // 2. Track Order Route: /track-order?code=... or ?shop=...
    if (pathname.startsWith('/track-order')) {
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get('code')?.trim();
      const shopParam = searchParams.get('shop')?.trim();

      if (code) {
        const cleanCode = code.toUpperCase();
        const orders = StorageService.getOrders();
        const matchedOrder = orders.find(
          o => o.orderCode.toUpperCase() === cleanCode || o.id.toUpperCase() === cleanCode
        );
        if (matchedOrder && matchedOrder.shopId) {
          const matchedShop = StorageService.getShopById(matchedOrder.shopId);
          if (matchedShop) {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(STOREFRONT_STORAGE_KEY, matchedShop.slug);
              localStorage.setItem(STOREFRONT_STORAGE_KEY, matchedShop.slug);
            }
            return matchedShop;
          }
        }
      }

      if (shopParam) {
        const found = StorageService.getShopBySlug(shopParam);
        if (found) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STOREFRONT_STORAGE_KEY, found.slug);
            localStorage.setItem(STOREFRONT_STORAGE_KEY, found.slug);
          }
          return found;
        }
      }

      // Check previously visited storefront in session
      const savedSlug = getSavedStorefrontSlug();
      if (savedSlug) {
        const found = StorageService.getShopBySlug(savedSlug);
        if (found) return found;
      }
    }

    // 3. Order Success Route: /order-success/:orderCode
    const orderSuccessMatch = pathname.match(/^\/order-success\/([^/#?]+)/);
    if (orderSuccessMatch && orderSuccessMatch[1]) {
      const orderCode = orderSuccessMatch[1].trim().toUpperCase();
      const orders = StorageService.getOrders();
      const matchedOrder = orders.find(
        o => o.orderCode.toUpperCase() === orderCode || o.id.toUpperCase() === orderCode
      );
      if (matchedOrder && matchedOrder.shopId) {
        const matchedShop = StorageService.getShopById(matchedOrder.shopId);
        if (matchedShop) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STOREFRONT_STORAGE_KEY, matchedShop.slug);
            localStorage.setItem(STOREFRONT_STORAGE_KEY, matchedShop.slug);
          }
          return matchedShop;
        }
      }
    }

    // 4. Cart or Checkout routes: Check saved active storefront
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
      const savedSlug = getSavedStorefrontSlug();
      if (savedSlug) {
        const found = StorageService.getShopBySlug(savedSlug);
        if (found) return found;
      }
    }

    return undefined;
  }

  useEffect(() => {
    const handleUpdate = () => {
      setShop(resolveShop(location));
    };

    handleUpdate();

    window.addEventListener('kadeo_storefront_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kadeo_storefront_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [location]);

  return shop;
}
