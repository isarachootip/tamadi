import crypto from "node:crypto";
import { z } from "@medusajs/framework/zod";
import { ProductStatus } from "@mercurjs/types";

const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateVendorCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณาระบุชื่อหมวดหมู่สินค้า")
    .max(120, "ชื่อหมวดหมู่ต้องไม่เกิน 120 ตัวอักษร"),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(HANDLE_PATTERN, "Handle ต้องใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น")
    .max(80)
    .optional(),
  description: z.string().trim().max(500).optional(),
  parent_category_id: z.string().trim().min(1).optional().nullable(),
});

export type CreateVendorCategoryInput = z.infer<
  typeof CreateVendorCategorySchema
>;

export const QuickProductVariantSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "กรุณาระบุชื่อตัวเลือกสินค้า")
    .max(120, "ชื่อตัวเลือกต้องไม่เกิน 120 ตัวอักษร"),
  sku: z.string().trim().max(64).optional(),
  price_thb: z.coerce
    .number()
    .finite()
    .positive("ราคาต้องมากกว่า 0 บาท")
    .max(10_000_000),
  stock_quantity: z.coerce
    .number()
    .int("จำนวนสต็อกต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนสต็อกต้องไม่ติดลบ")
    .max(1_000_000),
});

export type QuickProductVariantInput = z.infer<typeof QuickProductVariantSchema>;

export const QuickCreateProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "กรุณาระบุชื่อสินค้า")
      .max(180, "ชื่อสินค้าต้องไม่เกิน 180 ตัวอักษร"),
    handle: z
      .string()
      .trim()
      .toLowerCase()
      .regex(HANDLE_PATTERN, "Handle ต้องใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น")
      .max(80)
      .optional(),
    description: z.string().trim().max(4000).optional(),
    category_id: z.string().trim().min(1).optional().nullable(),
    thumbnail: z.string().trim().url("URL รูปภาพหลักไม่ถูกต้อง").optional(),
    images: z.array(z.string().trim().url("URL รูปภาพไม่ถูกต้อง")).max(10).optional(),
    weight_grams: z.coerce.number().int().positive().max(100_000).optional(),
    option_title: z.string().trim().min(1).max(60).optional(),
    publish_immediately: z.boolean().default(true),
    variants: z
      .array(QuickProductVariantSchema)
      .min(1, "ต้องมีตัวเลือกสินค้าอย่างน้อย 1 รายการ")
      .max(30, "รองรับสูงสุด 30 ตัวเลือกต่อสินค้า"),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.variants.forEach((variant, index) => {
      const key = variant.title.trim().toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", index, "title"],
          message: `ชื่อตัวเลือก "${variant.title}" ซ้ำกัน กรุณาตั้งชื่อให้ต่างกัน`,
        });
      }
      seen.add(key);
    });
  });

export type QuickCreateProductInput = z.infer<typeof QuickCreateProductSchema>;

export const UpdateProductMediaSchema = z.object({
  images: z
    .array(z.string().trim().url("URL รูปภาพไม่ถูกต้อง"))
    .max(10, "รองรับรูปภาพสูงสุด 10 รูปต่อสินค้า"),
  thumbnail: z
    .string()
    .trim()
    .url("URL รูปภาพหลักไม่ถูกต้อง")
    .nullable()
    .optional(),
  publish_immediately: z.boolean().optional(),
});

export type UpdateProductMediaInput = z.infer<typeof UpdateProductMediaSchema>;

/**
 * Produces a URL-safe lowercase ASCII handle from English or Thai text.
 * Pure Thai text receives a deterministic short hash so handles remain valid
 * URL segments and idempotent across retries.
 */
export function slugifyHandle(text: string, prefix: string): string {
  const normalized = text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (normalized.length >= 2) {
    return normalized;
  }

  const digest = crypto
    .createHash("sha256")
    .update(text.trim().toLowerCase())
    .digest("hex")
    .slice(0, 8);
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, "") || "item";
  return `${safePrefix}-${digest}`;
}

/**
 * Generates an ASCII-only SKU when a seller omits a custom SKU.
 */
export function buildVariantSku(
  sellerId: string,
  productTitle: string,
  variantTitle: string,
  variantIndex: number
): string {
  const sellerTag = sellerId
    .replace(/^sel_?/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase() || "SHOP";

  const hash = crypto
    .createHash("sha256")
    .update(`${productTitle}::${variantTitle}::${variantIndex}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `TMD-${sellerTag}-${hash}-V${variantIndex + 1}`;
}

/**
 * Open (approved) sellers may publish immediately or save as draft.
 * Unapproved or suspended sellers always submit products as PROPOSED for review.
 */
export function resolveProductPublishStatus(
  sellerStatus: string,
  publishImmediately: boolean
): ProductStatus {
  if (sellerStatus !== "open") {
    return ProductStatus.PROPOSED;
  }
  return publishImmediately ? ProductStatus.PUBLISHED : ProductStatus.DRAFT;
}
