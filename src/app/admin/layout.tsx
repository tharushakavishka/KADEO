import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Store, Users, ShoppingBag, ArrowLeft, LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      <aside className="w-64 border-r border-zinc-200 bg-zinc-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-base tracking-tight text-white">
              KADEO ADMIN
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            Platform Operations
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-white"
          >
            <Store className="w-4 h-4" />
            <span>Platform Overview</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Seller Dashboard</span>
          </Link>

          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-zinc-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
