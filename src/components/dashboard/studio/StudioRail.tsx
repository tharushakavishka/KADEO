"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  Palette,
  FileCode,
  GitBranch,
  Image as ImageIcon,
  Settings,
  LogOut,
  Layers,
  Sparkles,
} from "lucide-react";

interface StudioRailProps {
  sidebarTab: "layouts" | "pages";
  setSidebarTab: (t: "layouts" | "pages") => void;
  onOpenLayers: () => void;
  shopSlug: string;
  isDirty?: boolean;
  onExitRequest?: () => void;
}

export function StudioRail({
  sidebarTab,
  setSidebarTab,
  onOpenLayers,
  shopSlug,
  isDirty,
  onExitRequest,
}: StudioRailProps) {
  return (
    <nav
      aria-label="Studio Rail"
      className="w-12 bg-[#0f172a] text-zinc-400 flex flex-col items-center justify-between py-3 border-r border-[#1e293b] select-none shrink-0 z-30"
    >
      {/* Top Icons (Matches Reference Image) */}
      <div className="flex flex-col items-center gap-3">
        {/* Brand glyph */}
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
          <span className="font-mono">◆</span>
        </div>

        <div className="w-6 h-[1px] bg-zinc-800 my-1" />

        {/* Add element */}
        <button
          type="button"
          onClick={() => setSidebarTab("layouts")}
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Add Elements & Layouts"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Layouts */}
        <button
          type="button"
          onClick={() => setSidebarTab("layouts")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            sidebarTab === "layouts"
              ? "bg-zinc-800 text-[#38bdf8]"
              : "hover:bg-zinc-800 hover:text-white"
          }`}
          title="Layouts & Base Themes"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Themes link */}
        <Link
          href="/dashboard/themes"
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-[#38bdf8] transition cursor-pointer"
          title="Themes Catalog & Simple Customizer"
        >
          <Palette className="w-4 h-4" />
        </Link>

        {/* Layers */}
        <button
          type="button"
          onClick={onOpenLayers}
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Storefront Layers Hierarchy"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Pages */}
        <button
          type="button"
          onClick={() => setSidebarTab("pages")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            sidebarTab === "pages"
              ? "bg-zinc-800 text-[#38bdf8]"
              : "hover:bg-zinc-800 hover:text-white"
          }`}
          title="Pages & Routes"
        >
          <FileCode className="w-4 h-4" />
        </button>

        {/* Media / Assets */}
        <button
          type="button"
          onClick={() => setSidebarTab("layouts")}
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Images & Media"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Icons (Settings & Dashboard Exit) */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/dashboard/settings"
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition"
          title="Store Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => {
            if (isDirty && onExitRequest) {
              onExitRequest();
            } else {
              window.location.href = "/dashboard";
            }
          }}
          className="p-2 rounded-lg hover:bg-zinc-800 hover:text-red-400 transition cursor-pointer"
          title="Exit to Dashboard"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
