import type {
  CartLineItem,
  CartModel,
  CustomerAddress,
  CustomerProfile,
  OrderGroupSummary,
} from "../../domain/types";
import type {
  CartDto,
  CustomerDto,
  OrderGroupDto,
} from "../schemas/cart-auth-schemas";

function readMetaString(
  meta: Record<string, unknown> | null | undefined,
  key: string
): string | undefined {
  const val = meta?.[key];
  return typeof val === "string" && val.trim().length > 0 ? val.trim() : undefined;
}

export function mapCartDto(dto: CartDto): CartModel {
  const items: CartLineItem[] = (dto.items ?? []).map((item) => {
    const sellerId =
      item.offer?.seller?.id ??
      readMetaString(item.metadata, "seller_id") ??
      "seller_default";
    const sellerName =
      item.offer?.seller?.name ??
      readMetaString(item.metadata, "seller_name") ??
      "ร้านค้าทำมาดี";
    const offerId =
      item.offer?.id ?? readMetaString(item.metadata, "offer_id") ?? "";

    return {
      id: item.id,
      productId: item.product_id ?? "",
      variantId: item.variant_id ?? "",
      offerId,
      title: item.title,
      variantTitle: item.variant_title ?? undefined,
      thumbnail: item.thumbnail ?? undefined,
      quantity: item.quantity,
      unitPrice: Math.round(item.unit_price),
      sellerId,
      sellerName,
    };
  });

  const promoCodes = (dto.promotions ?? [])
    .map((p) => p.code ?? "")
    .filter((code) => code.length > 0);

  const vatInclusiveItemSubtotal =
    dto.original_item_total ?? dto.item_total ?? dto.item_subtotal ?? 0;

  return {
    id: dto.id,
    currencyCode: (dto.currency_code ?? "thb").toLowerCase(),
    regionId: dto.region_id ?? "",
    items,
    itemSubtotal: Math.round(vatInclusiveItemSubtotal),
    shippingTotal: Math.round(dto.shipping_total ?? 0),
    discountTotal: Math.round(dto.discount_total ?? 0),
    total: Math.round(dto.total ?? 0),
    promoCodes,
  };
}

export function mapCustomerDto(dto: CustomerDto): CustomerProfile {
  const addresses: CustomerAddress[] = (dto.addresses ?? []).map((addr) => ({
    id: addr.id,
    addressName: addr.address_name ?? undefined,
    firstName: addr.first_name ?? "",
    lastName: addr.last_name ?? "",
    address1: addr.address_1 ?? "",
    city: addr.city ?? "",
    province: addr.province ?? "",
    postalCode: addr.postal_code ?? "",
    phone: addr.phone ?? "",
    isDefaultShipping: addr.is_default_shipping ?? false,
  }));

  const lineUserId =
    typeof dto.metadata?.["line_user_id"] === "string"
      ? dto.metadata["line_user_id"].trim()
      : "";
  const lineDisplayName =
    typeof dto.metadata?.["line_display_name"] === "string"
      ? dto.metadata["line_display_name"].trim()
      : undefined;

  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.first_name ?? undefined,
    lastName: dto.last_name ?? undefined,
    phone: dto.phone ?? undefined,
    lineLinked: lineUserId.length > 0,
    lineDisplayName,
    addresses,
  };
}

export function mapOrderGroupDto(dto: OrderGroupDto): OrderGroupSummary {
  return {
    id: dto.id,
    createdAt: dto.created_at ?? "",
    orderCount: dto.orders?.length ?? 0,
    totalAmount: Math.round(dto.total ?? 0),
  };
}
