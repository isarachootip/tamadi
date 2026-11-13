import { z } from "zod";

export const CalculatedPriceSchema = z.object({
  calculated_amount: z.number().nullable().optional(),
  original_amount: z.number().nullable().optional(),
  currency_code: z.string().nullable().optional(),
});

export const RegionDtoSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
});

export const RegionsResponseSchema = z.object({
  regions: z.array(RegionDtoSchema),
});

export const CategoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  description: z.string().nullable().optional(),
  rank: z.number().nullable().optional(),
});

export const CategoriesResponseSchema = z.object({
  product_categories: z.array(CategoryDtoSchema),
});

export const SellerDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  default_leadtime_to_ship: z.number().nullable().optional(),
});

export const SellersResponseSchema = z.object({
  sellers: z.array(SellerDtoSchema),
});

export const SingleSellerResponseSchema = z.object({
  seller: SellerDtoSchema,
});

export const ProductOptionValueDtoSchema = z.object({
  id: z.string().optional(),
  option_id: z.string().nullable().optional(),
  value: z.string(),
});

export const ProductOptionDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  values: z.array(ProductOptionValueDtoSchema).nullable().optional(),
});

export const VariantDtoSchema = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  offer_id: z.string().nullable().optional(),
  calculated_price: CalculatedPriceSchema.nullable().optional(),
  options: z.array(ProductOptionValueDtoSchema).nullable().optional(),
});

export const ProductDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.object({ url: z.string() })).nullable().optional(),
  categories: z.array(CategoryDtoSchema).nullable().optional(),
  options: z.array(ProductOptionDtoSchema).nullable().optional(),
  variants: z.array(VariantDtoSchema).nullable().optional(),
});

export const ProductsResponseSchema = z.object({
  products: z.array(ProductDtoSchema),
});

export const ProductDetailResponseSchema = z.object({
  product: ProductDtoSchema,
});

export const OfferDtoSchema = z.object({
  id: z.string(),
  variant_id: z.string().nullable().optional(),
  effective_leadtime_to_ship: z.number().nullable().optional(),
  calculated_price: CalculatedPriceSchema.nullable().optional(),
  seller: SellerDtoSchema.nullable().optional(),
  product: z
    .object({
      id: z.string(),
      title: z.string(),
      handle: z.string().nullable().optional(),
      subtitle: z.string().nullable().optional(),
      thumbnail: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const OffersResponseSchema = z.object({
  offers: z.array(OfferDtoSchema),
});

export type CategoryDto = z.infer<typeof CategoryDtoSchema>;
export type SellerDto = z.infer<typeof SellerDtoSchema>;
export type ProductDto = z.infer<typeof ProductDtoSchema>;
export type OfferDto = z.infer<typeof OfferDtoSchema>;
