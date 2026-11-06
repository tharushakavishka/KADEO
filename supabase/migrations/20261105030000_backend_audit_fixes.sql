-- Migration: 20261105030000_backend_audit_fixes.sql
-- Description: Hardens order status updates, canonical schema alignment, and secure owner-independent customer tracking RPC.

-- 1. ATOMIC & SECURE ORDER STATUS UPDATE PROCEDURE (SELLER ONLY)
CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_shop_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_allowed TEXT[];
BEGIN
    -- 1. Authentication check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- 2. Authorization check: caller must be shop owner or platform admin
    IF NOT (public.is_shop_owner(p_shop_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
        RAISE EXCEPTION 'Permission denied: caller is not the owner of shop %', p_shop_id;
    END IF;

    -- 3. Row lock to prevent race conditions during concurrent status updates
    SELECT id, status, shop_id
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id AND shop_id = p_shop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or permission denied';
    END IF;

    -- 4. Idempotent: same status transition is a no-op that returns current state
    IF v_order.status = p_new_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'status', v_order.status
        );
    END IF;

    -- 5. Canonical state machine transitions: pending -> confirmed -> processing -> shipped -> completed
    CASE v_order.status
        WHEN 'pending' THEN v_allowed := ARRAY['confirmed', 'cancelled'];
        WHEN 'confirmed' THEN v_allowed := ARRAY['processing', 'cancelled'];
        WHEN 'processing' THEN v_allowed := ARRAY['shipped', 'cancelled'];
        WHEN 'shipped' THEN v_allowed := ARRAY['completed', 'cancelled'];
        WHEN 'completed' THEN v_allowed := ARRAY[]::TEXT[];
        WHEN 'cancelled' THEN v_allowed := ARRAY[]::TEXT[];
        ELSE v_allowed := ARRAY[]::TEXT[];
    END CASE;

    IF NOT (p_new_status = ANY(v_allowed)) THEN
        RAISE EXCEPTION 'Cannot transition order status from % to %', v_order.status, p_new_status;
    END IF;

    -- 6. Atomic stock restoration: restore inventory ONLY when first transitioning to cancelled
    IF p_new_status = 'cancelled' AND v_order.status != 'cancelled' THEN
        FOR v_item IN
            SELECT product_id, quantity
            FROM public.order_items
            WHERE order_id = p_order_id
        LOOP
            UPDATE public.products
            SET stock_quantity = stock_quantity + v_item.quantity,
                updated_at = now()
            WHERE id = v_item.product_id;
        END LOOP;
    END IF;

    -- 7. Update order status
    UPDATE public.orders
    SET status = p_new_status,
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'previous_status', v_order.status,
        'new_status', p_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Permissions hardening: only authenticated users can invoke update_order_status
REVOKE ALL ON FUNCTION public.update_order_status(UUID, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, UUID) TO authenticated;


-- 2. ENHANCE CHECKOUT PROCEDURE WITH STORE VISIBILITY & CANONICAL SCHEMA PARITY
CREATE OR REPLACE FUNCTION public.create_checkout_order(
    p_shop_slug TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_address TEXT,
    p_customer_email TEXT DEFAULT NULL,
    p_order_note TEXT DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_shop RECORD;
    v_settings RECORD;
    v_customer_id UUID;
    v_order_id UUID;
    v_order_code TEXT;
    v_item RECORD;
    v_product RECORD;
    v_subtotal NUMERIC(12, 2) := 0;
    v_delivery_fee NUMERIC(12, 2) := 0;
    v_total NUMERIC(12, 2) := 0;
    v_line_total NUMERIC(12, 2);
    v_year TEXT := to_char(now(), 'YYYY');
    v_random_code TEXT;
    v_wa_number TEXT;
BEGIN
    -- 1. Fetch Shop & Settings
    SELECT id, name, slug, whatsapp_number, status
    INTO v_shop
    FROM public.shops
    WHERE slug = p_shop_slug AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active shop not found with slug %', p_shop_slug;
    END IF;

    SELECT store_visibility
    INTO v_settings
    FROM public.shop_settings
    WHERE shop_id = v_shop.id;

    IF FOUND AND v_settings.store_visibility = false THEN
        RAISE EXCEPTION 'This store is currently private and not accepting orders.';
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

    -- 3. Generate Order Code
    LOOP
        v_random_code := 'KAD-' || v_year || '-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_random_code);
    END LOOP;
    v_order_code := v_random_code;

    -- 4. Create Order Header (Canonical schema parity with 20261105000000_initial_schema.sql)
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

    -- 5. Process Items and Lock Stock Atomically
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid quantity % for item', v_item.quantity;
        END IF;

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
            RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
                v_product.name, v_product.stock_quantity, v_item.quantity;
        END IF;

        v_line_total := v_product.price * v_item.quantity;
        v_subtotal := v_subtotal + v_line_total;

        -- Decrement stock
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = now()
        WHERE id = v_product.id;

        -- Insert line item (Canonical schema parity: includes shop_id, product_name_snapshot)
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

    v_total := v_subtotal + v_delivery_fee;

    -- Update Order Totals
    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_total,
        updated_at = now()
    WHERE id = v_order_id;

    -- Normalize WhatsApp number
    v_wa_number := REGEXP_REPLACE(v_shop.whatsapp_number, '[^0-9]', '', 'g');
    IF v_wa_number ~ '^0[0-9]{9}$' THEN
        v_wa_number := '94' || SUBSTRING(v_wa_number FROM 2);
    ELSIF v_wa_number ~ '^[1-9][0-9]{8}$' THEN
        v_wa_number := '94' || v_wa_number;
    END IF;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_code', v_order_code,
        'subtotal', v_subtotal,
        'total', v_total,
        'shop_name', v_shop.name,
        'whatsapp_number', v_wa_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Permissions hardening: checkout can be called by anonymous and authenticated visitors
REVOKE ALL ON FUNCTION public.create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;


-- 3. NARROWLY SCOPED, RLS-PRESERVING PUBLIC ORDER TRACKING RPC (Issue 11)
-- Allows buyers to track their own orders without exposing seller RLS orders table to public SELECT.
CREATE OR REPLACE FUNCTION public.track_customer_order(
    p_shop_slug TEXT,
    p_order_code TEXT,
    p_normalized_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_shop RECORD;
    v_order RECORD;
    v_items JSONB;
    v_clean_phone TEXT;
    v_order_phone_norm TEXT;
    v_wa_number TEXT;
BEGIN
    -- 1. Sanitize and validate inputs
    IF p_shop_slug IS NULL OR LENGTH(TRIM(p_shop_slug)) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Store slug is required.');
    END IF;

    IF p_order_code IS NULL OR LENGTH(TRIM(p_order_code)) < 4 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid order code.');
    END IF;

    IF p_normalized_phone IS NULL OR LENGTH(TRIM(p_normalized_phone)) < 8 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number.');
    END IF;

    -- Normalize provided phone to digits only
    v_clean_phone := REGEXP_REPLACE(p_normalized_phone, '[^0-9]', '', 'g');
    IF v_clean_phone ~ '^0[0-9]{9}$' THEN
        v_clean_phone := '94' || SUBSTRING(v_clean_phone FROM 2);
    ELSIF v_clean_phone ~ '^[1-9][0-9]{8}$' THEN
        v_clean_phone := '94' || v_clean_phone;
    END IF;

    -- 2. Lookup active shop
    SELECT id, name, slug, whatsapp_number
    INTO v_shop
    FROM public.shops
    WHERE slug = TRIM(p_shop_slug) AND status = 'active';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Store not found.');
    END IF;

    -- 3. Exact order code match scoped to this shop
    SELECT 
        id, 
        shop_id, 
        order_code, 
        status, 
        subtotal, 
        delivery_fee, 
        total, 
        currency,
        customer_name_snapshot,
        customer_phone_snapshot,
        delivery_address_snapshot,
        created_at,
        updated_at
    INTO v_order
    FROM public.orders
    WHERE shop_id = v_shop.id AND UPPER(TRIM(order_code)) = UPPER(TRIM(p_order_code));

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'No order found matching this order code and phone number. Please verify your details.'
        );
    END IF;

    -- 4. Cryptographic / verification boundary: strictly verify normalized phone number
    v_order_phone_norm := REGEXP_REPLACE(v_order.customer_phone_snapshot, '[^0-9]', '', 'g');
    IF v_order_phone_norm ~ '^0[0-9]{9}$' THEN
        v_order_phone_norm := '94' || SUBSTRING(v_order_phone_norm FROM 2);
    ELSIF v_order_phone_norm ~ '^[1-9][0-9]{8}$' THEN
        v_order_phone_norm := '94' || v_order_phone_norm;
    END IF;

    IF v_order_phone_norm != v_clean_phone THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'No order found matching this order code and phone number. Please verify your details.'
        );
    END IF;

    -- 5. Fetch safe item snapshots (canonical order_items table schema)
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'name', product_name_snapshot,
                'quantity', quantity,
                'unitPrice', unit_price,
                'lineTotal', line_total
            )
            ORDER BY created_at ASC
        ),
        '[]'::jsonb
    )
    INTO v_items
    FROM public.order_items
    WHERE order_id = v_order.id;

    -- 6. Format safe WhatsApp number
    v_wa_number := REGEXP_REPLACE(v_shop.whatsapp_number, '[^0-9]', '', 'g');
    IF v_wa_number ~ '^0[0-9]{9}$' THEN
        v_wa_number := '94' || SUBSTRING(v_wa_number FROM 2);
    ELSIF v_wa_number ~ '^[1-9][0-9]{8}$' THEN
        v_wa_number := '94' || v_wa_number;
    END IF;

    -- 7. Return safe, minimal customer-facing tracking response
    RETURN jsonb_build_object(
        'success', true,
        'order', jsonb_build_object(
            'orderCode', v_order.order_code,
            'status', v_order.status,
            'createdAt', v_order.created_at,
            'updatedAt', v_order.updated_at,
            'subtotal', v_order.subtotal,
            'deliveryFee', v_order.delivery_fee,
            'total', v_order.total,
            'currency', v_order.currency,
            'customerName', v_order.customer_name_snapshot,
            'deliveryAddress', v_order.delivery_address_snapshot,
            'items', v_items,
            'shopName', v_shop.name,
            'whatsappNumber', v_wa_number
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke all permissions from public, grant strictly to anon and authenticated callers
REVOKE ALL ON FUNCTION public.track_customer_order(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_customer_order(TEXT, TEXT, TEXT) TO anon, authenticated;
