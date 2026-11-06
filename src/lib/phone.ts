/**
 * Sri Lankan & International Phone Number Normalization & WhatsApp Utilities
 * KADEO Backend Engineering
 */

export function normalizePhoneNumber(raw: string | null | undefined): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  // Strip spaces, dashes, parentheses, dots
  let digits = trimmed.replace(/[\s\-\(\)\.]/g, "");

  // If starts with +, strip it
  if (digits.startsWith("+")) {
    digits = digits.substring(1);
  }

  // Handle Sri Lanka specific local formats:
  // 1. Starts with 0 followed by 9 digits (total 10 digits, e.g. 0771234567, 0112345678)
  if (/^0\d{9}$/.test(digits)) {
    return "94" + digits.substring(1);
  }

  // 2. Starts with 1-9 and is 9 digits (e.g. 771234567)
  if (/^[1-9]\d{8}$/.test(digits) && digits.length === 9) {
    return "94" + digits;
  }

  // 3. Already starts with 94 and has 11 digits (e.g. 94771234567)
  if (/^94\d{9}$/.test(digits)) {
    return digits;
  }

  // 4. Return remaining digits for general international E.164
  return digits.replace(/\D/g, "");
}

export function isValidPhoneNumber(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const normalized = normalizePhoneNumber(raw);

  // Sri Lankan number validation: 94 + 9 digits (total 11 digits)
  if (normalized.startsWith("94")) {
    // Mobile: 947XXXXXXXX (70, 71, 72, 74, 75, 76, 77, 78)
    // Landline: 94 followed by valid area code
    return /^94[1-9]\d{8}$/.test(normalized);
  }

  // General E.164 length: 8 to 15 digits
  return /^\d{8,15}$/.test(normalized);
}

export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const normalized = normalizePhoneNumber(raw);

  if (normalized.startsWith("94") && normalized.length === 11) {
    const area = normalized.substring(2, 4);
    const part1 = normalized.substring(4, 7);
    const part2 = normalized.substring(7);
    return `+94 ${area} ${part1} ${part2}`;
  }

  return normalized ? `+${normalized}` : "";
}

export function buildWhatsAppUrl(rawPhone: string | null | undefined, text?: string): string {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized) return "#";

  const baseUrl = `https://wa.me/${normalized}`;
  if (!text) return baseUrl;

  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}
