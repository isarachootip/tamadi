export interface JsonResponse<T> {
  readonly status: number;
  readonly headers: Headers;
  readonly data: T;
}

export function assertCondition(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(`[Phase 1 Verification Failed] ${message}`);
  }
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {}
): Promise<JsonResponse<T>> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  let parsed: unknown = {};
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        `Expected JSON from ${path} (HTTP ${res.status}), got: ${text.slice(0, 180)}`
      );
    }
  }
  return {
    status: res.status,
    headers: res.headers,
    data: parsed as T,
  };
}
