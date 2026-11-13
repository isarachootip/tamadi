import type { CartModel, CustomerProfile } from "../domain/types";
import {
  readCartIdCookie,
  readCustomerToken,
  saveCartIdCookie,
} from "./cookies";
import { fetchCurrentCustomer } from "./repositories/auth-repo";
import { createMercurCart, fetchCartById } from "./repositories/cart-repo";

/**
 * Safe to call inside React Server Components (read-only cookie access).
 */
export async function getServerCart(): Promise<CartModel | null> {
  const cartId = await readCartIdCookie();
  if (!cartId) {
    return null;
  }
  const token = await readCustomerToken();
  try {
    return await fetchCartById(cartId, token);
  } catch {
    return null;
  }
}

/**
 * Safe to call inside Server Actions / Route Handlers (creates & sets cookie if missing).
 */
export async function ensureServerCartId(): Promise<{
  readonly cartId: string;
  readonly bearerToken?: string;
}> {
  const bearerToken = await readCustomerToken();
  const existingId = await readCartIdCookie();
  if (existingId) {
    try {
      const existing = await fetchCartById(existingId, bearerToken);
      return { cartId: existing.id, bearerToken };
    } catch {
      // Stale cart ID; create a fresh cart below
    }
  }
  const created = await createMercurCart(bearerToken);
  await saveCartIdCookie(created.id);
  return { cartId: created.id, bearerToken };
}

/**
 * Safe to call inside React Server Components (read-only cookie access).
 */
export async function getServerCustomer(): Promise<CustomerProfile | null> {
  const token = await readCustomerToken();
  if (!token) {
    return null;
  }
  try {
    return await fetchCurrentCustomer(token);
  } catch {
    return null;
  }
}
