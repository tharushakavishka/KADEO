-- ============================================================================
-- KADEO: Seed Data for Testing & Demonstration
-- File: supabase/seed.sql
-- ============================================================================

-- 1. Create a Demo Seller Profile (Matches a demo user or test merchant)
-- UUID placeholder: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
INSERT INTO public.profiles (id, full_name, email, role)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kasun Perera', 'kasun@ceylonlinen.lk', 'seller'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Super Admin', 'admin@kadeo.lk', 'admin')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 2. Create Demo Store: Ceylon Linen (Slug: ceylon-linen)
INSERT INTO public.shops (
    id,
    owner_id,
    name,
    slug,
    description,
    whatsapp_number,
    contact_email,
    address,
    theme_id,
    status
) VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Ceylon Linen',
    'ceylon-linen',
    'Premium pure linen clothing, handcrafted sarees, and artisanal home essentials made in Sri Lanka.',
    '94771234567',
    'hello@ceylonlinen.lk',
    'No. 45, Galle Road, Colombo 03, Sri Lanka',
    'minimal',
    'active'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Settings & Free Subscription
INSERT INTO public.shop_settings (shop_id, primary_color, secondary_color, currency, delivery_information, store_visibility)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    '#18181b',
    '#71717a',
    'LKR',
    'Island-wide cash on delivery (COD) or bank deposit. Delivery within 2-3 business days in Western Province, 3-5 days outstation.',
    true
) ON CONFLICT (shop_id) DO NOTHING;

INSERT INTO public.subscriptions (shop_id, plan_id, status, billing_period)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'free',
    'active',
    'monthly'
) ON CONFLICT (shop_id) DO NOTHING;

-- 4. Categories for Ceylon Linen
INSERT INTO public.categories (id, shop_id, name, slug, description, sort_order)
VALUES 
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Men''s Linen', 'mens-linen', 'Breathable pure linen shirts and casual trousers.', 1),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Women''s Wear', 'womens-wear', 'Relaxed linen dresses, tops and summer coordinates.', 2),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Living & Dining', 'living-dining', 'Linen table runners, cushion covers and kitchen textiles.', 3)
ON CONFLICT (shop_id, slug) DO NOTHING;

-- 5. Products
INSERT INTO public.products (id, shop_id, category_id, name, slug, description, sku, price, compare_at_price, stock_quantity, status)
VALUES 
    (
        'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        'Pure White Linen Mandarin Shirt',
        'pure-white-linen-mandarin-shirt',
        'Tailored from 100% organic European flax. Features a contemporary band collar and wooden buttons. Lightweight and naturally temperature-regulating.',
        'CLN-MS-001',
        5850.00,
        6500.00,
        25,
        'active'
    ),
    (
        'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        'Olive Green Relaxed Drawstring Trouser',
        'olive-green-relaxed-drawstring-trouser',
        'Comfortable mid-rise linen trousers with an elasticated waistband and internal drawstring cord. Perfect for tropical wear.',
        'CLN-MT-002',
        6200.00,
        null,
        18,
        'active'
    ),
    (
        'e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        'Natural Oatmeal Sleeveless Linen Midi Dress',
        'natural-oatmeal-sleeveless-linen-midi-dress',
        'Effortless A-line silhouette with side pockets and a subtle back slit. Pre-washed for buttery softness from day one.',
        'CLN-WD-003',
        7900.00,
        8900.00,
        12,
        'active'
    ),
    (
        'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        'Artisanal Fringed Linen Table Runner (Set of 1)',
        'artisanal-fringed-linen-table-runner',
        'Hand-woven textured natural linen table runner featuring frayed edges for an earthy dining aesthetic.',
        'CLN-HD-004',
        3400.00,
        null,
        30,
        'active'
    )
ON CONFLICT (shop_id, slug) DO NOTHING;

-- 6. High-Quality Images (Unsplash Photography)
INSERT INTO public.product_images (product_id, shop_id, storage_path, alt_text, sort_order)
VALUES 
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', 'White linen shirt', 0),
    ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80', 'Olive trousers', 0),
    ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', 'Linen dress', 0),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80', 'Table runner', 0)
ON CONFLICT DO NOTHING;

-- 7. Sample Customers & Orders
INSERT INTO public.customers (id, shop_id, full_name, phone, email, address)
VALUES 
    ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Naveen Jayasuriya', '0779876543', 'naveen@gmail.com', '12/4 Temple Road, Nugegoda'),
    ('f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Dilini Fernando', '0714567890', 'dilini.f@yahoo.com', '45 Beach Road, Mount Lavinia')
ON CONFLICT (shop_id, phone) DO NOTHING;

INSERT INTO public.orders (
    id, shop_id, customer_id, order_code, status, subtotal, delivery_fee, total, currency, customer_name_snapshot, customer_phone_snapshot, delivery_address_snapshot, order_note
) VALUES (
    'o1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'KAD-2026-000123',
    'pending',
    12050.00,
    350.00,
    12400.00,
    'LKR',
    'Naveen Jayasuriya',
    '0779876543',
    '12/4 Temple Road, Nugegoda',
    'Please call before delivery'
) ON CONFLICT (order_code) DO NOTHING;

INSERT INTO public.order_items (order_id, shop_id, product_id, product_name_snapshot, unit_price, quantity, line_total)
VALUES 
    ('o1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pure White Linen Mandarin Shirt', 5850.00, 1, 5850.00),
    ('o1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Olive Green Relaxed Drawstring Trouser', 6200.00, 1, 6200.00)
ON CONFLICT DO NOTHING;
