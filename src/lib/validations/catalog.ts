import { z } from "zod";

export const imageSchema = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      !value ||
      /^\/(uploads|images|[a-zA-Z0-9/_-]+)\/[a-zA-Z0-9/._-]+\.(png|jpg|webp|jpeg|svg|gif|avif)$/i.test(value) ||
      value.startsWith("/") ||
      (() => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" || url.protocol === "http:";
        } catch {
          return false;
        }
      })(),
    "Images must use a valid HTTP/HTTPS URL or an uploaded image path."
  );

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters.").max(200, "Product name must be 200 characters or fewer."),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters.").max(200).optional(),
  description: z.string().max(5000, "Description must be 5000 characters or fewer.").optional().nullable(),
  sku: z.string().trim().max(100).optional().nullable(),
  price: z.coerce.number().min(0, "Price must be a positive number or zero."),
  compareAtPrice: z.coerce.number().min(0, "Compare-at price cannot be negative.").optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative."),
  categoryId: z.string().min(1).max(100).optional().nullable().or(z.literal("")),
  status: z.enum(["active", "draft", "out_of_stock"]).default("active"),
  imageUrl: imageSchema.optional().or(z.literal("")),
  images: z.array(imageSchema).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(100, "Category name must be 100 characters or fewer."),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters.").max(100).optional(),
  description: z.string().max(1000, "Description must be 1000 characters or fewer.").optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  imageUrl: imageSchema.optional().nullable().or(z.literal("")),
});
