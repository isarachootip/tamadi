import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseBackendEnv } from "../../../../config/env";
import {
  signLineOAuthState,
  validateReturnToUrl,
} from "../../../../modules/line-integration/line-crypto";
import { buildLineAuthorizeUrl } from "../../../../modules/line-integration/line-oauth-client";

const DEFAULT_RETURN_TO =
  "https://tamdi.tamadee.online/api/auth/line/complete";

function buildErrorRedirect(returnTo: string, errorCode: string): string {
  const fallbackLogin = new URL("/account/login", returnTo);
  fallbackLogin.searchParams.set("line_error", errorCode);
  return fallbackLogin.toString();
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const env = parseBackendEnv(process.env);
  const rawReturnTo =
    typeof req.query["return_to"] === "string"
      ? req.query["return_to"]
      : DEFAULT_RETURN_TO;

  const validatedReturnTo =
    validateReturnToUrl(rawReturnTo) ?? DEFAULT_RETURN_TO;

  if (
    !env.lineAuthEnabled ||
    !env.lineLoginChannelId ||
    !env.lineLoginChannelSecret
  ) {
    res.redirect(302, buildErrorRedirect(validatedReturnTo, "not_configured"));
    return;
  }

  const callbackUrl = `${env.publicBackendUrl}/auth/line/callback`;
  const state = signLineOAuthState(validatedReturnTo, env.jwtSecret);
  const authorizeUrl = buildLineAuthorizeUrl({
    channelId: env.lineLoginChannelId,
    callbackUrl,
    state,
  });

  res.redirect(302, authorizeUrl);
}
