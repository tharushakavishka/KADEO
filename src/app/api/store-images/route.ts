import { createClient } from "@/lib/supabase/server";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. Origin verification
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  // 2. Auth verification
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  // 3. Shop & ownership check
  const { data: shop } = await db
    .from("shops")
    .select("id, status, storage_used_bytes, custom_storage_quota_mb")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return Response.json({ error: "Store not found." }, { status: 403 });
  }

  if (shop.status === "suspended") {
    return Response.json(
      { error: "Storefront is currently suspended. Image uploads are restricted." },
      { status: 403 }
    );
  }

  // 4. Quick header size sanity check (4.4 MB)
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > 4400000) {
    return Response.json(
      { error: "Choose an image smaller than 4 MB." },
      { status: 413 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("image");

    if (!(file instanceof File) || file.size > 4194304 || !file.size) {
      return Response.json(
        { error: "Choose an image smaller than 4 MB." },
        { status: 400 }
      );
    }

    // 5. Subscription validity & Storage Quota Verification
    const quotaDetails = await getShopStorageQuota(shop.id);
    if (!quotaDetails) {
      return Response.json(
        { error: "Could not evaluate storage quota." },
        { status: 500 }
      );
    }

    // A. Check subscription validity
    if (quotaDetails.subscription.isExpired) {
      return Response.json(
        {
          error: "Your subscription has expired. Please renew or upgrade your plan to continue uploading images.",
          code: "SUBSCRIPTION_EXPIRED",
        },
        { status: 403 }
      );
    }

    // B. Check quota capacity: (current + incoming) > limit
    const incomingBytes = file.size;
    const currentStorage = Number(shop.storage_used_bytes || 0);
    const effectiveLimitBytes = quotaDetails.effectiveQuotaBytes;

    if (currentStorage + incomingBytes > effectiveLimitBytes) {
      const quotaMb = quotaDetails.effectiveQuotaMb;
      const usedMb = (currentStorage / (1024 * 1024)).toFixed(1);
      return Response.json(
        {
          error: `Storage quota exceeded (${usedMb} MB of ${quotaMb} MB used). Delete older assets or upgrade your plan to increase quota.`,
          code: "STORAGE_QUOTA_EXCEEDED",
          quotaMb,
          usedBytes: currentStorage,
        },
        { status: 413 }
      );
    }

    // 6. Magic Bytes inspection
    const bytes = Buffer.from(await file.arrayBuffer());
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const isWebp =
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";

    const ext = isPng ? "png" : isJpg ? "jpg" : isWebp ? "webp" : null;
    if (!ext) {
      return Response.json(
        { error: "Use a PNG, JPEG or WebP image." },
        { status: 400 }
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    let fileUrl = "";

    // 7. Write to Local storage / Supabase storage
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!configured.startsWith("http") || configured.includes("placeholder")) {
      const folder = path.join(process.cwd(), "public", "uploads");
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, filename), bytes, { flag: "wx" });
      fileUrl = `/uploads/${filename}`;
    } else {
      const key = `${user.id}/${filename}`;
      const bucket = db.storage.from("storefront-assets");
      const { error } = await bucket.upload(key, bytes, {
        contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
        upsert: false,
      });
      if (error) {
        return Response.json(
          { error: "Image upload failed. Please try again." },
          { status: 500 }
        );
      }
      fileUrl = bucket.getPublicUrl(key).data.publicUrl;
    }

    // 8. Atomically increment storage_used_bytes in shop record
    const updatedStorageBytes = currentStorage + incomingBytes;
    await db
      .from("shops")
      .update({
        storage_used_bytes: updatedStorageBytes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shop.id);

    return Response.json({
      url: fileUrl,
      storageUsedBytes: updatedStorageBytes,
      effectiveQuotaMb: quotaDetails.effectiveQuotaMb,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
