"use server";

import { revalidatePath } from "next/cache";
import { MercurApiError } from "../data/mercur-client";
import {
  addOfferLineToCart,
  applyCartPromoCode,
  deleteCartLineItem,
  updateCartLineItem,
} from "../data/repositories/cart-repo";
import {
  AddToCartInputSchema,
  PromoCodeInputSchema,
  UpdateCartLineSchema,
} from "../data/schemas/cart-auth-schemas";
import { ensureServerCartId } from "../data/session";

export interface ActionResult {
  readonly ok: boolean;
  readonly message?: string;
}

function toFriendlyMessage(error: unknown): string {
  if (error instanceof MercurApiError) {
    return error.message;
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

export async function addToCartAction(input: {
  readonly offerId: string;
  readonly quantity: number;
  readonly sellerId: string;
  readonly sellerName: string;
}): Promise<ActionResult> {
  const parsed = AddToCartInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "ข้อมูลสินค้าไม่ถูกต้อง",
    };
  }
  try {
    const { cartId, bearerToken } = await ensureServerCartId();
    await addOfferLineToCart({
      cartId,
      offerId: parsed.data.offerId,
      quantity: parsed.data.quantity,
      sellerId: parsed.data.sellerId,
      sellerName: parsed.data.sellerName,
      bearerToken,
    });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return { ok: true, message: "เพิ่มสินค้าลงตะกร้าแล้ว" };
  } catch (error) {
    return { ok: false, message: toFriendlyMessage(error) };
  }
}

export async function updateCartLineAction(input: {
  readonly lineItemId: string;
  readonly quantity: number;
}): Promise<ActionResult> {
  const parsed = UpdateCartLineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "จำนวนสินค้าไม่ถูกต้อง" };
  }
  try {
    const { cartId, bearerToken } = await ensureServerCartId();
    await updateCartLineItem({
      cartId,
      lineItemId: parsed.data.lineItemId,
      quantity: parsed.data.quantity,
      bearerToken,
    });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toFriendlyMessage(error) };
  }
}

export async function removeCartLineAction(
  lineItemId: string
): Promise<ActionResult> {
  if (!lineItemId || lineItemId.trim().length === 0) {
    return { ok: false, message: "ไม่พบรายการสินค้า" };
  }
  try {
    const { cartId, bearerToken } = await ensureServerCartId();
    await deleteCartLineItem({ cartId, lineItemId, bearerToken });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toFriendlyMessage(error) };
  }
}

export async function applyPromoCodeAction(code: string): Promise<ActionResult> {
  const parsed = PromoCodeInputSchema.safeParse({ code });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "กรุณากรอกโค้ดส่วนลด",
    };
  }
  try {
    const { cartId, bearerToken } = await ensureServerCartId();
    await applyCartPromoCode({
      cartId,
      code: parsed.data.code,
      bearerToken,
    });
    revalidatePath("/cart");
    return { ok: true, message: `ใช้โค้ด ${parsed.data.code} สำเร็จ` };
  } catch (error) {
    return { ok: false, message: toFriendlyMessage(error) };
  }
}
