"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ArrowUpRight, Copy, Check, MessageCircle, Plus } from "lucide-react";
import s from "./DashboardShell.module.css";

interface StoreShareBarProps {
  shopSlug: string;
  shopName: string;
}

export function StoreShareBar({ shopSlug, shopName }: StoreShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getStoreUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shop/${shopSlug}`;
    }
    return `https://kadeo.lk/shop/${shopSlug}`;
  };

  const handleCopy = async () => {
    try {
      const url = getStoreUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppShare = () => {
    const url = getStoreUrl();
    const message = `Check out our store ${shopName} on KADEO:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={s.welcomeActions}>
      <Link
        href={`/shop/${shopSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={s.btnPrimaryGreen}
        title="Visit live customer storefront"
      >
        <Store size={15} />
        <span>View Store</span>
        <ArrowUpRight size={14} />
      </Link>

      <button
        type="button"
        onClick={handleCopy}
        className={s.btnWhite}
        title="Copy store link to clipboard"
      >
        {copied ? (
          <>
            <Check size={15} style={{ color: "#059669" }} />
            <span style={{ color: "#059669" }}>Link Copied!</span>
          </>
        ) : (
          <>
            <Copy size={15} />
            <span>Copy Link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleWhatsAppShare}
        className={s.btnWhatsApp}
        title="Share your store link directly on WhatsApp"
      >
        <MessageCircle size={15} />
        <span>Share to WhatsApp</span>
      </button>

      <Link href="/dashboard/products/new" className={s.btnWhite}>
        <Plus size={15} />
        <span>Add Product</span>
      </Link>
    </div>
  );
}
