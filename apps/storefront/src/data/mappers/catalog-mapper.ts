import type {
  ProductCategory,
  ProductDetail,
  ProductOptionAxis,
  ProductSummary,
  ProductVariantModel,
  SellerOfferModel,
  SellerSummary,
} from "../../domain/types";
import type {
  CategoryDto,
  OfferDto,
  ProductDto,
  SellerDto,
} from "../schemas/catalog-schemas";

export function mapCategoryDto(dto: CategoryDto): ProductCategory {
  return {
    id: dto.id,
    name: dto.name,
    handle: dto.handle,
    description: dto.description ?? undefined,
    rank: dto.rank ?? 0,
  };
}

export function mapSellerDto(dto: SellerDto): SellerSummary {
  return {
    id: dto.id,
    name: dto.name,
    handle: dto.handle ?? dto.id,
    description: dto.description ?? undefined,
    logo: dto.logo ?? undefined,
    leadtimeDays: dto.default_leadtime_to_ship ?? undefined,
  };
}

export function mapProductSummaryDto(dto: ProductDto): ProductSummary {
  const variants = dto.variants ?? [];
  let lowestPrice = 0;
  let primaryOfferId: string | undefined;

  for (const variant of variants) {
    const amount = Math.round(variant.calculated_price?.calculated_amount ?? 0);
    if (amount > 0 && (lowestPrice === 0 || amount < lowestPrice)) {
      lowestPrice = amount;
      primaryOfferId = variant.offer_id ?? primaryOfferId;
    }
    if (!primaryOfferId && variant.offer_id) {
      primaryOfferId = variant.offer_id;
    }
  }

  const categories = dto.categories ?? [];
  return {
    id: dto.id,
    title: dto.title,
    handle: dto.handle,
    subtitle: dto.subtitle ?? undefined,
    thumbnail: dto.thumbnail ?? dto.images?.[0]?.url ?? undefined,
    priceAmount: lowestPrice,
    categoryIds: categories.map((c) => c.id),
    categoryNames: categories.map((c) => c.name),
    primaryOfferId,
  };
}

export function mapOfferToProductSummary(dto: OfferDto): ProductSummary | null {
  if (!dto.product) {
    return null;
  }
  return {
    id: dto.product.id,
    title: dto.product.title,
    handle: dto.product.handle ?? dto.product.id,
    subtitle: dto.product.subtitle ?? undefined,
    thumbnail: dto.product.thumbnail ?? undefined,
    priceAmount: Math.round(dto.calculated_price?.calculated_amount ?? 0),
    categoryIds: [],
    categoryNames: [],
    primaryOfferId: dto.id,
  };
}

export function mapProductDetailDto(
  productDto: ProductDto,
  offerDtos: readonly OfferDto[]
): ProductDetail {
  const options: ProductOptionAxis[] = (productDto.options ?? []).map((opt) => {
    const uniqueValues = Array.from(
      new Set((opt.values ?? []).map((v) => v.value).filter((v) => v.length > 0))
    );
    return {
      id: opt.id,
      title: opt.title,
      values: uniqueValues,
    };
  });

  const variants: ProductVariantModel[] = (productDto.variants ?? []).map((v) => {
    const optionValues: Record<string, string> = {};
    for (const optVal of v.options ?? []) {
      if (optVal.option_id) {
        optionValues[optVal.option_id] = optVal.value;
      }
    }
    return {
      id: v.id,
      title: v.title ?? "มาตรฐาน",
      sku: v.sku ?? undefined,
      priceAmount: Math.round(v.calculated_price?.calculated_amount ?? 0),
      offerId: v.offer_id ?? undefined,
      optionValues,
    };
  });

  const offers: SellerOfferModel[] = offerDtos.map((offer) => ({
    id: offer.id,
    variantId: offer.variant_id ?? "",
    sellerId: offer.seller?.id ?? "seller_unknown",
    sellerName: offer.seller?.name ?? "ร้านค้าทำมาดี",
    sellerHandle: offer.seller?.handle ?? offer.seller?.id ?? "tamadee",
    sellerDescription: offer.seller?.description ?? undefined,
    sellerLogo: offer.seller?.logo ?? undefined,
    priceAmount: Math.round(offer.calculated_price?.calculated_amount ?? 0),
    leadtimeDays: offer.effective_leadtime_to_ship ?? undefined,
    inStock: true,
  }));

  return {
    id: productDto.id,
    title: productDto.title,
    handle: productDto.handle,
    subtitle: productDto.subtitle ?? undefined,
    description: productDto.description ?? undefined,
    thumbnail: productDto.thumbnail ?? undefined,
    images: (productDto.images ?? []).map((img) => img.url),
    categoryNames: (productDto.categories ?? []).map((c) => c.name),
    options,
    variants,
    offers,
  };
}
