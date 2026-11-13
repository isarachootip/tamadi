export type TamadeeCategoryKey =
  | "clothing"
  | "footwear"
  | "bags"
  | "jewelry"
  | "crafts";

export interface TamadeeCategorySeed {
  readonly key: TamadeeCategoryKey;
  readonly name: string;
  readonly handle: string;
  readonly description: string;
}

export interface TamadeeSellerSeed {
  readonly key: "lamai" | "kaodee" | "baandin";
  readonly name: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
  readonly address1: string;
  readonly description: string;
  readonly shippingFlatFeeThb: number;
}

export interface TamadeeProductSeed {
  readonly handle: string;
  readonly title: string;
  readonly description: string;
  readonly category: TamadeeCategoryKey;
  readonly seller: TamadeeSellerSeed["key"];
  readonly priceThb: number;
  readonly sizes: readonly string[];
  readonly color: string;
  readonly weightGrams: number;
}

export interface StoreRegionSeedResult {
  readonly storeId: string;
  readonly defaultSalesChannelId: string;
  readonly regionId: string;
  readonly publishableApiKeyId: string;
  readonly publishableApiKeyToken: string;
}

export interface SeededSellerRef {
  readonly key: TamadeeSellerSeed["key"];
  readonly id: string;
  readonly name: string;
  readonly memberId: string;
  readonly stockLocationId: string;
  readonly shippingProfileId: string;
}
