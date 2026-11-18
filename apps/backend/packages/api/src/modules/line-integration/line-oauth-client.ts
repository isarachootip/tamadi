import { z } from "@medusajs/framework/zod";

const LineTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  id_token: z.string().optional(),
  token_type: z.string(),
  expires_in: z.number(),
});

const LineProfileResponseSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1),
  pictureUrl: z.string().url().optional(),
});

const LineIdTokenPayloadSchema = z.object({
  email: z.string().email().optional(),
});

export interface VerifiedLineUserProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly pictureUrl?: string;
  readonly email?: string;
}

export function buildLineAuthorizeUrl(input: {
  readonly channelId: string;
  readonly callbackUrl: string;
  readonly state: string;
  readonly requestEmail?: boolean;
}): string {
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.channelId);
  url.searchParams.set("redirect_uri", input.callbackUrl);
  url.searchParams.set("state", input.state);
  url.searchParams.set(
    "scope",
    input.requestEmail ? "profile openid email" : "profile openid"
  );
  url.searchParams.set("bot_prompt", "normal");
  return url.toString();
}

function extractEmailFromIdToken(idToken: string | undefined): string | undefined {
  if (!idToken) return undefined;
  const parts = idToken.split(".");
  if (parts.length !== 3 || !parts[1]) return undefined;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const parsed = LineIdTokenPayloadSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data.email : undefined;
  } catch {
    return undefined;
  }
}

export async function exchangeLineAuthCode(input: {
  readonly code: string;
  readonly channelId: string;
  readonly channelSecret: string;
  readonly callbackUrl: string;
  readonly fetchFn?: typeof fetch;
}): Promise<VerifiedLineUserProfile> {
  const fetchImpl = input.fetchFn ?? fetch;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.callbackUrl,
    client_id: input.channelId,
    client_secret: input.channelSecret,
  });

  const tokenRes = await fetchImpl("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });

  if (!tokenRes.ok) {
    throw new Error(`LINE token exchange failed (${tokenRes.status})`);
  }

  const tokenData = LineTokenResponseSchema.parse(await tokenRes.json());

  const profileRes = await fetchImpl("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!profileRes.ok) {
    throw new Error(`LINE profile fetch failed (${profileRes.status})`);
  }

  const profile = LineProfileResponseSchema.parse(await profileRes.json());

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
    email: extractEmailFromIdToken(tokenData.id_token),
  };
}
