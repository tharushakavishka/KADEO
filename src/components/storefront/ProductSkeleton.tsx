import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs overflow-hidden animate-pulse flex flex-col justify-between">
      <div>
        {/* Image Shimmer Box */}
        <div className="w-full aspect-square rounded-xl bg-slate-200/70 mb-3 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        {/* Category Pill Skeleton */}
        <div className="w-16 h-4 rounded-full bg-slate-200/60 mb-2" />

        {/* Product Title Skeleton */}
        <div className="w-4/5 h-4 rounded bg-slate-200 mb-1.5" />
        <div className="w-3/5 h-3 rounded bg-slate-100 mb-3" />
      </div>

      {/* Price & Button Skeleton */}
      <div className="pt-2 flex items-center justify-between mt-auto">
        <div className="w-20 h-5 rounded bg-slate-200/80" />
        <div className="w-8 h-8 rounded-xl bg-slate-200/80" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}
