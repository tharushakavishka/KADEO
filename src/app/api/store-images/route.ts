import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { data: shop } = await db.from("shops").select("id").eq("owner_id", user.id).single();
  if (!shop) return Response.json({ error: "Store not found." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 4400000) return Response.json({ error: "Choose an image smaller than 4 MB." }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || file.size > 4194304 || !file.size) return Response.json({ error: "Choose an image smaller than 4 MB." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : bytes[0]===255 && bytes[1]===216 && bytes[2]===255 ? "jpg" : bytes.toString("ascii",0,4)==="RIFF" && bytes.toString("ascii",8,12)==="WEBP" ? "webp" : null;
    if (!ext) return Response.json({ error: "Use a PNG, JPEG or WebP image." }, { status: 400 });
    const filename = `${randomUUID()}.${ext}`;
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!configured.startsWith("http") || configured.includes("placeholder")) {
      const folder = path.join(process.cwd(), "public", "uploads");
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, filename), bytes, { flag: "wx" });
      return Response.json({ url: `/uploads/${filename}` });
    }
    const key = `${user.id}/${filename}`;
    const bucket = db.storage.from("storefront-assets");
    const { error } = await bucket.upload(key, bytes, { contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`, upsert: false });
    if (error) return Response.json({ error: "Image upload failed. Please try again." }, { status: 500 });
    return Response.json({ url: bucket.getPublicUrl(key).data.publicUrl });
  } catch { return Response.json({ error: "Image upload failed. Please try again." }, { status: 500 }); }
}
