import { getAuthHeaders } from "@mercurjs/vendor";

declare const __BACKEND_URL__: string;

export interface TamadeeCategory {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description?: string | null;
  readonly is_active: boolean;
  readonly parent_category_id?: string | null;
}

export interface CreateTamadeeCategoryPayload {
  readonly name: string;
  readonly description?: string;
  readonly parent_category_id?: string | null;
}

export interface QuickProductVariantPayload {
  readonly title: string;
  readonly sku?: string;
  readonly price_thb: number;
  readonly stock_quantity: number;
}

export interface CreateQuickProductPayload {
  readonly title: string;
  readonly description?: string;
  readonly category_id?: string | null;
  readonly thumbnail?: string;
  readonly images?: string[];
  readonly weight_grams?: number;
  readonly option_title?: string;
  readonly publish_immediately: boolean;
  readonly variants: QuickProductVariantPayload[];
}

export interface CreateQuickProductResponse {
  readonly product: {
    readonly id: string;
    readonly title: string;
    readonly handle: string;
    readonly status: string;
  };
  readonly offers: Array<{
    readonly id: string;
    readonly variant_id: string;
    readonly sku: string | null;
  }>;
  readonly provisioned_fulfillment: boolean;
}

interface ErrorResponseBody {
  readonly message?: string;
}

function getBaseUrl(): string {
  return typeof __BACKEND_URL__ === "string" && __BACKEND_URL__.length > 0
    ? __BACKEND_URL__.replace(/\/+$/, "")
    : "";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorResponseBody;
    if (body?.message) {
      return body.message;
    }
  } catch {
    // Fallback to HTTP status text
  }
  return `คำขอล้มเหลว (${response.status})`;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(init.body ? { "Content-Type": "application/json" } : {}),
  };

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    credentials: "omit",
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}

export async function listTamadeeCategories(): Promise<TamadeeCategory[]> {
  const data = await requestJson<{ product_categories: TamadeeCategory[] }>(
    "/vendor/tamadee/categories"
  );
  return data.product_categories ?? [];
}

export async function createTamadeeCategory(
  payload: CreateTamadeeCategoryPayload
): Promise<TamadeeCategory> {
  const data = await requestJson<{ product_category: TamadeeCategory }>(
    "/vendor/tamadee/categories",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return data.product_category;
}

export async function createTamadeeQuickProduct(
  payload: CreateQuickProductPayload
): Promise<CreateQuickProductResponse> {
  return requestJson<CreateQuickProductResponse>(
    "/vendor/tamadee/quick-products",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function uploadVendorImage(file: File): Promise<string> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch(`${getBaseUrl()}/vendor/uploads`, {
    method: "POST",
    credentials: "omit",
    headers: authHeaders,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as {
    files?: Array<{ url?: string }>;
  };
  const url = data.files?.[0]?.url;
  if (!url) {
    throw new Error("ไม่ได้รับ URL รูปภาพจากเซิร์ฟเวอร์");
  }
  return url;
}
