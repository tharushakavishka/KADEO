export function readStoredCart(raw: string | null): Array<{ id: string; name: string; price: number; quantity: number; maxStock: number; imageUrl?: string }> {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.slice(0, 100).flatMap(item => {
      if (!item || typeof item.id !== "string" || typeof item.name !== "string" || seen.has(item.id) || !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isInteger(item.maxStock) || item.maxStock < 1) return [];
      seen.add(item.id);
      return [{ id: item.id, name: item.name, price: item.price, quantity: Math.min(item.quantity, item.maxStock), maxStock: item.maxStock, ...(typeof item.imageUrl === "string" ? { imageUrl: item.imageUrl } : {}) }];
    });
  } catch { return []; }
}
