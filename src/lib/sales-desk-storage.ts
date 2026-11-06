export interface SalesDeskLine {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock_quantity: number;
  quantity: number;
}

export interface SalesDeskCustomer {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface SalesDeskDraft {
  lines: SalesDeskLine[];
  customer: SalesDeskCustomer;
}

export const EMPTY_SALES_DESK_DRAFT: SalesDeskDraft = {
  lines: [],
  customer: {
    name: "",
    phone: "",
    address: "",
    note: "",
  },
};

export function getSalesDeskStorageKey(shopId?: string): string {
  const safeId = (shopId || "default").trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return `kadeo_pos_draft_${safeId || "default"}`;
}

export function readStoredSalesDeskDraft(raw: string | null): SalesDeskDraft {
  if (!raw) return EMPTY_SALES_DESK_DRAFT;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_SALES_DESK_DRAFT;

    const lines: SalesDeskLine[] = [];
    const seen = new Set<string>();

    if (Array.isArray(parsed.lines)) {
      for (const item of parsed.lines.slice(0, 100)) {
        if (
          !item ||
          typeof item.id !== "string" ||
          !item.id.trim() ||
          typeof item.name !== "string" ||
          !item.name.trim()
        ) {
          continue;
        }

        const id = item.id.trim();
        if (seen.has(id)) {
          continue;
        }

        const price = Number(item.price);
        const stock_quantity = Number.isInteger(item.stock_quantity) ? item.stock_quantity : 0;
        const quantity = Number.isInteger(item.quantity) ? item.quantity : 1;

        if (!Number.isFinite(price) || price < 0 || stock_quantity <= 0 || quantity <= 0) {
          continue;
        }

        seen.add(id);
        lines.push({
          id,
          name: item.name.trim().slice(0, 200),
          sku: typeof item.sku === "string" ? item.sku.trim().slice(0, 60) : undefined,
          price,
          stock_quantity,
          quantity: Math.min(quantity, stock_quantity),
        });
      }
    }

    const customer: SalesDeskCustomer = {
      name: typeof parsed.customer?.name === "string" ? parsed.customer.name.slice(0, 120) : "",
      phone: typeof parsed.customer?.phone === "string" ? parsed.customer.phone.slice(0, 30) : "",
      address: typeof parsed.customer?.address === "string" ? parsed.customer.address.slice(0, 1000) : "",
      note: typeof parsed.customer?.note === "string" ? parsed.customer.note.slice(0, 1000) : "",
    };

    return { lines, customer };
  } catch {
    return EMPTY_SALES_DESK_DRAFT;
  }
}