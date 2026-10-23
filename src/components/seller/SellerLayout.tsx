import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Calendar,
  Users,
  Megaphone,
  TrendingUp,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Menu,
  X,
  LogOut,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { KadeoLogo } from '../common/KadeoLogo';

export const SellerLayout: React.FC = () => {
  const { currentUser, currentShop, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsible Sidebar State (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kadeo_seller_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Strict Account Isolation: Seller sees only their own boutique
  const activeShop = useMemo(() => {
    if (currentShop) return currentShop;
    if (currentUser?.shopId) {
      return StorageService.getShopById(currentUser.shopId) || null;
    }
    if (currentUser?.role === 'admin') {
      return StorageService.getShops()[0] || null;
    }
    return null;
  }, [currentShop, currentUser]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('kadeo_seller_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const storeName = activeShop?.name || 'My Boutique';
  const storeInitial = storeName.charAt(0).toUpperCase() || 'K';
  const userName = currentUser?.name || storeName;
  const userEmail = currentUser?.email || 'seller@kadeo.lk';
  const userAvatar =
    currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10B981&color=fff`;

  // Real pending orders count for notification badge with live listener
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(() => {
    if (!activeShop) return 0;
    const orders = StorageService.getOrdersByShop(activeShop.id);
    return orders.filter(o => o.status === 'pending').length;
  });

  useEffect(() => {
    const updateCount = () => {
      if (activeShop) {
        const orders = StorageService.getOrdersByShop(activeShop.id);
        setPendingOrdersCount(orders.filter(o => o.status === 'pending').length);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('kadeo_orders_updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('kadeo_orders_updated', updateCount);
    };
  }, [activeShop]);

  // Cloud storage metrics
  const storageUsage = useMemo(() => {
    if (!activeShop) return null;
    return StorageService.getShopStorageUsage(activeShop.id);
  }, [activeShop]);

  const mainNavLinks = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: Home },
    {
      label: 'Orders',
      path: '/seller/orders',
      icon: Calendar,
      badge: pendingOrdersCount,
      hasDot: pendingOrdersCount > 0,
    },
    { label: 'Products', path: '/seller/products', icon: ShoppingBag },
    { label: 'Categories', path: '/seller/categories', icon: Layers },
    { label: 'Customers', path: '/seller/customers', icon: Users },
    { label: 'Customize', path: '/seller/customize', icon: Sparkles },
    { label: 'Marketing', path: '/seller/shop-design', icon: Megaphone },
    {
      label: 'Storage',
      path: '/seller/storage',
      icon: HardDrive,
      badgeText: storageUsage ? `${storageUsage.percentage}%` : undefined,
    },
  ];

  const bottomNavLinks = [
    { label: 'Settings', path: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-transparent text-neutral-900 font-sans antialiased">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. DESKTOP FLOATING SIDEBAR (Fixed in place, never scrolls away)
      ────────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-[#111827] text-white border border-neutral-800/80 shadow-xl rounded-3xl p-3.5 transition-all duration-300 fixed left-3 lg:left-4 top-3 lg:top-4 h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)] z-40 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* TOP SECTION: Boutique Pill & Main Nav */}
        <div className="flex flex-col min-h-0">
          {/* Boutique Brand Pill (Matching ALF Pte. Ltd. pill in dark theme) */}
          <div className="mb-4">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Expand sidebar"
                  className="h-11 w-11 rounded-2xl bg-[#1F2937] hover:bg-neutral-700 border border-neutral-700/70 flex items-center justify-center transition-all group relative cursor-pointer active:scale-95 shadow-2xs"
                >
                  {activeShop?.logo ? (
                    <img
                      src={activeShop.logo}
                      alt={storeName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-neutral-800 text-white font-extrabold text-xs flex items-center justify-center border border-neutral-700">
                      {storeInitial}
                    </span>
                  )}
                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {storeName} (Click to expand)
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#1F2937] border border-neutral-700/70 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {activeShop?.logo ? (
                    <img
                      src={activeShop.logo}
                      alt={storeName}
                      className="h-8 w-8 rounded-full object-cover shrink-0 border border-neutral-600"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-neutral-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-neutral-700 shadow-2xs">
                      {storeInitial}
                    </span>
                  )}
                  <span className="text-xs font-bold text-white truncate">
                    {storeName}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {activeShop && (
                    <Link
                      to={`/shop/${activeShop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Live Storefront"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700/70 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Collapse sidebar"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700/70 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 overflow-y-auto no-scrollbar">
            {mainNavLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              if (isCollapsed) {
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`group relative flex items-center justify-center h-11 w-11 mx-auto rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#10B981] text-white font-semibold shadow-xs'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {link.hasDot && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-[#111827]" />
                    )}
                    {/* Tooltip matching screenshot */}
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {link.label} {link.badgeText ? `(${link.badgeText} used)` : ''}
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#10B981] text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#EF4444] text-white text-[10px] font-bold leading-none shadow-2xs shrink-0">
                      {link.badge}
                    </span>
                  )}
                  {link.badgeText && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[#10B981] text-[10px] font-bold leading-none shrink-0">
                      {link.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mini Storage Indicator in Expanded Sidebar */}
          {!isCollapsed && storageUsage && (
            <Link
              to="/seller/storage"
              className="mt-3 p-3 rounded-2xl bg-[#1F2937]/80 hover:bg-[#1F2937] border border-neutral-700/60 transition-all block group"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-neutral-400 font-semibold group-hover:text-white transition-colors">
                  Cloud Storage
                </span>
                <span className="text-emerald-400 font-bold">{storageUsage.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(storageUsage.percentage, 4)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-medium">
                <span>{storageUsage.usedFormatted} used</span>
                <span>{storageUsage.maxFormatted}</span>
              </div>
            </Link>
          )}
        </div>

        {/* BOTTOM SECTION: Settings, Support & Seller Profile */}
        <div className="pt-2">
          {/* Bottom Nav Links */}
          <div className="space-y-1">
            {bottomNavLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              if (isCollapsed) {
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`group relative flex items-center justify-center h-11 w-11 mx-auto rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#10B981] text-white font-semibold shadow-xs'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {link.label}
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#10B981] text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Support Link (opens modal) */}
            {isCollapsed ? (
              <button
                type="button"
                onClick={() => setSupportModalOpen(true)}
                className="group relative flex items-center justify-center h-11 w-11 mx-auto rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-all cursor-pointer"
              >
                <HelpCircle className="h-4.5 w-4.5 shrink-0" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Support
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSupportModalOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-all cursor-pointer"
              >
                <HelpCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Support</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="my-2.5 border-t border-neutral-800" />

          {/* Seller Profile Row (Matching John Doe row in dark theme) */}
          {isCollapsed ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="group relative flex items-center justify-center cursor-pointer active:scale-95"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-10 w-10 rounded-full object-cover border border-neutral-700 hover:ring-2 hover:ring-[#10B981] transition-all"
                />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {userName} (Log out)
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-neutral-800/60 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-9 w-9 rounded-full object-cover shrink-0 border border-neutral-700"
                />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium truncate leading-tight mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MOBILE DRAWER SIDEBAR (Slides out on mobile in dark theme)
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
        <aside className="fixed inset-y-2 left-2 w-72 bg-[#111827] text-white border border-neutral-800 shadow-2xl rounded-3xl p-4 flex flex-col justify-between z-50">
          <div>
            {/* Mobile Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <KadeoLogo size="sm" theme="dark" />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Boutique Pill */}
            <div className="my-4 p-2 rounded-2xl bg-[#1F2937] border border-neutral-700/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-8 w-8 rounded-full bg-neutral-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-neutral-700">
                  {storeInitial}
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {storeName}
                </span>
              </div>
              {activeShop && (
                <Link
                  to={`/shop/${activeShop.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              {mainNavLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#10B981] text-white font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4.5 w-4.5" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#EF4444] text-white text-[10px] font-bold">
                        {link.badge}
                      </span>
                    )}
                    {link.badgeText && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[#10B981] text-[10px] font-bold">
                        {link.badgeText}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Bottom Profile */}
          <div className="pt-3 border-t border-neutral-800">
            <Link
              to="/seller/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/70 mb-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            <div className="flex items-center justify-between p-2 rounded-2xl bg-[#1F2937] border border-neutral-700/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full object-cover shrink-0 border border-neutral-600"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{userEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MAIN CONTENT AREA WITH TOP BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:pl-26 lg:pl-28' : 'md:pl-70 lg:pl-72'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#F3F4F6]/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          {/* Mobile hamburger & Omnisearch */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-50"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Omnisearch Input */}
            <div className="relative w-64 sm:w-80 lg:w-96 hidden sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, or customers..."
                className="w-full bg-white rounded-xl py-2 pl-9 pr-16 text-xs border border-neutral-300 focus:outline-none focus:border-[#10B981] text-neutral-800 placeholder:text-neutral-400 transition-all shadow-2xs"
              />
              <span className="absolute right-3 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 border border-neutral-200 text-neutral-600">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right: Notifications & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Storefront Link */}
            {activeShop && (
              <Link
                to={`/shop/${activeShop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-[#10B981] font-semibold border border-neutral-300 rounded-xl px-3.5 py-2 bg-white hover:bg-neutral-50 transition-all shadow-2xs"
              >
                <span>Live Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to="/seller/orders"
              className="relative h-9 w-9 rounded-xl border border-neutral-300 flex items-center justify-center text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Bell className="h-4 w-4" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-2xl bg-white border border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-neutral-900 overflow-hidden border border-neutral-200 shrink-0">
                  <img
                    src={activeShop?.logo || userAvatar}
                    alt={storeName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <span className="text-xs font-bold text-neutral-900 block leading-tight">
                    {storeName}
                  </span>
                  <span className="text-[10px] text-neutral-500 block font-medium">
                    Verified Merchant
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 hidden sm:block mr-1" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900">{storeName}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{userEmail}</p>
                  </div>

                  <div className="pt-1">
                    {activeShop && (
                      <Link
                        to={`/shop/${activeShop.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <span className="font-medium">View Live Storefront</span>
                        <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                      </Link>
                    )}
                    <Link
                      to="/seller/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <span className="font-medium">Store Settings</span>
                      <Settings className="h-3.5 w-3.5 text-neutral-400" />
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Page Content */}
        <main
          className={`flex-1 w-full outline-none ${
            location.pathname === '/seller/customize'
              ? 'p-2 sm:p-4 max-w-full'
              : 'p-4 sm:p-8 max-w-7xl mx-auto'
          }`}
        >
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. MERCHANT SUPPORT MODAL (Triggered by (?) Support)
      ────────────────────────────────────────────────────────────────────────── */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Merchant Support Desk</h3>
                  <p className="text-[11px] text-neutral-500">We are here to help your boutique grow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <a
                href="https://wa.me/94715267058?text=Hello%20Kadeo%20Merchant%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900 group-hover:text-emerald-700">WhatsApp Merchant Help</p>
                    <p className="text-[10px] text-neutral-500">+94 71 526 7058 (Fastest Response)</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-emerald-600" />
              </a>

              <a
                href="mailto:support@kadeo.lk"
                className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Official Merchant Email</p>
                    <p className="text-[10px] text-neutral-500">support@kadeo.lk</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
