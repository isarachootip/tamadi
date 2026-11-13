import assert from "node:assert/strict";
import {
  mapCartDto,
  mapCustomerDto,
} from "../src/data/mappers/cart-auth-mapper";
import {
  mapProductDetailDto,
  mapProductSummaryDto,
} from "../src/data/mappers/catalog-mapper";
import {
  AddToCartInputSchema,
  CartResponseSchema,
  CustomerResponseSchema,
} from "../src/data/schemas/cart-auth-schemas";
import {
  OffersResponseSchema,
  ProductDetailResponseSchema,
  ProductsResponseSchema,
} from "../src/data/schemas/catalog-schemas";

export function runMapperAndSchemaTests(): void {
  // 1. Validate & map Mercur product list + detail + offers
  const rawProductsPayload = {
    products: [
      {
        id: "prod_01",
        title: "เสื้อลินินทอมือ",
        handle: "handwoven-linen",
        subtitle: "ผ้าฝ้ายผสมลินินระบายอากาศดี",
        thumbnail: "https://picsum.photos/seed/linen/800/800",
        categories: [{ id: "cat_clothes", name: "เสื้อผ้า", handle: "clothes" }],
        variants: [
          {
            id: "var_01",
            title: "M / เขียวมะกอก",
            offer_id: "off_01",
            calculated_price: { calculated_amount: 1190, currency_code: "thb" },
          },
        ],
      },
    ],
  };

  const parsedProducts = ProductsResponseSchema.parse(rawProductsPayload);
  const summary = mapProductSummaryDto(parsedProducts.products[0]!);
  assert.equal(summary.priceAmount, 1190);
  assert.equal(summary.primaryOfferId, "off_01");
  assert.deepEqual(summary.categoryNames, ["เสื้อผ้า"]);

  const rawDetailPayload = {
    product: {
      id: "prod_01",
      title: "เสื้อลินินทอมือ",
      handle: "handwoven-linen",
      description: "ตัดเย็บปราณีตทุกฝีเข็ม",
      thumbnail: "https://picsum.photos/seed/linen/800/800",
      images: [{ url: "https://picsum.photos/seed/linen-2/800/800" }],
      categories: [{ id: "cat_clothes", name: "เสื้อผ้า", handle: "clothes" }],
      options: [
        {
          id: "opt_size",
          title: "ไซซ์",
          values: [{ id: "ov_m", value: "M" }],
        },
      ],
      variants: [
        {
          id: "var_01",
          title: "M",
          offer_id: "off_01",
          calculated_price: { calculated_amount: 1190 },
          options: [{ option_id: "opt_size", value: "M" }],
        },
      ],
    },
  };
  const rawOffersPayload = {
    offers: [
      {
        id: "off_01",
        variant_id: "var_01",
        effective_leadtime_to_ship: 2,
        calculated_price: { calculated_amount: 1190 },
        seller: {
          id: "sel_lamai",
          name: "ละไม สตูดิโอ",
          handle: "lamai-studio",
          description: "งานผ้าทอมือเชียงใหม่",
        },
      },
    ],
  };

  const detail = mapProductDetailDto(
    ProductDetailResponseSchema.parse(rawDetailPayload).product,
    OffersResponseSchema.parse(rawOffersPayload).offers
  );
  assert.equal(detail.offers[0]?.sellerName, "ละไม สตูดิโอ");
  assert.equal(detail.variants[0]?.optionValues["opt_size"], "M");

  // 2. Validate & map Mercur Cart (with offer.seller AND metadata fallback)
  const rawCartPayload = {
    cart: {
      id: "cart_test",
      currency_code: "thb",
      region_id: "reg_th",
      original_item_total: 1640,
      item_subtotal: 1533,
      shipping_total: 0,
      discount_total: 0,
      total: 1640,
      promotions: [{ code: "WELCOME" }],
      items: [
        {
          id: "item_1",
          product_id: "prod_01",
          variant_id: "var_01",
          title: "เสื้อลินินทอมือ",
          quantity: 1,
          unit_price: 1190,
          offer: {
            id: "off_01",
            seller: { id: "sel_lamai", name: "ละไม สตูดิโอ" },
          },
        },
        {
          id: "item_2",
          product_id: "prod_02",
          variant_id: "var_02",
          title: "จานเซรามิก",
          quantity: 1,
          unit_price: 450,
          metadata: {
            offer_id: "off_02",
            seller_id: "sel_baandin",
            seller_name: "บ้านดิน คราฟต์",
          },
        },
      ],
    },
  };

  const cart = mapCartDto(CartResponseSchema.parse(rawCartPayload).cart);
  assert.equal(cart.items.length, 2);
  assert.equal(cart.itemSubtotal, 1640);
  assert.equal(cart.items[0]?.sellerName, "ละไม สตูดิโอ");
  assert.equal(cart.items[1]?.sellerName, "บ้านดิน คราฟต์");
  assert.deepEqual(cart.promoCodes, ["WELCOME"]);

  // 3. Validate Customer & Reject invalid input at boundary
  const customer = mapCustomerDto(
    CustomerResponseSchema.parse({
      customer: {
        id: "cus_01",
        email: "buyer@tamadee.online",
        first_name: "กานดา",
        last_name: "ใจดี",
        addresses: [
          {
            id: "addr_01",
            first_name: "กานดา",
            last_name: "ใจดี",
            address_1: "12/3 ถ.นิมมานเหมินท์",
            city: "เมืองเชียงใหม่",
            province: "เชียงใหม่",
            postal_code: "50200",
            phone: "0812345678",
            is_default_shipping: true,
          },
        ],
      },
    }).customer
  );
  assert.equal(customer.addresses[0]?.province, "เชียงใหม่");

  const badInput = AddToCartInputSchema.safeParse({
    offerId: "",
    quantity: 0,
    sellerId: "sel_1",
    sellerName: "ร้าน",
  });
  assert.equal(badInput.success, false);
}
