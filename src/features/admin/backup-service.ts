import { createClient } from "@/lib/supabase/server";

export interface StoreBackupData {
  $schema: string;
  export_metadata: {
    version: string;
    exported_at: string;
    exported_by: string;
    shop_id: string;
    shop_slug: string;
  };
  store_profile: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    whatsapp_number: string;
    contact_email: string | null;
    address: string | null;
    theme_id: string;
    status: string;
    storage_used_bytes: number;
    custom_storage_quota_mb: number | null;
    created_at: string;
    owner: {
      id: string;
      full_name: string | null;
      email: string | null;
    } | null;
    settings: {
      primary_color?: string;
      secondary_color?: string;
      currency?: string;
      delivery_information?: string | null;
      store_visibility?: boolean;
    } | null;
    storefront_content?: Record<string, string>;
  };
  subscription: {
    plan_id: string;
    status: string;
    billing_period: string;
    started_at: string | null;
    expires_at: string | null;
    grace_period_ends_at: string | null;
    admin_notes: string | null;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sku: string | null;
    category_id: string | null;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    status: string;
    created_at: string;
    images: Array<{
      storage_path: string;
      alt_text: string | null;
      sort_order: number;
    }>;
  }>;
  customers: Array<{
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
    address: string | null;
    total_orders?: number;
  }>;
  orders: Array<{
    id: string;
    order_code: string;
    status: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    currency: string;
    customer_name_snapshot: string;
    customer_phone_snapshot: string;
    delivery_address_snapshot: string;
    order_note: string | null;
    created_at: string;
    items: Array<{
      product_name_snapshot: string;
      unit_price: number;
      quantity: number;
      line_total: number;
    }>;
  }>;
  statistics: {
    total_categories: number;
    total_products: number;
    total_customers: number;
    total_orders: number;
    storage_used_bytes: number;
  };
}

export async function exportStoreBackup(
  shopId: string,
  clientOverride?: any
): Promise<{ success: boolean; data?: StoreBackupData; error?: string; status?: number }> {
  try {
    const supabase = clientOverride || (await createClient());

    // 1. Authenticate user & verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Sign in required", status: 401 };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Super Admin access required", status: 403 };
    }

    if (!shopId) {
      return { success: false, error: "Shop ID is required", status: 400 };
    }

    // 2. Fetch Shop Details
    const { data: shop, error: shopErr } = await supabase
      .from("shops")
      .select("*")
      .eq("id", shopId)
      .single();

    if (shopErr || !shop) {
      return { success: false, error: "Shop not found", status: 404 };
    }

    // 3. Fetch Owner Profile (Sanitized - no sensitive tokens)
    const { data: owner } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", shop.owner_id)
      .maybeSingle();

    // 4. Fetch Shop Settings
    const { data: settings } = await supabase
      .from("shop_settings")
      .select("primary_color, secondary_color, currency, delivery_information, store_visibility")
      .eq("shop_id", shopId)
      .maybeSingle();

    // 5. Fetch Subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id, status, billing_period, started_at, expires_at, grace_period_ends_at, admin_notes")
      .eq("shop_id", shopId)
      .maybeSingle();

    // 6. Fetch Categories
    const { data: categories = [] } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .eq("shop_id", shopId)
      .order("sort_order", { ascending: true });

    // 7. Fetch Products & Product Images
    const { data: products = [] } = await supabase
      .from("products")
      .select("id, name, slug, description, sku, category_id, price, compare_at_price, stock_quantity, status, created_at")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    const { data: images = [] } = await supabase
      .from("product_images")
      .select("product_id, storage_path, alt_text, sort_order")
      .eq("shop_id", shopId)
      .order("sort_order", { ascending: true });

    const productsWithImages = (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      sku: p.sku,
      category_id: p.category_id,
      price: Number(p.price) || 0,
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      stock_quantity: Number(p.stock_quantity) || 0,
      status: p.status,
      created_at: p.created_at,
      images: (images || [])
        .filter((img: any) => img.product_id === p.id)
        .map((img: any) => ({
          storage_path: img.storage_path,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
        })),
    }));

    // 8. Fetch Customers
    const { data: customers = [] } = await supabase
      .from("customers")
      .select("id, full_name, phone, email, address, total_orders")
      .eq("shop_id", shopId);

    // 9. Fetch Orders & Order Items
    const { data: orders = [] } = await supabase
      .from("orders")
      .select("id, order_code, status, subtotal, delivery_fee, total, currency, customer_name_snapshot, customer_phone_snapshot, delivery_address_snapshot, order_note, created_at")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    const { data: orderItems = [] } = await supabase
      .from("order_items")
      .select("order_id, product_name_snapshot, unit_price, quantity, line_total")
      .eq("shop_id", shopId);

    const ordersWithItems = (orders || []).map((o: any) => ({
      id: o.id,
      order_code: o.order_code,
      status: o.status,
      subtotal: Number(o.subtotal) || 0,
      delivery_fee: Number(o.delivery_fee) || 0,
      total: Number(o.total) || 0,
      currency: o.currency || "LKR",
      customer_name_snapshot: o.customer_name_snapshot,
      customer_phone_snapshot: o.customer_phone_snapshot,
      delivery_address_snapshot: o.delivery_address_snapshot,
      order_note: o.order_note,
      created_at: o.created_at,
      items: (orderItems || [])
        .filter((item: any) => item.order_id === o.id)
        .map((item: any) => ({
          product_name_snapshot: item.product_name_snapshot,
          unit_price: Number(item.unit_price) || 0,
          quantity: Number(item.quantity) || 1,
          line_total: Number(item.line_total) || 0,
        })),
    }));

    const backupPayload: StoreBackupData = {
      $schema: "https://kadeo.lk/schemas/store-backup.v1.json",
      export_metadata: {
        version: "1.0.0",
        exported_at: new Date().toISOString(),
        exported_by: user.email || "admin@kadeo.lk",
        shop_id: shop.id,
        shop_slug: shop.slug,
      },
      store_profile: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        whatsapp_number: shop.whatsapp_number,
        contact_email: shop.contact_email,
        address: shop.address,
        theme_id: shop.theme_id || "modern_boutique",
        status: shop.status,
        storage_used_bytes: Number(shop.storage_used_bytes || 0),
        custom_storage_quota_mb: shop.custom_storage_quota_mb || null,
        created_at: shop.created_at,
        owner: owner
          ? {
              id: owner.id,
              full_name: owner.full_name,
              email: owner.email,
            }
          : null,
        settings: settings || null,
        storefront_content: shop.storefront_content || {},
      },
      subscription: sub
        ? {
            plan_id: sub.plan_id || "free",
            status: sub.status || "active",
            billing_period: sub.billing_period || "monthly",
            started_at: sub.started_at,
            expires_at: sub.expires_at,
            grace_period_ends_at: sub.grace_period_ends_at,
            admin_notes: sub.admin_notes,
          }
        : {
            plan_id: "free",
            status: "active",
            billing_period: "monthly",
            started_at: shop.created_at,
            expires_at: null,
            grace_period_ends_at: null,
            admin_notes: null,
          },
      categories: (categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sort_order: c.sort_order || 0,
      })),
      products: productsWithImages,
      customers: (customers || []).map((cust: any) => ({
        id: cust.id,
        full_name: cust.full_name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        total_orders: cust.total_orders,
      })),
      orders: ordersWithItems,
      statistics: {
        total_categories: categories.length,
        total_products: productsWithImages.length,
        total_customers: customers.length,
        total_orders: ordersWithItems.length,
        storage_used_bytes: Number(shop.storage_used_bytes || 0),
      },
    };

    return { success: true, data: backupPayload };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to generate store backup",
      status: 500,
    };
  }
}

export async function exportAllStoresBackup(clientOverride?: any): Promise<{
  success: boolean;
  data?: {
    platform: string;
    version: string;
    exported_at: string;
    exported_by: string;
    total_stores: number;
    stores: StoreBackupData[];
  };
  error?: string;
  status?: number;
}> {
  try {
    const supabase = clientOverride || (await createClient());

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Sign in required", status: 401 };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Super Admin access required", status: 403 };
    }

    const { data: shops, error: shopsErr } = await supabase
      .from("shops")
      .select("id")
      .order("created_at", { ascending: false });

    if (shopsErr || !shops) {
      return { success: false, error: "Failed to list shops", status: 500 };
    }

    const storesBackup: StoreBackupData[] = [];
    for (const s of shops) {
      const res = await exportStoreBackup(s.id, supabase);
      if (res.success && res.data) {
        storesBackup.push(res.data);
      }
    }

    return {
      success: true,
      data: {
        platform: "KADEO Multi-Tenant Storefront Platform",
        version: "1.0.0",
        exported_at: new Date().toISOString(),
        exported_by: user.email || "admin@kadeo.lk",
        total_stores: storesBackup.length,
        stores: storesBackup,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to generate all-stores backup",
      status: 500,
    };
  }
}
