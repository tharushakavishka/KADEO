export type UserRole = "seller" | "admin";
export type ShopStatus = "active" | "suspended";
export type ProductStatus = "active" | "draft" | "out_of_stock";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired";
export type BillingPeriod = "monthly" | "yearly";

export interface Profile {
  id: string; // references auth.users
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  contact_email: string | null;
  address: string | null;
  theme_id: string;
  storefront_content?: Record<string, string>;
  status: ShopStatus;
  created_at: string;
  updated_at: string;
}

export interface ShopSettings {
  id: string;
  shop_id: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  delivery_information: string | null;
  store_visibility: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview_image: string | null;
  is_active: boolean;
  configuration: Record<string, any>;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  shop_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  total_orders?: number;
  last_order_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id: string;
  order_code: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  delivery_address_snapshot: string;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  shop_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  shop_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  started_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
