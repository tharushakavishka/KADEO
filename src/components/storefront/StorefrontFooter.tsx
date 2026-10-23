import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MapPin,
  Clock,
  Phone,
  ArrowUp,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Shop } from '../../types';
import { StorageService } from '../../services/storageService';

interface StorefrontFooterProps {
  shop: Shop;
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ shop }) => {
  const cleanPhone = StorageService.formatWhatsAppNumber(shop.whatsappNumber || '94771234567');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${shop.name}! 👋 I am contacting you from your online store.`
  )}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111827] text-neutral-300 font-sans border-t border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Boutique Brand & Contact */}
          <div className="lg:col-span-5 space-y-4">
            <Link to={`/shop/${shop.slug}`} className="flex items-center gap-3">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="h-10 w-10 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981]">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
              <div>
                <span className="text-lg font-bold text-white block leading-tight">
                  {shop.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold block">
                  {shop.themeId === 'beauty' ? 'BEAUTY & SALON' : 'BOUTIQUE ATELIER'}
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {shop.description || 'Handcrafted creations tailored for elegance, timeless comfort, and authentic quality.'}
            </p>

            <div className="space-y-2 text-xs text-neutral-400 pt-1">
              {shop.contactDetails?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{shop.contactDetails.address}, {shop.contactDetails.city}</span>
                </div>
              )}
              {shop.displayPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>{shop.displayPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Store Links</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <Link to={`/shop/${shop.slug}`} className="hover:text-white transition-colors">
                  Storefront Home
                </Link>
              </li>
              <li>
                <a href={`/shop/${shop.slug}#products`} className="hover:text-white transition-colors">
                  Product Catalog
                </a>
              </li>
              <li>
                <Link to={`/track-order?shop=${shop.slug}`} className="hover:text-[#10B981] transition-colors inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#10B981] transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </li>
              <li>
                <Link to="/seller/login" className="hover:text-white transition-colors">
                  Seller Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Assurance</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <span className="text-neutral-400">
                  {shop.contactDetails?.deliveryCoverage || 'Islandwide Delivery (1-3 Business Days)'}
                </span>
              </li>
              <li>
                <span className="text-neutral-400">Secure Direct Payments: Bank Transfer & COD</span>
              </li>
              <li>
                <span className="text-neutral-400">Customer Support Monitored Daily</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl border border-neutral-700 hover:border-neutral-500 transition-colors"
              >
                <span>← Return to Kadeo Marketplace</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-neutral-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© 2026 {shop.name}. All rights reserved. Powered by Kadeo.</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="h-8 w-8 rounded-full bg-neutral-800 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
