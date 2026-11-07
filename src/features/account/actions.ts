"use server";

import { adminDeleteShopAction, sellerDeleteAccountAction, type DeleteShopResult } from "./delete-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function serverAdminDeleteShop(shopId: string): Promise<DeleteShopResult> {
  const result = await adminDeleteShopAction(shopId);
  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/admin/stores");
    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/backups");
    revalidatePath("/admin/analytics");
  }
  return result;
}

export async function serverSellerDeleteAccount(): Promise<DeleteShopResult> {
  const result = await sellerDeleteAccountAction();
  if (result.success) {
    redirect("/login?deleted=true");
  }
  return result;
}
