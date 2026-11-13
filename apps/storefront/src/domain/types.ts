export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description?: string;
  readonly rank: number;
}

export interface SellerSummary {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description?: string;
  readonly logo?: string;
  readonly leadtimeDays?: number;
}

export interface ProductSummary {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly subtitle?: string;
  readonly thumbnail?: string;
  readonly priceAmount: number;
  readonly categoryIds: readonly string[];
  readonly categoryNames: readonly string[];
  readonly primaryOfferId?: string;
}

export interface ProductOptionAxis {
  readonly id: string;
  readonly title: string;
  readonly values: readonly string[];
}

export interface ProductVariantModel {
  readonly id: string;
  readonly title: string;
  readonly sku?: string;
  readonly priceAmount: number;
  readonly offerId?: string;
  readonly optionValues: Readonly<Record<string, string>>;
}

export interface SellerOfferModel {
  readonly id: string;
  readonly variantId: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly sellerHandle: string;
  readonly sellerDescription?: string;
  readonly sellerLogo?: string;
  readonly priceAmount: number;
  readonly leadtimeDays?: number;
  readonly inStock: boolean;
}

export interface ProductDetail {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly thumbnail?: string;
  readonly images: readonly string[];
  readonly categoryNames: readonly string[];
  readonly options: readonly ProductOptionAxis[];
  readonly variants: readonly ProductVariantModel[];
  readonly offers: readonly SellerOfferModel[];
}

export interface CartLineItem {
  readonly id: string;
  readonly productId: string;
  readonly variantId: string;
  readonly offerId: string;
  readonly title: string;
  readonly variantTitle?: string;
  readonly thumbnail?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly sellerId: string;
  readonly sellerName: string;
}

export interface SellerCartGroup {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly items: readonly CartLineItem[];
  readonly subtotal: number;
  readonly shippingEstimate: number;
}

export interface CartModel {
  readonly id: string;
  readonly currencyCode: string;
  readonly regionId: string;
  readonly items: readonly CartLineItem[];
  readonly itemSubtotal: number;
  readonly shippingTotal: number;
  readonly discountTotal: number;
  readonly total: number;
  readonly promoCodes: readonly string[];
}

export interface CartSummaryTotals {
  readonly totalQuantity: number;
  readonly itemSubtotal: number;
  readonly shippingTotal: number;
  readonly discountTotal: number;
  readonly grandTotal: number;
}

export type ProductSortOption = "recommended" | "newest" | "price_asc" | "price_desc";

export interface ProductQueryFilter {
  readonly q?: string;
  readonly categoryId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort?: ProductSortOption;
}

export interface CustomerAddress {
  readonly id: string;
  readonly addressName?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly address1: string;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
  readonly phone: string;
  readonly isDefaultShipping: boolean;
}

export interface CustomerProfile {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly addresses: readonly CustomerAddress[];
}

export interface OrderGroupSummary {
  readonly id: string;
  readonly createdAt: string;
  readonly orderCount: number;
  readonly totalAmount: number;
}
