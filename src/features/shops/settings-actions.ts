"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizePhoneNumber, isValidPhoneNumber } from "@/lib/phone";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required."),
  name: z
    .string()
    .trim()
    .min(2, "Shop name must be at least 2 characters.")
    .max(100, "Shop name cannot exceed 100 characters."),
  whatsappNumber: z
    .string()
    .trim()
    .refine(
      (val) => isValidPhoneNumber(val),
      "Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567)."
    )
    .transform((val) => normalizePhoneNumber(val)),
  contactEmail: z
    .string()
    .trim()
    .email("Please enter a valid contact email address.")
    .max(255, "Email cannot exceed 255 characters.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.length > 0 ? val : null)),
  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.length > 0 ? val : null)),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.length > 0 ? val : null)),
  deliveryInfo: z
    .string()
    .trim()
    .max(2000, "Delivery information cannot exceed 2000 characters.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.length > 0 ? val : "")),
  storeVisibility: z.boolean(),
});

export type UpdateSettingsResult = {
  success?: boolean;
  partialSuccess?: boolean;
  message?: string;
  error?: string;
  data?: {
    name: string;
    whatsappNumber: string;
    contactEmail: string | null;
    address: string | null;
    description: string | null;
    deliveryInfo: string;
    storeVisibility: boolean;
  };
};

export async function updateStoreSettingsAction(
  rawPayload: unknown
): Promise<UpdateSettingsResult> {
  let parsedInput = rawPayload;
  if (typeof FormData !== "undefined" && rawPayload instanceof FormData) {
    parsedInput = {
      shopId: rawPayload.get("shopId"),
      name: rawPayload.get("name"),
      whatsappNumber: rawPayload.get("whatsappNumber"),
      contactEmail: rawPayload.get("contactEmail"),
      address: rawPayload.get("address"),
      description: rawPayload.get("description"),
      deliveryInfo: rawPayload.get("deliveryInfo"),
      storeVisibility:
        rawPayload.get("storeVisibility") === "true" ||
        rawPayload.get("storeVisibility") === "on",
    };
  }

  const validated = settingsSchema.safeParse(parsedInput);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const {
    shopId,
    name,
    whatsappNumber,
    contactEmail,
    address,
    description,
    deliveryInfo,
    storeVisibility,
  } = validated.data;

  const supabase = await createClient();

  // Fresh authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required. Please sign in to update settings." };
  }

  // Fresh ownership verification
  const { data: shop, error: shopLookupError } = await supabase
    .from("shops")
    .select("id, owner_id, slug")
    .eq("id", shopId)
    .single();

  if (shopLookupError || !shop) {
    return { error: "Shop not found or permission denied." };
  }

  if (shop.owner_id !== user.id) {
    return { error: "Permission denied: you are not the owner of this shop." };
  }

  // 1. Update shops table
  const { error: shopUpdateError } = await supabase
    .from("shops")
    .update({
      name,
      whatsapp_number: whatsappNumber,
      description,
      contact_email: contactEmail,
      address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shop.id);

  // 2. Update shop_settings table
  const { error: settingsUpdateError } = await supabase
    .from("shop_settings")
    .upsert(
      {
        shop_id: shop.id,
        delivery_information: deliveryInfo,
        store_visibility: storeVisibility,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "shop_id" }
    );

  // Honest reporting of partial or complete failure/success
  if (shopUpdateError && settingsUpdateError) {
    return {
      error: `Failed to save changes: ${shopUpdateError.message} | ${settingsUpdateError.message}`,
    };
  }

  if (shopUpdateError && !settingsUpdateError) {
    revalidatePath("/dashboard/settings");
    revalidatePath(`/shop/${shop.slug}`);
    return {
      partialSuccess: true,
      error: `Delivery and visibility settings saved, but shop details failed: ${shopUpdateError.message}`,
      data: {
        name,
        whatsappNumber,
        contactEmail,
        address,
        description,
        deliveryInfo,
        storeVisibility,
      },
    };
  }

  if (!shopUpdateError && settingsUpdateError) {
    revalidatePath("/dashboard/settings");
    revalidatePath(`/shop/${shop.slug}`);
    return {
      partialSuccess: true,
      error: `Shop details saved, but delivery and visibility settings failed: ${settingsUpdateError.message}`,
      data: {
        name,
        whatsappNumber,
        contactEmail,
        address,
        description,
        deliveryInfo,
        storeVisibility,
      },
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Store settings saved successfully.",
    data: {
      name,
      whatsappNumber,
      contactEmail,
      address,
      description,
      deliveryInfo,
      storeVisibility,
    },
  };
}
