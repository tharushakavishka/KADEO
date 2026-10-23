import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Package,
  Layers,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sellers & Boutiques', path: '/admin/sellers', icon: Users },
    { label: 'Product Moderation', path: '/admin/products', icon: Package },
    { label: 'Marketplace Categories', path: '/admin/categories', icon: Layers },
    { label: 'Subscriptions & Tiers', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Platform Governance', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#0F0F11] text-white px-4 py-3 sticky top-0 z-30 shadow-luxury-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-wider">KADEO PLATFORM</span>
        </div>
        <Link to="/" className="text-xs text-neutral-400 hover:text-white">
          Marketplace →
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F0F11] text-white flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-neutral-800/80 pb-5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold tracking-tight">KADEO</span>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-bold border border-neutral-700">
                GOVERNANCE
              </span>
            </div>
            <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              Platform administration, seller approvals & catalog moderation.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            {navLinks.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-luxury-xs border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer controls */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <span>Back to Marketplace</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <Link
              to="/seller/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <span>Switch to Seller View</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto outline-none">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
