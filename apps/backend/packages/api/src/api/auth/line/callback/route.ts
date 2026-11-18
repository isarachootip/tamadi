import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseBackendEnv } from "../../../../config/env";
import {
  sharedLineExchangeStore,
  verifyLineOAuthState,
} from "../../../../modules/line-integration/line-crypto";
import { provisionLineCustomerAndJwt } from "../../../../modules/line-integration/line-customer-service";
import { exchangeLineAuthCode } from "../../../../modules/line-integration/line-oauth-client";

const FALLBACK_ORIGIN = "https://tamdi.tamadee.online";

function redirectWithError(
  res: MedusaResponse,
  originUrl: string,
  code: string
): void {
  const loginUrl = new URL("/account/login", originUrl);
  loginUrl.searchParams.set("line_error", code);
  res.redirect(302, loginUrl.toString());
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const env = parseBackendEnv(process.env);
  const stateParam =
    typeof req.query["state"] === "string" ? req.query["state"] : "";
  const codeParam =
    typeof req.query["code"] === "string" ? req.query["code"] : "";

  const verifiedState = stateParam
    ? verifyLineOAuthState(stateParam, env.jwtSecret)
    : null;
  if (!verifiedState) {
    redirectWithError(res, FALLBACK_ORIGIN, "invalid_state");
    return;
  }

  if (
    !codeParam ||
    !env.lineAuthEnabled ||
    !env.lineLoginChannelId ||
    !env.lineLoginChannelSecret
  ) {
    redirectWithError(res, verifiedState.returnTo, "cancelled");
    return;
  }

  try {
    const callbackUrl = `${env.publicBackendUrl}/auth/line/callback`;
    const profile = await exchangeLineAuthCode({
      code: codeParam,
      channelId: env.lineLoginChannelId,
      channelSecret: env.lineLoginChannelSecret,
      callbackUrl,
    });

    const session = await provisionLineCustomerAndJwt(req.scope, profile);
    const exchangeCode = sharedLineExchangeStore.issue({
      jwtToken: session.jwtToken,
      displayName: session.displayName,
    });

    const target = new URL(verifiedState.returnTo);
    target.searchParams.set("exchange_code", exchangeCode);
    res.redirect(302, target.toString());
  } catch {
    redirectWithError(res, verifiedState.returnTo, "oauth_failed");
  }
}
