"use server";

import { revalidatePath } from "next/cache";
import {
  clearCustomerToken,
  readCartIdCookie,
  readCustomerToken,
  saveCustomerToken,
} from "../data/cookies";
import { MercurApiError } from "../data/mercur-client";
import {
  authenticateCustomerEmailPass,
  createCustomerShippingAddress,
  registerCustomerEmailPass,
} from "../data/repositories/auth-repo";
import { transferCartOwnership } from "../data/repositories/cart-repo";
import {
  AddressInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
} from "../data/schemas/cart-auth-schemas";
import type { ActionResult } from "./cart-actions";

function toAuthError(error: unknown): string {
  if (error instanceof MercurApiError) {
    return error.message;
  }
  return "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง";
}

async function tryTransferGuestCart(bearerToken: string): Promise<void> {
  const cartId = await readCartIdCookie();
  if (!cartId) {
    return;
  }
  try {
    await transferCartOwnership({ cartId, bearerToken });
  } catch {
    // Non-fatal if cart was already associated with another customer
  }
}

export async function loginCustomerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = LoginInputSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
    };
  }

  try {
    const { token } = await authenticateCustomerEmailPass(parsed.data);
    await saveCustomerToken(token);
    await tryTransferGuestCart(token);
    revalidatePath("/", "layout");
    revalidatePath("/account");
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toAuthError(error) };
  }
}

export async function registerCustomerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const parsed = RegisterInputSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    ...(rawPhone.length > 0 ? { phone: rawPhone } : {}),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "กรุณากรอกข้อมูลให้ครบถ้วน",
    };
  }

  try {
    const { token } = await registerCustomerEmailPass(parsed.data);
    await saveCustomerToken(token);
    await tryTransferGuestCart(token);
    revalidatePath("/", "layout");
    revalidatePath("/account");
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toAuthError(error) };
  }
}

export async function logoutCustomerAction(): Promise<void> {
  await clearCustomerToken();
  revalidatePath("/", "layout");
  revalidatePath("/account");
}

export async function addAddressAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token = await readCustomerToken();
  if (!token) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนเพิ่มที่อยู่จัดส่ง" };
  }

  const rawName = String(formData.get("addressName") ?? "").trim();
  const parsed = AddressInputSchema.safeParse({
    ...(rawName.length > 0 ? { addressName: rawName } : {}),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    address1: String(formData.get("address1") ?? ""),
    city: String(formData.get("city") ?? ""),
    province: String(formData.get("province") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "ข้อมูลที่อยู่ไม่ครบถ้วน",
    };
  }

  try {
    await createCustomerShippingAddress(token, parsed.data);
    revalidatePath("/account");
    revalidatePath("/account/addresses");
    return { ok: true, message: "บันทึกที่อยู่จัดส่งเรียบร้อยแล้ว" };
  } catch (error) {
    return { ok: false, message: toAuthError(error) };
  }
}
