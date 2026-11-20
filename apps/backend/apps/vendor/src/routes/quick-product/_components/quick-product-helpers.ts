import type { QuickProductVariantPayload } from "../../../lib/tamadee-api";

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
