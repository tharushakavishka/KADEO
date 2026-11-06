"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { normalizePhoneNumber, isValidPhoneNumber } from "@/lib/phone";
import { redirect } from "next/navigation";
import { z } from "zod";

const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "login",
  "register",
  "auth",
  "api",
  "shop",
  "settings",
  "pricing",
  "about",
  "contact",
  "help",
];

const shopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters."),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters.")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens.")
    .refine((val) => !RESERVED_SLUGS.includes(val), "This slug is reserved."),
  description: z.string().optional(),
  whatsappNumber: z
    .string()
    .refine(
      (val) => isValidPhoneNumber(val),
      "Please enter a valid WhatsApp number (e.g. 0771234567 or +94771234567)."
    )
    .transform((val) => normalizePhoneNumber(val)),
  contactEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  themeId: z.string().default("minimal"),
});

export async function checkSlugAvailability(slug: string) {
  const cleanSlug = generateSlug(slug);
  if (RESERVED_SLUGS.includes(cleanSlug)) {
    return { available: false, reason: "Reserved name" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("shops")
    .select("id")
    .eq("slug", cleanSlug)
    .single();

  return { available: !data, slug: cleanSlug };
}

export async function createShopAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a shop." };
  }

  // Check if seller already owns a shop
  const { data: existingShop } = await supabase
    .from("shops")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

  if (existingShop) {
    redirect(`/dashboard`);
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: generateSlug(formData.get("slug") as string),
    description: (formData.get("description") as string) || undefined,
    whatsappNumber: (formData.get("whatsappNumber") as string) || "",
    contactEmail: (formData.get("contactEmail") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    themeId: (formData.get("themeId") as string) || "minimal",
  };

  const validated = shopSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Ensure slug is unique
  const { data: slugTaken } = await supabase
    .from("shops")
    .select("id")
    .eq("slug", validated.data.slug)
    .single();

  if (slugTaken) {
    return { error: "This shop URL slug is already taken. Please pick another." };
  }

  // Insert shop
  const { data: newShop, error: shopError } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      name: validated.data.name,
      slug: validated.data.slug,
      description: validated.data.description,
      whatsapp_number: validated.data.whatsappNumber,
      contact_email: validated.data.contactEmail,
      address: validated.data.address,
      theme_id: validated.data.themeId,
      status: "active",
    })
    .select()
    .single();

  if (shopError) {
    return { error: shopError.message };
  }

  // Create initial shop settings
  await supabase.from("shop_settings").insert({
    shop_id: newShop.id,
    currency: "LKR",
    store_visibility: true,
  });

  // Assign starter free subscription
  await supabase.from("subscriptions").insert({
    shop_id: newShop.id,
    plan_id: "free",
    status: "active",
    billing_period: "monthly",
  });

  redirect(`/dashboard`);
}
