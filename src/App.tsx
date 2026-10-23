import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { StorageService } from './services/storageService';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SplashScreen } from './components/common/SplashScreen';
import { NavigationProgress } from './components/common/NavigationProgress';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SearchPage } from './pages/public/SearchPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { ShopPage } from './pages/public/ShopPage';
import { ProductDetailsPage } from './pages/public/ProductDetailsPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { OrderSuccessPage } from './pages/public/OrderSuccessPage';
import { AccountPage } from './pages/public/AccountPage';
import { TrackOrderPage } from './pages/public/TrackOrderPage';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Seller Pages & Layout
import { SellerLayout } from './components/seller/SellerLayout';
import { SellerLoginPage } from './pages/seller/SellerLoginPage';
import { SellerRegisterPage } from './pages/seller/SellerRegisterPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerCategoriesPage } from './pages/seller/SellerCategoriesPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { SellerCustomersPage } from './pages/seller/SellerCustomersPage';
import { SellerShopDesignPage } from './pages/seller/SellerShopDesignPage';
import { SellerCustomizePage } from './pages/seller/SellerCustomizePage';
import { SellerSubscriptionPage } from './pages/seller/SellerSubscriptionPage';
import { SellerSettingsPage } from './pages/seller/SellerSettingsPage';
import { SellerStoragePage } from './pages/seller/SellerStoragePage';

// Admin Pages & Layout
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import { Check, X } from 'lucide-react';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SellerProtectedRoute, AdminProtectedRoute } from './components/auth/ProtectedRoute';
import { useActiveStorefront } from './hooks/useActiveStorefront';
import { StorefrontNavbar } from './components/storefront/StorefrontNavbar';
import { StorefrontFooter } from './components/storefront/StorefrontFooter';

// Wrapper to render Public Header/Footer only on marketplace routes
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();
  const location = useLocation();
  const activeStorefront = useActiveStorefront();

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 relative ${isDark ? 'bg-transparent text-white' : 'bg-transparent text-neutral-900'}`}>
      {activeStorefront ? (
        <StorefrontNavbar shop={activeStorefront} />
      ) : (
        <Header />
      )}
      <main key={location.pathname} className="flex-1 pb-16 md:pb-0 page-transition outline-none">
        {children}
      </main>
      {activeStorefront ? (
        <StorefrontFooter shop={activeStorefront} />
      ) : (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
};

// Global Toast Banner
const GlobalToast: React.FC = () => {
  const { toast, dismissToast, setIsCartOpen } = useCart();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border border-neutral-800 bg-[#0F0F11]/95 backdrop-blur-md px-5 py-3.5 text-xs text-white shadow-luxury-xl anim-slide-bottom">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 font-bold shrink-0 shadow-xs">
        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
      </div>
      <div>
        <p className="font-bold text-white tracking-tight">{toast.message}</p>
        <p className="text-[11px] text-neutral-400">Sold directly by {toast.shopName}</p>
      </div>
      <button
        onClick={() => {
          dismissToast();
          setIsCartOpen(true);
        }}
        className="ml-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#0F0F11] hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
      >
        View Bag
      </button>
      <button
        onClick={dismissToast}
        className="ml-1 text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    StorageService.syncWithDatabase().finally(() => {
      setIsAppLoading(false);
    });
  }, []);

  return (
    <>
      <SplashScreen isLoading={isAppLoading} />
      <BrowserRouter>
        <NavigationProgress />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <GlobalToast />
              <CartDrawer />

          <Routes>
            {/* PUBLIC MARKETPLACE ROUTES */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/search"
              element={
                <PublicLayout>
                  <SearchPage />
                </PublicLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <PublicLayout>
                  <CategoriesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <PublicLayout>
                  <SearchPage />
                </PublicLayout>
              }
            />
            <Route path="/shop/:slug" element={<ShopPage />} />
            <Route
              path="/shop/:slug/product/:productSlug"
              element={
                <PublicLayout>
                  <ProductDetailsPage />
                </PublicLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <PublicLayout>
                  <CartPage />
                </PublicLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <PublicLayout>
                  <CheckoutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/order-success/:orderCode"
              element={
                <PublicLayout>
                  <OrderSuccessPage />
                </PublicLayout>
              }
            />
            <Route
              path="/account"
              element={
                <PublicLayout>
                  <AccountPage />
                </PublicLayout>
              }
            />
            <Route
              path="/track-order"
              element={
                <PublicLayout>
                  <TrackOrderPage />
                </PublicLayout>
              }
            />

            {/* SELLER AUTH ROUTES */}
            <Route path="/seller/login" element={<SellerLoginPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />

            {/* SELLER DASHBOARD ROUTE GROUP */}
            <Route
              path="/seller"
              element={
                <SellerProtectedRoute>
                  <SellerLayout />
                </SellerProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/seller/dashboard" replace />} />
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/new" element={<SellerProductsPage />} />
              <Route path="products/:id/edit" element={<SellerProductsPage />} />
              <Route path="categories" element={<SellerCategoriesPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="orders/:id" element={<SellerOrdersPage />} />
              <Route path="customers" element={<SellerCustomersPage />} />
              <Route path="customize" element={<SellerCustomizePage />} />
              <Route path="shop-design" element={<SellerShopDesignPage />} />
              <Route path="subscription" element={<SellerSubscriptionPage />} />
              <Route path="storage" element={<SellerStoragePage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="sellers" element={<AdminSellersPage />} />
              <Route path="shops" element={<AdminSellersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  </>
  );
}

export default App;
