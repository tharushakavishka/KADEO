"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Monitor,
  Settings,
  Crown,
  Home,
  Store,
  Clock,
  ArrowRight,
  X,
  Command,
} from "lucide-react";
import s from "./DashboardSearchBar.module.css";

interface SearchBarProps {
  shopSlug?: string;
}

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: "quick" | "navigation";
  keywords?: string[];
}

export function DashboardSearchBar({ shopSlug }: SearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseItems: SearchItem[] = [
    {
      id: "add-product",
      title: "Add New Product",
      description: "Create a new catalog item",
      href: "/dashboard/products/new",
      icon: Plus,
      category: "quick",
      keywords: ["create", "item", "inventory", "stock", "new"],
    },
    {
      id: "pending-orders",
      title: "Pending Orders",
      description: "Review incoming customer orders",
      href: "/dashboard/orders?status=pending",
      icon: Clock,
      category: "quick",
      keywords: ["review", "unfulfilled", "orders", "whatsapp"],
    },
    {
      id: "sales-desk",
      title: "Sales Desk (POS)",
      description: "Record manual & walk-in sales",
      href: "/dashboard/pos",
      icon: ShoppingCart,
      category: "quick",
      keywords: ["pos", "point of sale", "cash", "counter", "direct"],
    },
    {
      id: "visit-store",
      title: "Visit Live Storefront",
      description: "Open customer view",
      href: shopSlug ? `/shop/${shopSlug}` : "/dashboard",
      icon: Store,
      category: "quick",
      keywords: ["view", "preview", "customer", "website"],
    },
    {
      id: "nav-overview",
      title: "Dashboard Overview",
      description: "Key metrics and checklist",
      href: "/dashboard",
      icon: Home,
      category: "navigation",
      keywords: ["home", "stats", "summary"],
    },
    {
      id: "nav-products",
      title: "Products Catalog",
      description: "Manage stock & items",
      href: "/dashboard/products",
      icon: Package,
      category: "navigation",
      keywords: ["items", "inventory", "edit", "pricing"],
    },
    {
      id: "nav-categories",
      title: "Categories",
      description: "Organize items by collection",
      href: "/dashboard/categories",
      icon: Layers,
      category: "navigation",
      keywords: ["groups", "collections", "types"],
    },
    {
      id: "nav-orders",
      title: "Orders List",
      description: "Track sales & fulfillments",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      category: "navigation",
      keywords: ["sales", "invoices", "deliveries", "payments"],
    },
    {
      id: "nav-customers",
      title: "Customers Directory",
      description: "Customer database & contacts",
      href: "/dashboard/customers",
      icon: Users,
      category: "navigation",
      keywords: ["buyers", "contacts", "phone", "whatsapp"],
    },
    {
      id: "nav-design",
      title: "Store Design & Branding",
      description: "Theme, banners, colors & logo",
      href: "/dashboard/design",
      icon: Monitor,
      category: "navigation",
      keywords: ["appearance", "colors", "styles", "logo", "banner"],
    },
    {
      id: "nav-settings",
      title: "Store Settings",
      description: "WhatsApp number, policies & shipping",
      href: "/dashboard/settings",
      icon: Settings,
      category: "navigation",
      keywords: ["whatsapp", "delivery", "policy", "phone", "profile"],
    },
    {
      id: "nav-subscription",
      title: "Subscription & Billing",
      description: "Plan details & features",
      href: "/dashboard/subscription",
      icon: Crown,
      category: "navigation",
      keywords: ["plan", "upgrade", "billing", "pricing"],
    },
  ];

  // Filter items based on query
  const cleanQuery = query.trim().toLowerCase();
  let filteredItems = baseItems.filter((item) => {
    if (!cleanQuery) return true;
    const matchTitle = item.title.toLowerCase().includes(cleanQuery);
    const matchDesc = item.description?.toLowerCase().includes(cleanQuery);
    const matchKeywords = item.keywords?.some((k) =>
      k.toLowerCase().includes(cleanQuery)
    );
    return matchTitle || matchDesc || matchKeywords;
  });

  // If query is non-empty, add dynamic search shortcuts
  if (cleanQuery) {
    const dynamicSearchItems: SearchItem[] = [
      {
        id: `search-products-${cleanQuery}`,
        title: `Search Products for "${query}"`,
        description: "Filter catalog items",
        href: `/dashboard/products?q=${encodeURIComponent(cleanQuery)}`,
        icon: Search,
        category: "quick",
      },
      {
        id: `search-orders-${cleanQuery}`,
        title: `Search Orders for "${query}"`,
        description: "Filter by customer or code",
        href: `/dashboard/orders?q=${encodeURIComponent(cleanQuery)}`,
        icon: ShoppingCart,
        category: "quick",
      },
    ];
    filteredItems = [...dynamicSearchItems, ...filteredItems];
  }

  // Handle global keyboard shortcuts (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Navigate to item
  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  // Keyboard navigation within modal
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter" && filteredItems[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[activeIndex]);
    }
  };

  return (
    <>
      {/* Topbar Search Pill Trigger */}
      <button
        type="button"
        className={s.trigger}
        onClick={() => setIsOpen(true)}
        aria-label="Search orders, products, customers..."
      >
        <Search size={15} className={s.searchIcon} />
        <span className={s.placeholder}>
          Search orders, products, customers...
        </span>
        <kbd className={s.kbd}>Ctrl + K</kbd>
      </button>

      {/* Spotlight Command Modal */}
      {isOpen && (
        <div
          className={s.backdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className={s.modal} role="dialog" aria-modal="true">
            {/* Modal Search Input Header */}
            <div className={s.modalHeader}>
              <Search size={18} className="text-emerald-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className={s.modalInput}
                placeholder="Search orders, products, pages, settings..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
              />
              {query && (
                <button
                  type="button"
                  className={s.clearBtn}
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Modal Body / Results */}
            <div className={s.modalBody}>
              {filteredItems.length > 0 ? (
                <>
                  {/* Quick actions or filtered items */}
                  <div className={s.sectionHeader}>
                    {cleanQuery ? "Search Results" : "Quick Actions & Navigation"}
                  </div>
                  <div className={s.itemList}>
                    {filteredItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = idx === activeIndex;
                      return (
                        <div
                          key={item.id}
                          className={`${s.item} ${isActive ? s.itemActive : ""}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <div className={s.itemIcon}>
                            <Icon size={16} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{item.title}</span>
                          {item.description && (
                            <span className={s.itemDesc}>
                              {item.description}
                            </span>
                          )}
                          <ArrowRight
                            size={13}
                            className="text-slate-400 opacity-60 ml-1 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={s.emptyState}>
                  <div className={s.emptyIcon}>
                    <Search size={20} />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "14px",
                    }}
                  >
                    No matching results found
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Try searching with another keyword like &quot;product&quot;,
                    &quot;order&quot;, or &quot;settings&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Hints */}
            <div className={s.modalFooter}>
              <div className={s.footerHints}>
                <span>
                  <kbd className={s.kbd}>ESC</kbd> to close
                </span>
                <span>
                  <kbd className={s.kbd}>↑↓</kbd> to navigate
                </span>
                <span>
                  <kbd className={s.kbd}>↵</kbd> to select
                </span>
              </div>
              <div className={s.brandTag}>
                <Command size={12} />
                <span>Kadeo Spotlight</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
