/**
 * Helper to resolve Sri Lankan courier public tracking URLs.
 */
export function getCourierTrackingUrl(
  courierName?: string | null,
  trackingNumber?: string | null
): string | null {
  if (!courierName) return null;
  const name = courierName.trim().toLowerCase();
  const waybill = (trackingNumber || "").trim();

  if (name.includes("domex")) {
    return waybill
      ? `https://www.domex.lk/tracking?tracking_no=${encodeURIComponent(waybill)}`
      : "https://www.domex.lk/";
  }

  if (name.includes("koombiyo")) {
    return waybill
      ? `https://koombiyodelivery.lk/track?waybill=${encodeURIComponent(waybill)}`
      : "https://koombiyodelivery.lk/";
  }

  if (name.includes("pronto")) {
    return "https://prontolanka.com/tracking/";
  }

  if (name.includes("prompt")) {
    return waybill
      ? `https://promptx.lk/track/${encodeURIComponent(waybill)}`
      : "https://promptx.lk/";
  }

  if (name.includes("fardar")) {
    return waybill
      ? `https://fardarexpress.com/track/${encodeURIComponent(waybill)}`
      : "https://fardarexpress.com/";
  }

  if (name.includes("post") || name.includes("speed")) {
    return "http://track.slpost.gov.lk/";
  }

  return null;
}
