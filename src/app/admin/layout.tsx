import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, Search, Bell, HelpCircle, ChevronRight, Home } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // If not admin, redirect to seller dashboard
    redirect("/dashboard");
  }

  const initialLetter = (user.email?.[0] || "A").toUpperCase();

  return (
    <div className="min-h-screen bg-[#f1f6f5] flex flex-col md:flex-row text-zinc-900 font-sans">
      <AdminSidebar userEmail={user.email || "admin@kadeo.lk"} />

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Header Bar matching mockup */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-6 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Home className="w-3.5 h-3.5" />
            </span>
            <span className="hover:text-zinc-800 transition">Platform Governance</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Super Admin Console</span>
          </div>

          {/* Search Bar + Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs text-zinc-400 w-72">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search stores, merchants, orders..."
                className="bg-transparent border-none outline-none text-xs text-zinc-800 placeholder:text-zinc-400 flex-1"
                disabled
              />
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500 shadow-2xs">
                Ctrl + K
              </span>
            </div>

            <button
              type="button"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
            </button>

            <button
              type="button"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition"
              title="Documentation & Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Profile Avatar Badge */}
            <div
              className="w-8 h-8 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-[#0a4d3c]"
              title={`Logged in as ${user.email}`}
            >
              {initialLetter}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
