import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      label: 'Shop',
      path: '/search',
      icon: ShoppingBag,
      isActive:
        location.pathname.startsWith('/search') ||
        location.pathname.startsWith('/categories') ||
        location.pathname.startsWith('/category'),
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingCart,
      badge: totalItems,
      isActive: location.pathname === '/cart',
      onClick: (e: React.MouseEvent) => {
        // Can open cart drawer or let it navigate
      },
    },
    {
      label: 'Account',
      path: '/account',
      icon: User,
      isActive:
        location.pathname.startsWith('/account') ||
        location.pathname.startsWith('/seller') ||
        location.pathname.startsWith('/track-order'),
    },
  ];

  // Hide bottom nav on admin portal, seller dashboard, or fullscreen editors
  if (
    location.pathname.startsWith('/admin') ||
    (location.pathname.startsWith('/seller') && !location.pathname.includes('/login') && !location.pathname.includes('/register'))
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1.5 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[64px] rounded-xl transition-all cursor-pointer ${
                active
                  ? 'text-[#10B981] font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    active ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold text-white shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
