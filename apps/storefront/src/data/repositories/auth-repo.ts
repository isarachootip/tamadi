import { z } from "zod";
import type {
  CustomerProfile,
  OrderGroupSummary,
} from "../../domain/types";
import {
  mapCustomerDto,
  mapOrderGroupDto,
} from "../mappers/cart-auth-mapper";
import { MercurApiError, mercurFetch } from "../mercur-client";
import {
  AuthTokenResponseSchema,
  CustomerResponseSchema,
  OrderGroupsResponseSchema,
  type AddressInputSchema,
  type RegisterInputSchema,
} from "../schemas/cart-auth-schemas";

const AnyJsonObjectSchema = z.record(z.string(), z.unknown());

export async function fetchCurrentCustomer(
  bearerToken: string
): Promise<CustomerProfile | null> {
  try {
    const res = await mercurFetch({
      path: "/store/customers/me",
      query: { fields: "*addresses" },
      bearerToken,
      schema: CustomerResponseSchema,
    });
    return mapCustomerDto(res.customer);
  } catch (error) {
    if (error instanceof MercurApiError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}

export async function authenticateCustomerEmailPass(params: {
  readonly email: string;
  readonly password: string;
}): Promise<{ readonly token: string; readonly customer: CustomerProfile }> {
  const authRes = await mercurFetch({
    method: "POST",
    path: "/auth/customer/emailpass",
    body: {
      email: params.email.trim(),
      password: params.password,
    },
    schema: AuthTokenResponseSchema,
  });

  const customer = await fetchCurrentCustomer(authRes.token);
  if (!customer) {
    throw new MercurApiError("ไม่สามารถโหลดข้อมูลบัญชีลูกค้าได้");
  }
  return { token: authRes.token, customer };
}

export async function registerCustomerEmailPass(
  input: z.infer<typeof RegisterInputSchema>
): Promise<{ readonly token: string; readonly customer: CustomerProfile }> {
  const regRes = await mercurFetch({
    method: "POST",
    path: "/auth/customer/emailpass/register",
    body: {
      email: input.email.trim(),
      password: input.password,
    },
    schema: AuthTokenResponseSchema,
  });

  await mercurFetch({
    method: "POST",
    path: "/store/customers",
    bearerToken: regRes.token,
    body: {
      email: input.email.trim(),
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      ...(input.phone && input.phone.length > 0 ? { phone: input.phone } : {}),
    },
    schema: AnyJsonObjectSchema,
  });

  return authenticateCustomerEmailPass({
    email: input.email,
    password: input.password,
  });
}

export async function createCustomerShippingAddress(
  bearerToken: string,
  input: z.infer<typeof AddressInputSchema>
): Promise<CustomerProfile> {
  const res = await mercurFetch({
    method: "POST",
    path: "/store/customers/me/addresses",
    bearerToken,
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      address_1: input.address1,
      city: input.city,
      province: input.province,
      postal_code: input.postalCode,
      country_code: "th",
      phone: input.phone,
      is_default_shipping: true,
      ...(input.addressName && input.addressName.length > 0
        ? { address_name: input.addressName }
        : {}),
    },
    schema: CustomerResponseSchema,
  });
  return mapCustomerDto(res.customer);
}

export async function fetchCustomerOrderGroups(
  bearerToken: string
): Promise<readonly OrderGroupSummary[]> {
  const res = await mercurFetch({
    path: "/store/order-groups",
    bearerToken,
    schema: OrderGroupsResponseSchema,
  });
  return res.order_groups.map(mapOrderGroupDto);
}
