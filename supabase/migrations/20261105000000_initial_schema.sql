-- ============================================================================
-- KADEO: Complete Multi-Tenant Database Schema with RLS
-- Migration: 20261105000000_initial_schema.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile automatically on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        new.email,
        'seller'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. THEMES TABLE
CREATE TABLE IF NOT EXISTS public.themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    preview_image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default themes
INSERT INTO public.themes (id, name, description, configuration)
VALUES 
    ('minimal', 'Minimal Store', 'Clean white design, simple navigation, large product images.', '{"font": "Inter", "headerStyle": "minimal", "cardStyle": "flat"}'::jsonb),
    ('modern_boutique', 'Modern Boutique', 'Editorial layout, strong typography, stylish product presentation.', '{"font": "Playfair Display", "headerStyle": "editorial", "cardStyle": "bordered"}'::jsonb),
    ('classic', 'Classic Shop', 'Traditional e-commerce structure, clear categories, compact product grid.', '{"font": "System", "headerStyle": "classic", "cardStyle": "shadowed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    whatsapp_number TEXT NOT NULL,
    contact_email TEXT,
    address TEXT,
    theme_id TEXT NOT NULL DEFAULT 'minimal' REFERENCES public.themes(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);

-- 4. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
    primary_color TEXT NOT NULL DEFAULT '#18181b',
    secondary_color TEXT NOT NULL DEFAULT '#71717a',
    currency TEXT NOT NULL DEFAULT 'LKR',
    delivery_information TEXT DEFAULT 'Standard island-wide delivery available.',
    store_visibility BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_shop_category_slug UNIQUE (shop_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_shop ON public.categories(shop_id);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'out_of_stock')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_shop_product_slug UNIQUE (shop_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- 7. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_shop ON public.product_images(shop_id);

-- 8. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_shop_customer_phone UNIQUE (shop_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_shop ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    order_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    currency TEXT NOT NULL DEFAULT 'LKR',
    customer_name_snapshot TEXT NOT NULL,
    customer_phone_snapshot TEXT NOT NULL,
    delivery_address_snapshot TEXT NOT NULL,
    order_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop ON public.order_items(shop_id);

-- 11. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    yearly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.plans (id, name, description, monthly_price, yearly_price, features)
VALUES 
    ('free', 'Starter Free', 'Free store builder with WhatsApp checkout.', 0.00, 0.00, '["Up to 25 products", "3 Themes", "WhatsApp Orders", "Mobile Dashboard"]'::jsonb),
    ('pro', 'Pro Business', 'For growing merchants and established brands.', 2500.00, 25000.00, '["Unlimited products", "Custom Themes", "Priority Support", "Advanced Analytics"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 12. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
    billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Is Shop Owner
CREATE OR REPLACE FUNCTION public.is_shop_owner(target_shop_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.shops
        WHERE id = target_shop_id AND owner_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles:
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Themes:
CREATE POLICY "Themes are viewable by everyone" ON public.themes
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

-- Plans:
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

-- Shops:
CREATE POLICY "Sellers can manage their own shops" ON public.shops
    FOR ALL USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY "Public can view active storefronts" ON public.shops
    FOR SELECT USING (status = 'active');

-- Shop Settings:
CREATE POLICY "Sellers can manage their shop settings" ON public.shop_settings
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Public can view shop settings for active shops" ON public.shop_settings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_settings.shop_id AND shops.status = 'active')
    );

-- Categories:
CREATE POLICY "Sellers can manage categories" ON public.categories
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Public can view categories of active shops" ON public.categories
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.status = 'active')
    );

-- Products:
CREATE POLICY "Sellers can manage products" ON public.products
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Public can view active products in active shops" ON public.products
    FOR SELECT USING (
        status = 'active' AND 
        EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.status = 'active')
    );

-- Product Images:
CREATE POLICY "Sellers can manage product images" ON public.product_images
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.shops WHERE shops.id = product_images.shop_id AND shops.status = 'active')
    );

-- Customers: (Private to shop owner)
CREATE POLICY "Sellers can view and manage their customers" ON public.customers
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

-- Orders: (Private to shop owner)
CREATE POLICY "Sellers can view and manage their orders" ON public.orders
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

-- Order Items: (Private to shop owner)
CREATE POLICY "Sellers can view order items" ON public.order_items
    FOR ALL USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

-- Subscriptions:
CREATE POLICY "Sellers can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));

-- Admin Activity Logs:
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
    FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================================================
-- ATOMIC ORDER PLACEMENT STORED PROCEDURE (Stock race condition protection)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_checkout_order(
    p_shop_slug TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_address TEXT,
    p_customer_email TEXT,
    p_order_note TEXT,
    p_items JSONB -- Array of { product_id: UUID, quantity: INT }
)
RETURNS JSONB AS $$
DECLARE
    v_shop RECORD;
    v_customer_id UUID;
    v_order_id UUID;
    v_order_code TEXT;
    v_subtotal NUMERIC(12, 2) := 0;
    v_delivery_fee NUMERIC(12, 2) := 0;
    v_total NUMERIC(12, 2) := 0;
    v_item RECORD;
    v_product RECORD;
    v_line_total NUMERIC(12, 2);
    v_year TEXT := to_char(now(), 'YYYY');
    v_random_code TEXT;
BEGIN
    -- 1. Validate Shop
    SELECT id, name, whatsapp_number, status 
    INTO v_shop 
    FROM public.shops 
    WHERE slug = p_shop_slug AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active shop not found with slug %', p_shop_slug;
    END IF;

    -- 2. Upsert Customer Record
    INSERT INTO public.customers (shop_id, full_name, phone, address, email)
    VALUES (v_shop.id, p_customer_name, p_customer_phone, p_customer_address, p_customer_email)
    ON CONFLICT (shop_id, phone) 
    DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        address = EXCLUDED.address,
        email = COALESCE(EXCLUDED.email, customers.email),
        updated_at = now()
    RETURNING id INTO v_customer_id;

    -- 3. Generate Unique Order Code (e.g. KAD-2026-XXXXXX)
    LOOP
        v_random_code := 'KAD-' || v_year || '-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_random_code);
    END LOOP;
    v_order_code := v_random_code;

    -- 4. Create Order Header (Initial placeholder subtotal)
    INSERT INTO public.orders (
        shop_id,
        customer_id,
        order_code,
        status,
        subtotal,
        delivery_fee,
        total,
        currency,
        customer_name_snapshot,
        customer_phone_snapshot,
        delivery_address_snapshot,
        order_note
    ) VALUES (
        v_shop.id,
        v_customer_id,
        v_order_code,
        'pending',
        0.00,
        0.00,
        0.00,
        'LKR',
        p_customer_name,
        p_customer_phone,
        p_customer_address,
        p_order_note
    ) RETURNING id INTO v_order_id;

    -- 5. Process Items & Update Stock Atomically
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid quantity % for item', v_item.quantity;
        END IF;

        -- Lock and verify product stock
        SELECT id, name, price, stock_quantity, status
        INTO v_product
        FROM public.products
        WHERE id = v_item.product_id AND shop_id = v_shop.id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not belong to this shop', v_item.product_id;
        END IF;

        IF v_product.status != 'active' THEN
            RAISE EXCEPTION 'Product % (%) is not available for purchase', v_product.name, v_product.id;
        END IF;

        IF v_product.stock_quantity < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', v_product.name, v_product.stock_quantity, v_item.quantity;
        END IF;

        -- Calculate line total
        v_line_total := v_product.price * v_item.quantity;
        v_subtotal := v_subtotal + v_line_total;

        -- Decrement stock safely
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = now()
        WHERE id = v_product.id;

        -- Insert order item snapshot
        INSERT INTO public.order_items (
            order_id,
            shop_id,
            product_id,
            product_name_snapshot,
            unit_price,
            quantity,
            line_total
        ) VALUES (
            v_order_id,
            v_shop.id,
            v_product.id,
            v_product.name,
            v_product.price,
            v_item.quantity,
            v_line_total
        );
    END LOOP;

    -- 6. Finalize Totals on Order Header
    v_total := v_subtotal + v_delivery_fee;
    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_total,
        updated_at = now()
    WHERE id = v_order_id;

    -- 7. Return Result Payload
    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_code', v_order_code,
        'subtotal', v_subtotal,
        'total', v_total,
        'shop_name', v_shop.name,
        'whatsapp_number', v_shop.whatsapp_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RESTORE STOCK STORED PROCEDURE (Order Cancellation)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_stock(
    p_product_id UUID,
    p_quantity INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity + p_quantity,
        updated_at = now()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
