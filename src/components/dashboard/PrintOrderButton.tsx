"use client";

export function PrintOrderButton() {
  return <><button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Print order receipt</button>
    <style>{`@media print {
      body * { visibility: hidden; }
      #order-receipt, #order-receipt * { visibility: visible; }
      #order-receipt { position: absolute; left: 0; top: 0; width: 100%; max-width: none; color: black; }
      #order-receipt button, #order-receipt form, #order-receipt a { display: none !important; }
    }`}</style></>;
}
