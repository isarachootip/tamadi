import { z } from "zod";

export const CartItemOfferSchema = z.object({
  id: z.string().nullable().optional(),
  seller: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const CartLineItemDtoSchema = z.object({
  id: z.string(),
  product_id: z.string().nullable().optional(),
  variant_id: z.string().nullable().optional(),
  title: z.string(),
  variant_title: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  quantity: z.number(),
  unit_price: z.number(),
  offer: CartItemOfferSchema.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const CartDtoSchema = z.object({
  id: z.string(),
  currency_code: z.string().nullable().optional(),
  region_id: z.string().nullable().optional(),
  original_item_total: z.number().nullable().optional(),
  item_total: z.number().nullable().optional(),
  item_subtotal: z.number().nullable().optional(),
  shipping_total: z.number().nullable().optional(),
  discount_total: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  promotions: z
    .array(z.object({ code: z.string().nullable().optional() }))
    .nullable()
    .optional(),
  items: z.array(CartLineItemDtoSchema).nullable().optional(),
});

export const CartResponseSchema = z.object({
  cart: CartDtoSchema,
});

export const AuthTokenResponseSchema = z.object({
  token: z.string().min(1),
});

export const AddressDtoSchema = z.object({
  id: z.string(),
  address_name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  address_1: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_default_shipping: z.boolean().nullable().optional(),
});

export const CustomerDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  addresses: z.array(AddressDtoSchema).nullable().optional(),
});

export const CustomerResponseSchema = z.object({
  customer: CustomerDtoSchema,
});

export const OrderGroupDtoSchema = z.object({
  id: z.string(),
  created_at: z.string().nullable().optional(),
  total: z.number().nullable().optional(),
  orders: z.array(z.object({ id: z.string() })).nullable().optional(),
});

export const OrderGroupsResponseSchema = z.object({
  order_groups: z.array(OrderGroupDtoSchema),
});

// Boundary Form Input Schemas
export const AddToCartInputSchema = z.object({
  offerId: z.string().min(1, "กรุณาเลือกสินค้าและร้านค้า"),
  quantity: z.coerce.number().int().min(1).max(50),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
});

export const UpdateCartLineSchema = z.object({
  lineItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(50),
});

export const PromoCodeInputSchema = z.object({
  code: z.string().trim().min(1, "กรุณากรอกโค้ดส่วนลด"),
});

export const LoginInputSchema = z.object({
  email: z.email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const RegisterInputSchema = z.object({
  email: z.email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล"),
  phone: z.string().trim().optional(),
});

export const AddressInputSchema = z.object({
  addressName: z.string().trim().optional(),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อผู้รับ"),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุลผู้รับ"),
  address1: z.string().trim().min(3, "กรุณากรอกบ้านเลขที่และถนน"),
  city: z.string().trim().min(1, "กรุณากรอกเขต/อำเภอ"),
  province: z.string().trim().min(1, "กรุณากรอกจังหวัด"),
  postalCode: z.string().trim().min(5, "รหัสไปรษณีย์ไม่ถูกต้อง"),
  phone: z.string().trim().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
});

export type CartDto = z.infer<typeof CartDtoSchema>;
export type CustomerDto = z.infer<typeof CustomerDtoSchema>;
export type OrderGroupDto = z.infer<typeof OrderGroupDtoSchema>;
