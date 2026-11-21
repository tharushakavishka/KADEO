"use client";

import { useMemo } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface SalesAnalyticsChartProps {
  orders: Array<{
    total: number;
    created_at: string;
    status: string;
  }>;
}

export function SalesAnalyticsChart({ orders }: SalesAnalyticsChartProps) {
  // Aggregate sales by last 7 days
  const chartData = useMemo(() => {
    const days: Record<string, { label: string; total: number; count: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      days[key] = { label: dayName, total: 0, count: 0 };
    }

    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const key = o.created_at?.split("T")[0];
      if (key && days[key]) {
        days[key].total += Number(o.total) || 0;
        days[key].count += 1;
      }
    });

    return Object.values(days);
  }, [orders]);

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1000);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Performance Overview
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            7-Day Sales Volume
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Tracking</span>
        </div>
      </div>

      {/* SVG Smooth Bar & Curve Chart */}
      <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
        {chartData.map((d, idx) => {
          const heightPercent = Math.max(12, Math.round((d.total / maxTotal) * 100));
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg pointer-events-none mb-1 whitespace-nowrap shadow-md">
                LKR {d.total.toLocaleString()} ({d.count} orders)
              </div>

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-slate-100 rounded-xl relative overflow-hidden flex items-end h-full">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-500 group-hover:brightness-110"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-semibold text-slate-500 mt-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
