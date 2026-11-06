"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Monitor,
  Settings,
  Crown,
  ExternalLink,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import s from "./DashboardShell.module.css";

interface SidebarProps {
  shopSlug?: string;
  shopName?: string;
  userEmail?: string;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Sales Desk", href: "/dashboard/pos", icon: BarChart3 },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Categories", href: "/dashboard/categories", icon: Layers },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Store Design", href: "/dashboard/design", icon: Monitor },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Subscription", href: "/dashboard/subscription", icon: Crown },
];

export function Sidebar({ shopSlug, shopName }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={s.sidebar}
      data-open={open}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.currentTarget
            .querySelector<HTMLButtonElement>(
              'button[aria-controls="seller-navigation"]'
            )
            ?.focus();
        }
      }}
    >
      {/* 3D Luminous Emerald Glowing Wave Trails */}
      <div className={s.sidebarRibbonTop} aria-hidden="true">
        <svg
          viewBox="0 0 280 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M280 20 C220 50, 160 105, 280 145"
            stroke="#10b981"
            strokeWidth="16"
            opacity="0.3"
            filter="blur(12px)"
          />
          <path
            d="M280 20 C220 50, 160 105, 280 145"
            stroke="#34d399"
            strokeWidth="3.5"
            opacity="0.8"
          />
          <path
            d="M280 26 C235 55, 185 105, 280 135"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            opacity="0.9"
          />
        </svg>
      </div>

      <div className={s.sidebarRibbonBottom} aria-hidden="true">
        <svg
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M-20 170 C60 125, 160 115, 280 195"
            stroke="#10b981"
            strokeWidth="20"
            opacity="0.35"
            filter="blur(14px)"
          />
          <path
            d="M-20 170 C60 125, 160 115, 280 195"
            stroke="#34d399"
            strokeWidth="4"
            opacity="0.85"
          />
          <path
            d="M-5 180 C70 135, 170 125, 270 205"
            stroke="#a7f3d0"
            strokeWidth="1.8"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Brand Header */}
      <div className={s.mobileTop}>
        <Link
          href="/dashboard"
          className={s.brand}
          aria-label="Kadeo seller workspace"
        >
          <span className={s.brandMark}>K</span>
          <div className={s.brandText}>
            <strong>KADEO</strong>
            <small>Seller Workspace</small>
          </div>
        </Link>
        <button
          type="button"
          className={s.menu}
          aria-expanded={open}
          aria-controls="seller-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Store Switcher Card */}
      <div className={s.store}>
        <div className={s.storeIcon}>
          <img
            src="/images/store-avatar-3d.png"
            alt="Store storefront"
            className="w-full h-full object-cover"
          />
        </div>
        <div className={s.storeInfo}>
          <strong>{shopName || "Amarasri Hearath"}</strong>
          {shopSlug ? (
            <Link
              href={`/shop/${shopSlug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Visit your storefront</span>
              <ExternalLink size={11} />
            </Link>
          ) : (
            <span className="text-[11px] text-emerald-300">Active store</span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav
        id="seller-navigation"
        className={s.nav}
        aria-label="Seller dashboard"
      >
        <span className={s.navLabel}>WORKSPACE</span>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Grow Your Store Card */}
      <div className={s.upgradeCard}>
        <div className={s.upgradeTop}>
          <Crown size={18} className={s.upgradeCrown} />
          <span>Grow Your Store</span>
        </div>
        <p className={s.upgradeDesc}>
          Upgrade your plan and unlock more features.
        </p>
        <Link href="/dashboard/subscription" className={s.upgradeBtn}>
          <span>Upgrade Now</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </aside>
  );
}
