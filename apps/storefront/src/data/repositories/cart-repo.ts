import { z } from "zod";
import type { CartModel } from "../../domain/types";
import { mapCartDto } from "../mappers/cart-auth-mapper";
import { mercurFetch } from "../mercur-client";
import { CartResponseSchema } from "../schemas/cart-auth-schemas";
import { getThailandRegionId } from "./catalog-repo";

const CART_FIELDS = "+items.offer,+items.offer.seller";
const AnyJsonObjectSchema = z.record(z.string(), z.unknown());

export async function fetchCartById(
  cartId: string,
  bearerToken?: string
): Promise<CartModel> {
  const res = await mercurFetch({
    path: `/store/carts/${encodeURIComponent(cartId)}`,
    query: { fields: CART_FIELDS },
    bearerToken,
    schema: CartResponseSchema,
  });
  return mapCartDto(res.cart);
}

export async function createMercurCart(bearerToken?: string): Promise<CartModel> {
  const regionId = await getThailandRegionId();
  const res = await mercurFetch({
    method: "POST",
    path: "/store/carts",
    body: { region_id: regionId },
    bearerToken,
    schema: CartResponseSchema,
  });
  return mapCartDto(res.cart);
}

export async function addOfferLineToCart(params: {
  readonly cartId: string;
  readonly offerId: string;
  readonly quantity: number;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly bearerToken?: string;
}): Promise<CartModel> {
  await mercurFetch({
    method: "POST",
    path: `/store/carts/${encodeURIComponent(params.cartId)}/line-items`,
    body: {
      offer_id: params.offerId,
      quantity: params.quantity,
      metadata: {
        offer_id: params.offerId,
        seller_id: params.sellerId,
        seller_name: params.sellerName,
      },
    },
    bearerToken: params.bearerToken,
    schema: AnyJsonObjectSchema,
  });
  return fetchCartById(params.cartId, params.bearerToken);
}

export async function updateCartLineItem(params: {
  readonly cartId: string;
  readonly lineItemId: string;
  readonly quantity: number;
  readonly bearerToken?: string;
}): Promise<CartModel> {
  if (params.quantity <= 0) {
    return deleteCartLineItem({
      cartId: params.cartId,
      lineItemId: params.lineItemId,
      bearerToken: params.bearerToken,
    });
  }
  await mercurFetch({
    method: "POST",
    path: `/store/carts/${encodeURIComponent(params.cartId)}/line-items/${encodeURIComponent(params.lineItemId)}`,
    body: { quantity: params.quantity },
    bearerToken: params.bearerToken,
    schema: AnyJsonObjectSchema,
  });
  return fetchCartById(params.cartId, params.bearerToken);
}

export async function deleteCartLineItem(params: {
  readonly cartId: string;
  readonly lineItemId: string;
  readonly bearerToken?: string;
}): Promise<CartModel> {
  await mercurFetch({
    method: "DELETE",
    path: `/store/carts/${encodeURIComponent(params.cartId)}/line-items/${encodeURIComponent(params.lineItemId)}`,
    bearerToken: params.bearerToken,
    schema: AnyJsonObjectSchema,
  });
  return fetchCartById(params.cartId, params.bearerToken);
}

export async function applyCartPromoCode(params: {
  readonly cartId: string;
  readonly code: string;
  readonly bearerToken?: string;
}): Promise<CartModel> {
  await mercurFetch({
    method: "POST",
    path: `/store/carts/${encodeURIComponent(params.cartId)}/promotions`,
    body: { promo_codes: [params.code.trim()] },
    bearerToken: params.bearerToken,
    schema: AnyJsonObjectSchema,
  });
  return fetchCartById(params.cartId, params.bearerToken);
}

export async function transferCartOwnership(params: {
  readonly cartId: string;
  readonly bearerToken: string;
}): Promise<CartModel> {
  await mercurFetch({
    method: "POST",
    path: `/store/carts/${encodeURIComponent(params.cartId)}/customer`,
    body: {},
    bearerToken: params.bearerToken,
    schema: AnyJsonObjectSchema,
  });
  return fetchCartById(params.cartId, params.bearerToken);
}
