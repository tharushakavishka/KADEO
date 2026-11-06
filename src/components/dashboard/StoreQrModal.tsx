"use client";

import { useState } from "react";
import { QrCode, Download, X } from "lucide-react";
import s from "./DashboardShell.module.css";

interface StoreQrModalProps {
  shopSlug: string;
  shopName: string;
}

export function StoreQrModal({ shopSlug, shopName }: StoreQrModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop/${shopSlug}`
      : `https://kadeo.lk/shop/${shopSlug}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    storeUrl
  )}&margin=10`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={s.btnWhite}
        title="Generate and download Store QR Code for print/stickers"
      >
        <QrCode size={15} />
        <span>Store QR</span>
      </button>

      {isOpen && (
        <div
          className={s.modalBackdrop}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={s.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className={s.modalIcon}>
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                    {shopName} QR Code
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Scan to open your online storefront instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={s.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 16px" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "16px",
                  borderRadius: "20px",
                  border: "2px solid #e2e8f0",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${shopName}`}
                  width={220}
                  height={220}
                  style={{ display: "block", borderRadius: "12px" }}
                />
              </div>

              <p style={{ fontSize: "11px", color: "#64748b", margin: "14px 0 0", fontFamily: "monospace" }}>
                {storeUrl}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <a
                href={qrImageUrl}
                download={`${shopSlug}-kadeo-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                className={s.btnPrimaryGreen}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Download size={15} />
                <span>Download PNG (For Print &amp; Stickers)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
