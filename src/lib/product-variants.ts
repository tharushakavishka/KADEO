export interface ProductColorVariant {
  name: string;
  hex?: string;
  price?: number;
}

export interface ProductVariantsConfig {
  colors?: ProductColorVariant[];
  sizes?: string[];
}

export function parseProductDescription(rawDescription: string | null | undefined): {
  cleanDescription: string;
  variants: ProductVariantsConfig | null;
} {
  if (!rawDescription) return { cleanDescription: "", variants: null };
  const marker = "<!-- KADEO_VARIANTS:";
  const idx = rawDescription.indexOf(marker);
  if (idx === -1) {
    return { cleanDescription: rawDescription.trim(), variants: null };
  }
  const cleanDescription = rawDescription.substring(0, idx).trim();
  const rest = rawDescription.substring(idx + marker.length);
  const endIdx = rest.indexOf("-->");
  if (endIdx === -1) {
    return { cleanDescription, variants: null };
  }
  try {
    const jsonStr = rest.substring(0, endIdx).trim();
    const variants = JSON.parse(jsonStr);
    return { cleanDescription, variants };
  } catch {
    return { cleanDescription, variants: null };
  }
}

export function serializeProductDescription(
  cleanDescription: string,
  variants: ProductVariantsConfig | null | undefined
): string {
  const base = (cleanDescription || "").trim();
  if (!variants || (!variants.colors?.length && !variants.sizes?.length)) {
    return base;
  }
  const serialized = JSON.stringify(variants);
  return base
    ? `${base}\n\n<!-- KADEO_VARIANTS:${serialized}-->`
    : `<!-- KADEO_VARIANTS:${serialized}-->`;
}
