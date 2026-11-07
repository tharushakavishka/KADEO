import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardSearchBar } from "@/components/dashboard/DashboardSearchBar";
import { logoutAction } from "@/features/auth/actions";
import s from "@/components/dashboard/DashboardShell.module.css";
import Link from "next/link";
import {
  Home,
  ShieldCheck,
  Bell,
  HelpCircle,
  ChevronRight,
  LogOut,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch seller's shop
  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, whatsapp_number")
    .eq("owner_id", user.id)
    .single();

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  const shopInitial = (shop?.name || user?.email || "A")
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className={s.shell}>
      <Sidebar
        shopSlug={shop?.slug}
        shopName={shop?.name}
        userEmail={user.email}
      />
      <main className={s.main}>
        {/* Topbar Header */}
        <header className={s.topbar}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <Home size={16} className="text-emerald-700 shrink-0" />
            <span className="text-slate-600 font-medium">Seller Workspace</span>
            <ChevronRight size={14} className={s.breadcrumbDivider} />
            <strong className="text-slate-900 font-bold">
              {shop?.name || "Amarasri Hearath"}
            </strong>
          </div>

          {/* Search & Actions */}
          <div className={s.topbarRight}>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-2xs mr-1"
                title="Super Admin Privileges Active � Click to open Platform Console"
              >
                <ShieldCheck size={14} className="text-amber-600" />
                <span>Super Admin</span>
              </Link>
            )}
            <DashboardSearchBar shopSlug={shop?.slug} />

            <button
              type="button"
              className={s.iconBtn}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className={s.notificationDot} />
            </button>

            <button
              type="button"
              className={s.iconBtn}
              aria-label="Help & Documentation"
            >
              <HelpCircle size={18} />
            </button>

            <div className={s.userAvatar} title={shop?.name || "Account"}>
              {shopInitial}
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className={s.iconBtn}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </header>

        {/* Content Area */}
        <div className={s.content}>{children}</div>
      </main>
    </div>
  );
}
