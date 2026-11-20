import type {
  CreateQuickProductPayload,
  QuickProductVariantPayload,
} from "../../../lib/tamadee-api";

export interface VariantRowDraft {
  readonly id: string;
  readonly title: string;
  readonly sku: string;
  readonly priceThb: string;
  readonly stockQuantity: string;
}

export function createEmptyVariantRow(index: number): VariantRowDraft {
  return {
    id: `row-${Date.now()}-${index}`,
    title: index === 0 ? "มาตรฐาน" : "",
    sku: "",
    priceThb: "",
    stockQuantity: "10",
  };
}

export function parseVariantRows(
  rows: VariantRowDraft[]
): { ok: true; variants: QuickProductVariantPayload[] } | { ok: false; error: string } {
  const variants: QuickProductVariantPayload[] = [];
  const seenTitles = new Set<string>();

  for (const row of rows) {
    const trimmedTitle = row.title.trim();
    if (!trimmedTitle) {
      return { ok: false, error: "กรุณาระบุชื่อตัวเลือกสินค้าให้ครบทุกแถว" };
    }
    const normalized = trimmedTitle.toLowerCase();
    if (seenTitles.has(normalized)) {
      return {
        ok: false,
        error: `ชื่อตัวเลือก "${trimmedTitle}" ซ้ำกัน กรุณาตั้งชื่อให้ต่างกัน`,
      };
    }
    seenTitles.add(normalized);

    const price = Number(row.priceThb);
    if (!Number.isFinite(price) || price <= 0) {
      return {
        ok: false,
        error: `กรุณาระบุราคา (THB) ที่มากกว่า 0 สำหรับ "${trimmedTitle}"`,
      };
    }

    const stock = Number(row.stockQuantity);
    if (!Number.isInteger(stock) || stock < 0) {
      return {
        ok: false,
        error: `จำนวนสต็อกของ "${trimmedTitle}" ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`,
      };
    }

    variants.push({
      title: trimmedTitle,
      sku: row.sku.trim() || undefined,
      price_thb: price,
      stock_quantity: stock,
    });
  }

  return { ok: true, variants };
}

export function mergePendingImageUrl(
  images: string[],
  pendingUrl: string,
  maxImages = 8
): { ok: true; images: string[] } | { ok: false; error: string } {
  const trimmed = pendingUrl.trim();
  if (!trimmed) {
    return { ok: true, images };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        ok: false,
        error: "กรุณากรอก URL รูปภาพที่ขึ้นต้นด้วย https:// หรือ http://",
      };
    }
  } catch {
    return {
      ok: false,
      error: "กรุณากรอก URL รูปภาพที่ถูกต้อง (ขึ้นต้นด้วย https://)",
    };
  }

  if (images.includes(trimmed) || images.length >= maxImages) {
    return { ok: true, images };
  }

  return { ok: true, images: [...images, trimmed] };
}

export interface QuickProductFormDraft {
  readonly title: string;
  readonly description: string;
  readonly categoryId: string;
  readonly weightGrams: string;
  readonly images: string[];
  readonly pendingImageUrl: string;
  readonly optionTitle: string;
  readonly publishImmediately: boolean;
  readonly variantRows: VariantRowDraft[];
}

export function buildQuickProductPayload(
  draft: QuickProductFormDraft
):
  | { ok: true; payload: CreateQuickProductPayload; finalImages: string[] }
  | { ok: false; error: string } {
  const trimmedTitle = draft.title.trim();
  if (!trimmedTitle) {
    return { ok: false, error: "กรุณาระบุชื่อสินค้า" };
  }

  const parsedVariants = parseVariantRows(draft.variantRows);
  if (!parsedVariants.ok) {
    return parsedVariants;
  }

  const mergedImages = mergePendingImageUrl(draft.images, draft.pendingImageUrl);
  if (!mergedImages.ok) {
    return mergedImages;
  }

  const parsedWeight = draft.weightGrams.trim()
    ? Number(draft.weightGrams)
    : undefined;
  const finalImages = mergedImages.images;

  return {
    ok: true,
    finalImages,
    payload: {
      title: trimmedTitle,
      description: draft.description.trim() || undefined,
      category_id: draft.categoryId === "__none__" ? null : draft.categoryId,
      thumbnail: finalImages[0],
      images: finalImages.length > 0 ? finalImages : undefined,
      weight_grams:
        parsedWeight && Number.isInteger(parsedWeight) && parsedWeight > 0
          ? parsedWeight
          : undefined,
      option_title: draft.optionTitle.trim() || "ตัวเลือก",
      publish_immediately: draft.publishImmediately,
      variants: parsedVariants.variants,
    },
  };
}
