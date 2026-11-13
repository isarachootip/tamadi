import type { z } from "zod";
import { getStorefrontEnv } from "./env";

export class MercurApiError extends Error {
  public readonly statusCode: number | undefined;

  public constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "MercurApiError";
    this.statusCode = statusCode;
  }
}

export interface MercurRequestOptions<TSchema extends z.ZodType> {
  readonly method?: "GET" | "POST" | "DELETE";
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | undefined>>;
  readonly body?: Readonly<Record<string, unknown>>;
  readonly bearerToken?: string;
  readonly revalidateSeconds?: number | false;
  readonly schema: TSchema;
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Readonly<Record<string, string | number | undefined>>
): string {
  const url = new URL(path, `${baseUrl}/`);
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && String(val).length > 0) {
        url.searchParams.set(key, String(val));
      }
    }
  }
  return url.toString();
}

function extractErrorMessage(raw: unknown, status: number): string {
  if (typeof raw === "object" && raw !== null && "message" in raw) {
    const msg = (raw as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) {
      return msg.trim();
    }
  }
  if (status === 401) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือเซสชันหมดอายุ";
  }
  return `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Tamadee ได้ (HTTP ${status})`;
}

export async function mercurFetch<TSchema extends z.ZodType>(
  options: MercurRequestOptions<TSchema>
): Promise<z.infer<TSchema>> {
  const env = getStorefrontEnv();
  const method = options.method ?? "GET";

  if (options.path.startsWith("/store") && env.publishableKey.length === 0) {
    throw new MercurApiError(
      "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_PUBLISHABLE_KEY ในไฟล์ .env.local"
    );
  }

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (env.publishableKey.length > 0) {
    reqHeaders["x-publishable-api-key"] = env.publishableKey;
  }
  if (options.bearerToken && options.bearerToken.length > 0) {
    reqHeaders["Authorization"] = `Bearer ${options.bearerToken}`;
  }

  const url = buildUrl(env.mercurBackendUrl, options.path, options.query);
  const fetchInit: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers: reqHeaders,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  };

  if (method === "GET" && typeof options.revalidateSeconds === "number") {
    fetchInit.next = { revalidate: options.revalidateSeconds };
  } else {
    fetchInit.cache = "no-store";
  }

  let response: Response;
  try {
    response = await fetch(url, fetchInit);
  } catch {
    throw new MercurApiError("ไม่สามารถเชื่อมต่อกับระบบหลังบ้าน Tamadee ได้ในขณะนี้");
  }

  const text = await response.text();
  let jsonData: unknown = {};
  if (text.length > 0) {
    try {
      jsonData = JSON.parse(text) as unknown;
    } catch {
      throw new MercurApiError("ข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่อยู่ในรูปแบบ JSON", response.status);
    }
  }

  if (!response.ok) {
    throw new MercurApiError(
      extractErrorMessage(jsonData, response.status),
      response.status
    );
  }

  return options.schema.parse(jsonData);
}
