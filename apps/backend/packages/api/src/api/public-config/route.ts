import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

let cachedPublishableKey: { token: string; expiresAt: number } | null = null;

function setPublicCorsHeaders(res: MedusaResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

export async function OPTIONS(
  _req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  setPublicCorsHeaders(res);
  res.status(204).end();
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  setPublicCorsHeaders(res);
  const now = Date.now();
  if (cachedPublishableKey && cachedPublishableKey.expiresAt > now) {
    res.status(200).json({ publishableApiKey: cachedPublishableKey.token });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["token", "revoked_at"],
    filters: { type: "publishable" },
  });

  const rows = data as { token?: string; revoked_at?: string | null }[];
  const active = rows.find(
    (row) => !row.revoked_at && typeof row.token === "string" && row.token.startsWith("pk_")
  );

  if (!active?.token) {
    res.status(404).json({ publishableApiKey: "" });
    return;
  }

  cachedPublishableKey = { token: active.token, expiresAt: now + 300_000 };
  res.status(200).json({ publishableApiKey: active.token });
}
