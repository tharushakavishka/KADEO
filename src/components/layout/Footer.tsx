import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { KadeoLogo } from '../common/KadeoLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111827] text-neutral-300 font-sans border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center group">
              <KadeoLogo size="md" theme="dark" />
            </Link>

            <p className="text-xs text-neutral-400 font-medium">
              Your Shop. Your Customers. Your Growth.
            </p>

            {/* Social Icons (Facebook, Instagram, TikTok, YouTube) */}
            <div className="flex items-center gap-3 pt-2 text-neutral-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                ig
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                tt
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                yt
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h4 className="font-bold text-white text-[13px]">Quick Links</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/search?tab=sellers" className="hover:text-white transition-colors">
                  Sellers
                </Link>
              </li>
              <li>
                <Link to="/search?tab=about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-white text-[13px]">Customer Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Join Our Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-[13px]">Join Our Newsletter</h4>
            <p className="text-xs text-neutral-400">
              Get the latest deals and updates.
            </p>

            {subscribed ? (
              <div className="rounded-lg bg-emerald-900/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-[#1F2937] text-white text-xs rounded-lg py-2.5 pl-3.5 pr-24 border border-neutral-700 focus:outline-none focus:border-[#10B981]"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3.5 py-1.5 rounded-md bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© 2026 Kadeo. All rights reserved.</span>
          <span>Made with ❤️ in Sri Lanka</span>
        </div>
      </div>
    </footer>
  );
};
