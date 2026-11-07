import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewStoreForm } from "./NewStoreForm";

export const metadata = {
  title: "Create Storefront | KADEO",
  description: "Set up your online shop name and WhatsApp number.",
};

export default async function NewStorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin role: Super Admins manage the platform and should not be prompted to create individual stores
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // If seller already owns a store, redirect to dashboard overview
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shop) {
    redirect("/dashboard");
  }

  return <NewStoreForm />;
}
