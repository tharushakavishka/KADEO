"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Store,
  CreditCard,
  Database,
  Cloud,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/features/auth/actions";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Platform Overview",
    href: "/admin",
    icon: LayoutGrid,
    exact: true,
  },
  {
    title: "Merchant Stores",
    href: "/admin/stores",
    icon: Store,
  },
  {
    title: "Subscriptions & Plans",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Store Backups",
    href: "/admin/backups",
    icon: Database,
  },
  {
    title: "Storage & System",
    href: "/admin/analytics",
    icon: Cloud,
  },
  {
    title: "Platform Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const navContent = (
    <div className="relative flex flex-col h-full bg-[#031d16] text-zinc-100 overflow-hidden select-none">
      {/* Decorative organic green wave aura matching mockup */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_0%_30%,#10b981_0%,transparent_50%),radial-gradient(circle_at_100%_80%,#059669_0%,transparent_60%)]" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00c975] flex items-center justify-center font-black text-xl text-[#02281e] shadow-lg shadow-emerald-500/20">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white">KADEO</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/15">
                GOV
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Platform Operations</p>
          </div>
        </div>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-zinc-400/80 uppercase tracking-widest">
          Management
        </div>

        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                active
                  ? "bg-[#00c975] text-[#02281e] shadow-md shadow-emerald-500/25"
                  : "text-zinc-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  active ? "text-[#02281e]" : "text-zinc-400"
                }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Super Admin Profile & Sign Out (No Seller Dashboard) */}
      <div className="relative z-10 p-4 border-t border-white/5 space-y-2 bg-[#021812]/50 backdrop-blur-xs">
        {/* Admin Card */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-extrabold text-amber-300 tracking-wider">
                Super Admin
              </div>
              <div className="text-xs text-zinc-200 font-mono truncate font-medium">
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#031d16] border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00c975] flex items-center justify-center font-black text-sm text-[#02281e]">
            K
          </div>
          <span className="font-extrabold text-sm text-white">KADEO GOV</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10"
          aria-label="Open Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs h-full z-10">{navContent}</div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#08382c] bg-[#031d16] flex-col h-screen sticky top-0 shrink-0 z-30 shadow-xl">
        {navContent}
      </aside>
    </>
  );
}
