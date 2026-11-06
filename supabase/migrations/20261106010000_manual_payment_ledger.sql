-- ============================================================================
-- Migration: 20261106010000_manual_payment_ledger.sql
-- Description: Offline manual cash & bank transfer ledger contract and orders idempotency.
-- Multi-tenant isolation: enforces shop ownership and prevents presenting fulfillment as paid.
-- ============================================================================

-- 1. Ensure idempotency_key column on orders for durable duplicate-submit protection
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_shop_idempotency 
    ON public.orders(shop_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- 2. Create order_payments table
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'other_manual')),
    status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'voided')),
    recorded_by UUID NOT NULL REFERENCES public.profiles(id),
    notes TEXT,
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES public.profiles(id),
    void_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order ON public.order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_shop ON public.order_payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_status ON public.order_payments(status);

-- Enable Row Level Security
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Shop owners and administrators can view and manage their shop's payments
CREATE POLICY "Sellers can view and manage their order payments"
ON public.order_payments
FOR ALL
TO authenticated
USING (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_shop_owner(shop_id, auth.uid()) OR public.is_admin(auth.uid()));


-- Enforce that recorded payments cannot exceed order total
CREATE OR REPLACE FUNCTION public.check_order_payment_total()
RETURNS TRIGGER AS $$
DECLARE
    v_order_total NUMERIC(12, 2);
    v_total_paid NUMERIC(12, 2);
BEGIN
    IF NEW.status = 'recorded' THEN
        SELECT total INTO v_order_total FROM public.orders WHERE id = NEW.order_id FOR UPDATE;
        SELECT COALESCE(SUM(amount), 0) INTO v_total_paid FROM public.order_payments 
        WHERE order_id = NEW.order_id AND status = 'recorded' AND id != NEW.id;
        
        IF (v_total_paid + NEW.amount) > v_order_total THEN
            RAISE EXCEPTION 'Total recorded payments (%) would exceed order total (%)', (v_total_paid + NEW.amount), v_order_total;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_order_payment_total ON public.order_payments;
CREATE TRIGGER trg_check_order_payment_total
BEFORE INSERT OR UPDATE ON public.order_payments
FOR EACH ROW
EXECUTE FUNCTION public.check_order_payment_total();
