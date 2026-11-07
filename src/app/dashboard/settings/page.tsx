import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { SellerDangerZone } from "@/components/dashboard/SellerDangerZone";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("*, settings:shop_settings(*)")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const settings = shop.settings?.[0] || shop.settings || {};

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Configuration
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Store Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your business information, WhatsApp dispatch number, delivery policy, and public visibility.
        </p>
      </div>

      <SettingsForm shop={shop} settings={settings} />

      {/* Seller Danger Zone (Account & Store Deletion) */}
      <SellerDangerZone shopName={shop.name} shopSlug={shop.slug} />
    </div>
  );
}
