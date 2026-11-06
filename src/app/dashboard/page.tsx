import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { isValidPhoneNumber, buildWhatsAppUrl, formatPhoneDisplay } from "@/lib/phone";
import s from "@/components/dashboard/DashboardShell.module.css";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { StoreShareBar } from "@/components/dashboard/StoreShareBar";
import {
  Package,
  ShoppingBag,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  Monitor,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Wallet,
  MessageCircle,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Query shop and join settings relation for local adapter & supabase compatibility
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "id, name, slug, status, whatsapp_number, description, logo_url, storefront_content, settings:shop_settings(*)"
    )
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/dashboard/new-store");
  }

  // 1. Fetch real product count
  const { count: totalProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  // 2. Fetch all orders for this shop to compute metrics & revenue accurately
  const { data: allShopOrders, count: totalOrders } = await supabase
    .from("orders")
    .select(
      "id, total, status, created_at, customer_phone_snapshot, customer_name_snapshot, order_code",
      { count: "exact" }
    )
    .eq("shop_id", shop.id);

  // 3. Compute Total Revenue (sum of non-cancelled orders)
  const nonCancelledOrders = (allShopOrders || []).filter(
    (o: any) => o.status !== "cancelled"
  );
  const totalRevenue = nonCancelledOrders.reduce(
    (sum: number, o: any) => sum + (Number(o.total) || 0),
    0
  );

  // 4. Compute Today's Sales
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = (allShopOrders || []).filter(
    (o: any) =>
      new Date(o.created_at) >= todayStart && o.status !== "cancelled"
  );
  const todayRevenue = todayOrders.reduce(
    (sum: number, o: any) => sum + (Number(o.total) || 0),
    0
  );

  // 5. Pending orders count
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id)
    .eq("status", "pending");

  // 6. Completed orders count
  const { count: completedOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id)
    .eq("status", "completed");

  // 7. Total customers
  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  // 8. Shop settings resolution (compatible with both local adapter join and direct array query)
  let deliveryInfo: string | null = null;
  const joinedSettings = Array.isArray(shop.settings)
    ? shop.settings[0]
    : shop.settings;
  if (joinedSettings?.delivery_information) {
    deliveryInfo = joinedSettings.delivery_information;
  } else {
    const { data: directSettings } = await supabase
      .from("shop_settings")
      .select("delivery_information")
      .eq("shop_id", shop.id);
    if (directSettings && directSettings.length > 0) {
      deliveryInfo = directSettings[0].delivery_information;
    }
  }

  // 9. Product photos count
  const { count: productImagesCount } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  // 10. Low-stock products check (stock <= 3)
  const { data: lowestStockProducts } = await supabase
    .from("products")
    .select("id, name, stock_quantity, status")
    .eq("shop_id", shop.id)
    .order("stock_quantity", { ascending: true })
    .limit(5);
  const lowStockProducts = (
    (lowestStockProducts || []) as Array<{
      id: string;
      name: string;
      stock_quantity: number;
      status: string;
    }>
  ).filter((product) => product.stock_quantity <= 3);

  // 11. Recent orders with customer contact and details
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      "id, order_code, customer_name_snapshot, customer_phone_snapshot, total, status, created_at, order_note"
    )
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Derive real checklist status
  const hasWhatsApp = isValidPhoneNumber(shop.whatsapp_number);
  const hasProducts = (totalProducts || 0) > 0;
  const hasPhotos = (productImagesCount || 0) > 0;
  const hasDelivery = Boolean(deliveryInfo && deliveryInfo.trim().length > 0);
  const hasBranding = Boolean(
    (shop.description && shop.description.trim().length > 0) ||
      shop.logo_url ||
      (shop.storefront_content &&
        Object.keys(shop.storefront_content).length > 0)
  );

  const onboardingSteps = [
    {
      id: "whatsapp",
      title: "Connect WhatsApp order number",
      description:
        "Direct customer orders and chat inquiries are routed to this phone number.",
      completed: hasWhatsApp,
      href: "/dashboard/settings",
      actionText: "Edit Number",
    },
    {
      id: "product",
      title: "Add your first product",
      description:
        "List items with title, price, SKU, category, and available inventory.",
      completed: hasProducts,
      href: "/dashboard/products/new",
      actionText: hasProducts ? "+ Add Another" : "+ Add Product",
    },
    {
      id: "photos",
      title: "Upload product photos",
      description:
        "Add clear visual photos to showcase your items in the storefront.",
      completed: hasPhotos,
      href: "/dashboard/products",
      actionText: "Manage Photos",
    },
    {
      id: "delivery",
      title: "Set delivery & return policies",
      description:
        "Display shipping rates, COD availability, and return policies for customers.",
      completed: hasDelivery,
      href: "/dashboard/settings",
      actionText: hasDelivery ? "Update Policy" : "Set Policy",
    },
    {
      id: "branding",
      title: "Personalize store branding & design",
      description:
        "Customize your store bio, banner, logo, and storefront layout options.",
      completed: hasBranding,
      href: "/dashboard/design/content",
      actionText: "Edit Design",
    },
  ];

  // 6 Metric Tiles: Revenue, Today's Sales, Orders, Pending, Products, Customers
  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      href: "/dashboard/orders",
      highlight: totalRevenue > 0,
    },
    {
      label: "Today's Sales",
      value: formatCurrency(todayRevenue),
      icon: Wallet,
      href: "/dashboard/orders",
    },
    {
      label: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingBag,
      href: "/dashboard/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders || 0,
      icon: Clock,
      href: "/dashboard/orders?status=pending",
      highlight: (pendingOrders || 0) > 0,
    },
    {
      label: "Total Products",
      value: totalProducts || 0,
      icon: Package,
      href: "/dashboard/products",
    },
    {
      label: "Total Customers",
      value: totalCustomers || 0,
      icon: Users,
      href: "/dashboard/customers",
    },
  ];

  return (
    <div className={s.overview}>
      {/* Top Header Welcome Banner with 1-Click Store Sharing */}
      <div className={s.welcome}>
        <div className={s.welcomeInfo}>
          <div className={s.welcomeTag}>
            <span>YOUR BUSINESS, ALL IN ONE PLACE</span>
            <span className={s.welcomeTagLine} />
          </div>
          <h1 className={s.welcomeTitle}>{shop.name}</h1>
          <p className={s.welcomeSubtitle}>
            A little progress, every day. Let’s take care of your store.
          </p>

          <StoreShareBar shopSlug={shop.slug} shopName={shop.name} />
        </div>

        {/* 3D Laptop with Awning, Cardboard Boxes, Plant Illustration */}
        <img
          src="/images/dashboard-hero-art.png"
          alt="Kadeo Store Workspace"
          className={s.welcomeArt}
        />
      </div>

      {/* Seller Onboarding Checklist (Collapsible to save screen space) */}
      <OnboardingChecklist
        shopName={shop.name}
        shopSlug={shop.slug}
        steps={onboardingSteps}
        lowStockItems={lowStockProducts || []}
      />

      {/* Quick Action Shortcuts Grid */}
      <div className={s.quickLinks}>
        <Link href="/dashboard/products/new" className={s.quickLinkCard}>
          <div className={s.quickLinkIcon}>
            <Plus size={20} />
          </div>
          <div className={s.quickLinkInfo}>
            <strong>Add New Product</strong>
            <small>Create an item in your catalog</small>
          </div>
        </Link>

        <Link href="/dashboard/pos" className={s.quickLinkCard}>
          <div className={s.quickLinkIcon}>
            <ShoppingCart size={20} />
          </div>
          <div className={s.quickLinkInfo}>
            <strong>Sales Desk (POS)</strong>
            <small>Record walk-in or manual sales</small>
          </div>
        </Link>

        <Link href="/dashboard/design" className={s.quickLinkCard}>
          <div className={s.quickLinkIcon}>
            <Monitor size={20} />
          </div>
          <div className={s.quickLinkInfo}>
            <strong>Store Design</strong>
            <small>Customize colors, bio & banner</small>
          </div>
        </Link>

        <Link
          href="/dashboard/orders?status=pending"
          className={s.quickLinkCard}
        >
          <div className={s.quickLinkIcon}>
            <Clock size={20} />
          </div>
          <div className={s.quickLinkInfo}>
            <strong>Pending Orders</strong>
            <small>
              {pendingOrders || 0} order{(pendingOrders || 0) === 1 ? "" : "s"}{" "}
              waiting review
            </small>
          </div>
        </Link>
      </div>

      {/* Metric Tiles (Now includes Total Revenue and Today's Sales) */}
      <div className={s.stats}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={s.stat}
              data-highlight={Boolean(stat.highlight)}
            >
              <div className={s.statTop}>
                <span>{stat.label}</span>
                <div className={s.statIcon}>
                  <Icon size={18} />
                </div>
              </div>
              <div className={s.statValue}>{stat.value}</div>
            </Link>
          );
        })}
      </div>

      {/* Low-Stock Inventory Alert (conditional) */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className={s.lowStockCard}>
          <div className={s.lowStockHeader}>
            <div className={s.lowStockIcon}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "14px", color: "#92400e" }}>
                Low Inventory Alert ({lowStockProducts.length}{" "}
                {lowStockProducts.length === 1 ? "item" : "items"})
              </strong>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "#b45309",
                }}
              >
                These products have 3 or fewer items remaining. Restock soon to
                prevent missed sales.
              </p>
            </div>
          </div>
          <div className={s.lowStockList}>
            {lowStockProducts.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/products/${item.id}/edit`} className={s.lowStockItem}
              >
                <span>{item.name}</span>
                <span
                  style={{
                    background:
                      item.stock_quantity === 0 ? "#ef4444" : "#f59e0b",
                    color: "#ffffff",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.stock_quantity === 0
                    ? "Out of Stock"
                    : `${item.stock_quantity} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className={s.ordersCard}>
        <div className={s.ordersHeader}>
          <div>
            <h2>Recent Orders</h2>
            <p>Latest customer inquiries and purchases with instant WhatsApp access</p>
          </div>
          <Link
            href="/dashboard/orders"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#047857",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>View All Orders</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className={s.ordersTableWrap}>
          {recentOrders && recentOrders.length > 0 ? (
            <table className={s.ordersTable}>
              <thead>
                <tr>
                  <th>Order Code</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => {
                  const statusClass =
                    order.status === "pending"
                      ? s.badgePending
                      : order.status === "confirmed"
                      ? s.badgeConfirmed
                      : order.status === "shipped"
                      ? s.badgeShipped
                      : order.status === "completed"
                      ? s.badgeCompleted
                      : s.badgeCancelled;

                  const orderDate = new Date(
                    order.created_at
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  // Detect payment method (Cash on delivery vs Bank Transfer)
                  const isBankTransfer =
                    (order.order_note &&
                      order.order_note.toLowerCase().includes("bank")) ||
                    (order.payment_method &&
                      order.payment_method.toLowerCase().includes("bank"));

                  const customerPhone = order.customer_phone_snapshot || "";
                  const customerName = order.customer_name_snapshot || "Buyer";
                  const waMessage = `Hello ${customerName}! Thank you for your order #${order.order_code} on ${shop.name}. We are currently processing your order.`;
                  const waUrl = buildWhatsAppUrl(customerPhone, waMessage);

                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>
                        #{order.order_code || order.id.slice(0, 8)}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>
                            {customerName}
                          </span>
                          {customerPhone && (
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {formatPhoneDisplay(customerPhone)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{orderDate}</td>
                      <td>
                        <span
                          className={
                            isBankTransfer
                              ? s.badgePaymentBank
                              : s.badgePaymentCod
                          }
                        >
                          {isBankTransfer ? "Bank Transfer" : "Cash on Delivery"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#047857" }}>
                        {formatCurrency(Number(order.total) || 0)}
                      </td>
                      <td>
                        <span className={`${s.badgeStatus} ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {customerPhone ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={s.whatsappActionBtn}
                              title="Chat directly with customer on WhatsApp"
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp</span>
                            </a>
                          ) : null}
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#047857",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Details →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  color: "#94a3b8",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px",
                }}
              >
                <ShoppingBag size={22} />
              </div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "14px",
                }}
              >
                No orders received yet
              </p>
              <p style={{ margin: 0, fontSize: "12.5px" }}>
                When customers order products through WhatsApp, they will appear
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
