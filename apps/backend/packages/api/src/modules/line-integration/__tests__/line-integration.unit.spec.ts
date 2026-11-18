import crypto from "node:crypto";
import { parseBackendEnv } from "../../../config/env";
import {
  signLineOAuthState,
  SingleUseCodeStore,
  validateReturnToUrl,
  verifyLineOAuthState,
  verifyLineWebhookSignature,
} from "../line-crypto";
import {
  formatOrderNotificationText,
  sendLinePushNotification,
} from "../line-messaging";
import {
  buildLineAuthorizeUrl,
  exchangeLineAuthCode,
} from "../line-oauth-client";

describe("Phase 5.3 LINE Login & Messaging Integration", () => {
  it("parses LINE configuration and feature toggles from BackendEnv", () => {
    const defaults = parseBackendEnv({});
    expect(defaults.lineAuthEnabled).toBe(true);
    expect(defaults.lineNotificationsEnabled).toBe(true);
    expect(defaults.lineLoginChannelId).toBeUndefined();

    const custom = parseBackendEnv({
      LINE_AUTH_ENABLED: "false",
      LINE_NOTIFICATIONS_ENABLED: "false",
      LINE_LOGIN_CHANNEL_ID: "2001234567",
      LINE_LOGIN_CHANNEL_SECRET: "line_login_secret",
      LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "line_oa_token",
      LINE_MESSAGING_CHANNEL_SECRET: "line_oa_secret",
    });
    expect(custom.lineAuthEnabled).toBe(false);
    expect(custom.lineNotificationsEnabled).toBe(false);
    expect(custom.lineLoginChannelId).toBe("2001234567");
  });

  it("enforces strict return_to whitelist and blocks open redirects", () => {
    expect(
      validateReturnToUrl(
        "https://tamdi.tamadee.online/api/auth/line/complete"
      )
    ).toBe("https://tamdi.tamadee.online/api/auth/line/complete");
    expect(
      validateReturnToUrl(
        "https://webtamdi.tamadee.online/api/auth/line/complete"
      )
    ).toBe("https://webtamdi.tamadee.online/api/auth/line/complete");
    expect(
      validateReturnToUrl("https://m.tamadee.online/account/line-callback")
    ).toBe("https://m.tamadee.online/account/line-callback");
    expect(validateReturnToUrl("https://evil.example.com/phish")).toBeNull();
    expect(validateReturnToUrl("javascript:alert(1)")).toBeNull();
  });

  it("signs and verifies HMAC OAuth state and rejects tampering or expiry", () => {
    const secret = "test_jwt_secret_for_line_state_32chars";
    const state = signLineOAuthState(
      "https://tamdi.tamadee.online/api/auth/line/complete",
      secret,
      10_000
    );
    const verified = verifyLineOAuthState(state, secret, 15_000);
    expect(verified?.returnTo).toBe(
      "https://tamdi.tamadee.online/api/auth/line/complete"
    );

    expect(verifyLineOAuthState(`${state}tampered`, secret, 15_000)).toBeNull();
    expect(verifyLineOAuthState(state, secret, 900_000)).toBeNull();
  });

  it("issues single-use 60s exchange codes and blocks replay attacks", () => {
    const store = new SingleUseCodeStore(60_000);
    const code = store.issue(
      { jwtToken: "medusa_jwt_123", displayName: "สมชาย" },
      1000
    );
    expect(store.consume(code, 5000)).toEqual({
      jwtToken: "medusa_jwt_123",
      displayName: "สมชาย",
    });
    expect(store.consume(code, 6000)).toBeNull();
  });

  it("verifies authentic x-line-signature HMAC and rejects forged signatures", () => {
    const channelSecret = "line_messaging_secret_key";
    const rawBody = JSON.stringify({ events: [{ type: "follow" }] });
    const validSig = crypto
      .createHmac("sha256", channelSecret)
      .update(rawBody, "utf8")
      .digest("base64");

    expect(verifyLineWebhookSignature(rawBody, validSig, channelSecret)).toBe(
      true
    );
    expect(
      verifyLineWebhookSignature(rawBody, "forged_signature==", channelSecret)
    ).toBe(false);
  });

  it("builds LINE authorize URL with bot_prompt=normal and exchanges auth code", async () => {
    const url = buildLineAuthorizeUrl({
      channelId: "200999888",
      callbackUrl: "https://bwebtamdi.tamadee.online/auth/line/callback",
      state: "signed_state_abc",
    });
    expect(url).toContain("https://access.line.me/oauth2/v2.1/authorize?");
    expect(url).toContain("bot_prompt=normal");

    const mockFetch: typeof fetch = async (input) => {
      const target = String(input);
      if (target.includes("/oauth2/v2.1/token")) {
        return new Response(
          JSON.stringify({
            access_token: "line_access_tok",
            token_type: "Bearer",
            expires_in: 2592000,
          }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({
          userId: "U1234567890abcdef",
          displayName: "คุณลินิน",
          pictureUrl: "https://profile.line-scdn.net/avatar.jpg",
        }),
        { status: 200 }
      );
    };

    const profile = await exchangeLineAuthCode({
      code: "auth_code_xyz",
      channelId: "200999888",
      channelSecret: "secret_xyz",
      callbackUrl: "https://bwebtamdi.tamadee.online/auth/line/callback",
      fetchFn: mockFetch,
    });

    expect(profile.userId).toBe("U1234567890abcdef");
    expect(profile.displayName).toBe("คุณลินิน");
  });

  it("formats Thai order status messages and sends LINE Push notifications", async () => {
    const msg = formatOrderNotificationText({
      eventType: "order.placed",
      orderDisplayId: "1042",
      totalThb: 1680,
      sellerName: "ลินินละไม สตูดิโอ",
    });
    expect(msg).toContain("#1042");
    expect(msg).toContain("฿1,680");

    let pushedTo = "";
    const mockFetch: typeof fetch = async (_url, init) => {
      const parsed = JSON.parse(String(init?.body ?? "{}")) as { to: string };
      pushedTo = parsed.to;
      return new Response("{}", { status: 200 });
    };

    const sent = await sendLinePushNotification({
      channelAccessToken: "oa_access_token",
      lineUserId: "U1234567890abcdef",
      text: msg,
      fetchFn: mockFetch,
    });
    expect(sent).toBe(true);
    expect(pushedTo).toBe("U1234567890abcdef");
  });
});
