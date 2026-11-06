export type ManualPaymentMethod = "cash" | "bank_transfer" | "other_manual";
export type PaymentRecordStatus = "recorded" | "voided";

export interface OrderPaymentRecord {
  id: string;
  order_id: string;
  shop_id: string;
  amount: number;
  payment_method: ManualPaymentMethod;
  status: PaymentRecordStatus;
  recorded_by: string;
  notes?: string | null;
  voided_at?: string | null;
  voided_by?: string | null;
  void_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderPaymentSummary {
  orderId: string;
  orderCode: string;
  orderTotal: number;
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
  currency: string;
  payments: OrderPaymentRecord[];
}
