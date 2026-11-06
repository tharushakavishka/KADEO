export interface SessionPayload {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  iat?: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || typeof secret !== "string" || !secret.trim()) {
    return null;
  }
  return secret.trim();
}

function getEncoder(): TextEncoder {
  const TE = typeof TextEncoder !== "undefined" ? TextEncoder : (globalThis as any).TextEncoder;
  return new TE();
}

function getDecoder(): TextDecoder {
  const TD = typeof TextDecoder !== "undefined" ? TextDecoder : (globalThis as any).TextDecoder;
  return new TD();
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64url");
  }
  const utf8Bytes = getEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const btoaFn = typeof btoa !== "undefined" ? btoa : (globalThis as any).btoa;
  return btoaFn(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64url, "base64url").toString("utf8");
  }
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  const atobFn = typeof atob !== "undefined" ? atob : (globalThis as any).atob;
  const binary = atobFn(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return getDecoder().decode(bytes);
}

/**
 * Creates a cryptographically signed session token for the given user payload
 * using standard Web Crypto API (crypto.subtle).
 * Zero Node.js 'crypto' module imports - natively runs in Edge Runtime, Node.js 18+, and browsers.
 * Format: ${base64urlPayload}.${hmacSignatureHex}
 */
export async function createSignedSession(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    return "";
  }
  const data: SessionPayload = {
    ...payload,
    iat: payload.iat || Date.now(),
  };
  const jsonStr = JSON.stringify(data);
  const b64 = toBase64Url(jsonStr);

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is not available.");
  }
  const enc = getEncoder();
  const key = await subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await subtle.sign("HMAC", key, enc.encode(b64));
  const hmacHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${b64}.${hmacHex}`;
}

/**
 * Strictly verifies the session token signature and structure using Web Crypto API (crypto.subtle).
 * Rejects unsigned, forged, tampered, or malformed tokens with constant-time verification.
 * Returns null if the token cannot be cryptographically proven.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) {
    // Unsigned raw string or malformed format: strictly reject to prevent identity forgery
    return null;
  }

  const [b64, signature] = parts;
  if (!b64 || !signature || signature.length % 2 !== 0) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;

  try {
    const sigBytes = new Uint8Array(signature.length / 2);
    for (let i = 0; i < signature.length; i += 2) {
      const byte = parseInt(signature.substring(i, i + 2), 16);
      if (isNaN(byte)) return null;
      sigBytes[i / 2] = byte;
    }

    const enc = getEncoder();
    const key = await subtle.importKey(
      "raw",
      enc.encode(secret!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await subtle.verify("HMAC", key, sigBytes, enc.encode(b64));
    if (!isValid) return null;
  } catch {
    return null;
  }

  try {
    const jsonStr = fromBase64Url(b64);
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.id !== "string" || !parsed.id.trim()) return null;
    if (typeof parsed.email !== "string" || !parsed.email.includes("@")) return null;

    const now = Date.now();
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days max lifetime
    if (typeof parsed.iat !== "number" || isNaN(parsed.iat)) {
      return null;
    }
    if (parsed.iat > now + 60000) {
      return null; // Clock skew in future
    }
    if (now - parsed.iat > maxAgeMs) {
      return null; // Expired session
    }

    return {
      id: parsed.id.trim(),
      email: parsed.email.trim().toLowerCase(),
      full_name: typeof parsed.full_name === "string" ? parsed.full_name : undefined,
      role: typeof parsed.role === "string" ? parsed.role : undefined,
      iat: parsed.iat,
    };
  } catch {
    return null;
  }
}
