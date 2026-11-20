import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ProductStatus, SellerStatus } from "@mercurjs/types";

interface SellerScopedRequest extends MedusaRequest {
  seller_context?: { seller_id?: string };
}

export interface VendorProductDefaultsOptions {
  readonly defaultPublished: boolean;
  readonly productRequestEnabled: boolean;
}

export interface VendorProductCreateMiddlewareDeps {
  readonly getSellerStatus: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<string>;
  readonly approveSeller: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<void>;
  readonly isProductRequestEnabled: () => boolean;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFirstImageUrl(images: unknown): string | undefined {
  if (!Array.isArray(images)) {
    return undefined;
  }
  for (const item of images) {
    if (typeof item === "string" && item.trim().length > 0) {
      return item.trim();
    }
    if (
      isPlainRecord(item) &&
      typeof item.url === "string" &&
      item.url.trim().length > 0
    ) {
      return item.url.trim();
    }
  }
  return undefined;
}

/**
 * Ensures vendor product payloads always have a thumbnail when at least one
 * image is attached (MercurJS's default uploader marks uploaded media with
 * `isThumbnail: false`), and defaults omitted create status to `published`
 * when `product_request` is disabled.
 */
export function applyVendorProductDefaults(
  payload: Record<string, unknown>,
  options: VendorProductDefaultsOptions
): void {
  const existingThumbnail =
    typeof payload.thumbnail === "string" ? payload.thumbnail.trim() : "";

  if (!existingThumbnail) {
    const firstImageUrl = extractFirstImageUrl(payload.images);
    if (firstImageUrl) {
      payload.thumbnail = firstImageUrl;
    }
  }

  if (
    options.defaultPublished &&
    !options.productRequestEnabled &&
    payload.status === undefined
  ) {
    payload.status = ProductStatus.PUBLISHED;
  }
}

function applyDefaultsToRequestBodies(
  req: SellerScopedRequest,
  options: VendorProductDefaultsOptions
): void {
  if (isPlainRecord(req.body)) {
    applyVendorProductDefaults(req.body, options);
  }
  if (isPlainRecord(req.validatedBody)) {
    applyVendorProductDefaults(req.validatedBody, options);
  }
}

export function createVendorProductCreateMiddleware(
  deps: VendorProductCreateMiddlewareDeps
) {
  return async function ensureVendorProductCreateDefaults(
    req: MedusaRequest,
    _res: MedusaResponse,
    next: MedusaNextFunction
  ): Promise<void> {
    try {
      const vendorReq = req as SellerScopedRequest;
      applyDefaultsToRequestBodies(vendorReq, {
        defaultPublished: true,
        productRequestEnabled: deps.isProductRequestEnabled(),
      });

      const sellerId = vendorReq.seller_context?.seller_id;
      if (sellerId) {
        const status = await deps.getSellerStatus(req.scope, sellerId);
        if (status === SellerStatus.PENDING_APPROVAL) {
          await deps.approveSeller(req.scope, sellerId);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function ensureVendorProductUpdateThumbnailMiddleware(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
): void {
  applyDefaultsToRequestBodies(req as SellerScopedRequest, {
    defaultPublished: false,
    productRequestEnabled: true,
  });
  next();
}
