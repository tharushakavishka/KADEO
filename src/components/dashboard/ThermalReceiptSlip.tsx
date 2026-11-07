"use client";

import {
  OrderThermalReceipt,
  OrderThermalReceiptProps,
  OrderReceiptItem,
} from "@/components/shared/OrderThermalReceipt";

export type { OrderThermalReceiptProps, OrderReceiptItem };

export function ThermalReceiptSlip(props: OrderThermalReceiptProps) {
  return <OrderThermalReceipt {...props} />;
}

export { OrderThermalReceipt };
export default ThermalReceiptSlip;
