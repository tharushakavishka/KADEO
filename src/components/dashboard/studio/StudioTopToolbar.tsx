"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  PenTool,
  Undo2,
  Redo2,
  Bookmark,
  ShieldCheck,
  Save,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Sparkles,
  Share2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  PanelLeft,
  PanelRight,
  QrCode,
  Copy,
  Check,
  X,
  Layout,
} from "lucide-react";

interface StudioTopToolbarProps {
  shopName: string;
  shopSlug: string;
  currentPageName: string;
  isDirty: boolean;
  isPending: boolean;
  viewport: "desktop" | "tablet" | "mobile";
  setViewport: (v: "desktop" | "tablet" | "mobile") => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  studioMode: "view" | "edit";
  setStudioMode: (m: "view" | "edit") => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPublish: () => void;
  onExitRequest?: () => void;
  onOpenSnapshots: () => void;
  onOpenQualityAudit: () => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean | ((prev: boolean) => boolean)) => void;
  showLeftSidebar?: boolean;
  setShowLeftSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
  showRightInspector?: boolean;
  setShowRightInspector?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function StudioTopToolbar({
  shopName,
  shopSlug,
  currentPageName,
  isDirty,
  isPending,
  viewport,
  setViewport,
  zoom,
  setZoom,
  studioMode,
  setStudioMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPublish,
  onExitRequest,
  onOpenSnapshots,
  onOpenQualityAudit,
  isFullscreen,
  setIsFullscreen,
  showLeftSidebar,
  setShowLeftSidebar,
  showRightInspector,
  setShowRightInspector,
}: StudioTopToolbarProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const viewportWidthText =
    viewport === "mobile" ? "375 PX" : viewport === "tablet" ? "768 PX" : "1240 PX";

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop/${shopSlug}`
      : `http://localhost:3000/shop/${shopSlug}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    storeUrl
  )}&margin=8`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFocusMode = !showLeftSidebar && !showRightInspector;

  return (
    <>
      <header className="h-14 bg-white border-b border-[#e2e8f0] px-3 sm:px-4 flex items-center justify-between gap-2 select-none shrink-0 shadow-2xs z-30">
        {/* LEFT SIDE: Back to Dashboard, Brand, Store Name & Page Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (isDirty && onExitRequest) {
                onExitRequest();
              } else {
                window.location.href = "/dashboard";
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-black hover:bg-[#f1f5f9] transition mr-0.5 border border-transparent hover:border-[#e2e8f0] cursor-pointer"
            title="Exit Studio to Seller Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="w-8 h-8 rounded-lg bg-[#0f172a] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            <span className="text-[#38bdf8] font-mono">◆</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <strong className="text-xs sm:text-sm font-black text-[#0f172a] truncate max-w-[120px] sm:max-w-[200px]">
              {shopName}
            </strong>
            <span className="text-zinc-300 hidden md:inline">/</span>
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] text-[11px] font-bold">
              <span>{currentPageName}</span>
            </div>
            {isDirty ? (
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved</span>
              </span>
            ) : (
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Saved</span>
              </span>
            )}
          </div>

          {/* Panel Left Toggle */}
          {setShowLeftSidebar && studioMode === "edit" && (
            <button
              type="button"
              onClick={() => setShowLeftSidebar((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ml-1 ${
                showLeftSidebar
                  ? "bg-[#f1f5f9] text-blue-600 border-[#cbd5e1]"
                  : "text-zinc-400 hover:text-black border-transparent hover:border-[#e2e8f0]"
              }`}
              title={showLeftSidebar ? "Collapse Left Panel" : "Expand Left Panel"}
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Focus Canvas Toggle (Optimized for laptops) */}
          {setShowLeftSidebar && setShowRightInspector && studioMode === "edit" && (
            <button
              type="button"
              onClick={() => {
                if (isFocusMode) {
                  setShowLeftSidebar(true);
                  setShowRightInspector(true);
                } else {
                  setShowLeftSidebar(false);
                  setShowRightInspector(false);
                }
              }}
              className={`hidden xl:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                isFocusMode
                  ? "bg-purple-50 text-purple-700 border-purple-300 shadow-2xs font-black"
                  : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
              }`}
              title="Focus Mode: Collapses panels to maximize canvas for smaller laptop screens"
            >
              <Layout className="w-3 h-3" />
              <span>{isFocusMode ? "Exit Focus" : "Focus Canvas"}</span>
            </button>
          )}
        </div>

        {/* CENTER: Responsive Viewports, Dimensions & Zoom */}
        <div className="flex items-center gap-2">
          {/* Viewport switchers */}
          <div className="flex items-center gap-0.5 bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewport === "desktop"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewport === "tablet"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewport === "mobile"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewport Dimension Indicator */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-mono font-bold text-zinc-600">
            <span>{viewportWidthText}</span>
          </div>

          {/* Canvas Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-1.5 py-0.5 text-xs text-zinc-600 font-bold">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 hover:bg-zinc-200 rounded cursor-pointer text-zinc-500"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[11px] w-9 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-zinc-200 rounded cursor-pointer text-zinc-500"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Mobile QR, Snapshots, Audit, Mode & Publish Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Instant Mobile QR Preview Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] hover:bg-[#dcfce7] cursor-pointer transition shadow-2xs"
            title="Scan with smartphone to test live mobile responsiveness"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Mobile QR</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-[#f1f5f9] disabled:opacity-30 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-[#f1f5f9] disabled:opacity-30 cursor-pointer"
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Snapshots Button */}
          <button
            type="button"
            onClick={onOpenSnapshots}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer transition"
            title="Version Snapshots & Checkpoints"
          >
            <Bookmark className="w-3 h-3 text-[#017d6e]" />
            <span>Snapshots</span>
          </button>

          {/* Quality Audit */}
          <button
            type="button"
            onClick={onOpenQualityAudit}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] hover:bg-[#d1fae5] cursor-pointer transition"
            title="Pre-publish Design & WCAG Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>Audit</span>
          </button>

          {/* View / Edit Mode Pill */}
          <div className="flex items-center gap-0.5 bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setStudioMode("view")}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                studioMode === "view"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              title="Customer View Mode (Live links, cart, search)"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setStudioMode("edit")}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                studioMode === "edit"
                  ? "bg-[#6366f1] text-white shadow-2xs font-black"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              title="Visual Edit Mode (Select elements to customize)"
            >
              <PenTool className="w-3 h-3" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* Panel Right Toggle */}
          {setShowRightInspector && studioMode === "edit" && (
            <button
              type="button"
              onClick={() => setShowRightInspector((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showRightInspector
                  ? "bg-[#f1f5f9] text-blue-600 border-[#cbd5e1]"
                  : "text-zinc-400 hover:text-black border-transparent hover:border-[#e2e8f0]"
              }`}
              title={showRightInspector ? "Collapse Right Inspector" : "Expand Right Inspector"}
            >
              <PanelRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer transition inline-flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* PUBLISH BUTTON */}
          <button
            type="button"
            onClick={onPublish}
            disabled={!isDirty || isPending}
            className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? "Publishing..." : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* INSTANT MOBILE QR PREVIEW MODAL */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-[#cbd5e1] max-w-sm w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0f172a]">
                    Instant Mobile Preview
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Scan with your smartphone camera
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-emerald-200 shadow-lg">
                <img
                  src={qrImageUrl}
                  alt={`QR code for ${shopName}`}
                  width={200}
                  height={200}
                  className="rounded-xl block"
                />
              </div>

              <div className="w-full mt-3 p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-600 truncate">
                  {storeUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1 hover:bg-zinc-100 transition cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <strong className="block font-bold">🌿 Real Smartphone Experience:</strong>
              <p className="leading-relaxed">
                Scan with your phone's camera to preview live mobile layout, button styling, and touch response.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
