import crypto from "node:crypto";
import { z } from "@medusajs/framework/zod";

const ALLOWED_RETURN_HOSTS = new Set([
  "tamdi.tamadee.online",
  "webtamdi.tamadee.online",
  "m.tamadee.online",
  "localhost",
  "127.0.0.1",
]);

const SignedStatePayloadSchema = z.object({
  returnTo: z.string().url(),
  nonce: z.string().min(8),
  exp: z.number().int().positive(),
});

export interface ExchangePayload {
  readonly jwtToken: string;
  readonly displayName: string;
}

export function validateReturnToUrl(
  rawUrl: string | null | undefined
): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (!ALLOWED_RETURN_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }
    if (
      parsed.protocol === "http:" &&
      parsed.hostname !== "localhost" &&
      parsed.hostname !== "127.0.0.1"
    ) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function signLineOAuthState(
  returnTo: string,
  secret: string,
  nowMs = Date.now(),
  ttlMs = 10 * 60_000
): string {
  const payload = JSON.stringify({
    returnTo,
    nonce: crypto.randomBytes(12).toString("hex"),
    exp: nowMs + ttlMs,
  });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(encoded, "utf8")
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyLineOAuthState(
  stateToken: string,
  secret: string,
  nowMs = Date.now()
): { readonly returnTo: string } | null {
  const dotIdx = stateToken.indexOf(".");
  if (dotIdx <= 0) return null;
  const encoded = stateToken.slice(0, dotIdx);
  const actualSig = stateToken.slice(dotIdx + 1);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encoded, "utf8")
    .digest("base64url");

  const bufA = Buffer.from(actualSig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = SignedStatePayloadSchema.parse(JSON.parse(decoded));
    if (parsed.exp < nowMs) return null;
    const safeUrl = validateReturnToUrl(parsed.returnTo);
    return safeUrl ? { returnTo: safeUrl } : null;
  } catch {
    return null;
  }
}

export class SingleUseCodeStore {
  private readonly entries = new Map<
    string,
    { expiresAt: number; payload: ExchangePayload }
  >();

  public constructor(private readonly ttlMs = 60_000) {}

  public issue(payload: ExchangePayload, nowMs = Date.now()): string {
    this.prune(nowMs);
    const code = crypto.randomBytes(24).toString("base64url");
    this.entries.set(code, { expiresAt: nowMs + this.ttlMs, payload });
    return code;
  }

  public consume(code: string, nowMs = Date.now()): ExchangePayload | null {
    const found = this.entries.get(code);
    this.entries.delete(code);
    if (!found || found.expiresAt < nowMs) {
      return null;
    }
    return found.payload;
  }

  private prune(nowMs: number): void {
    for (const [k, val] of this.entries.entries()) {
      if (val.expiresAt < nowMs) {
        this.entries.delete(k);
      }
    }
  }
}

export const sharedLineExchangeStore = new SingleUseCodeStore(60_000);

export function verifyLineWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  channelSecret: string
): boolean {
  if (!signatureHeader || !channelSecret) return false;
  const expected = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");
  const bufActual = Buffer.from(signatureHeader.trim(), "utf8");
  const bufExpected = Buffer.from(expected, "utf8");
  if (bufActual.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufActual, bufExpected);
}
