import type {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { GET as mercurGetVendorSellers } from "@mercurjs/core/api/vendor/sellers/route";
import {
  createEnsureStoreDefaultRegionMiddleware,
  unregisteredSellersListMiddleware,
} from "../unregistered-sellers-middleware";

interface MockResponseState {
  statusCode: number;
  body: unknown;
}

function createMockRes(): {
  res: MedusaResponse;
  state: MockResponseState;
} {
  const state: MockResponseState = {
    statusCode: 200,
    body: undefined,
  };
  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      state.body = payload;
      return this;
    },
  } as unknown as MedusaResponse;

  return { res, state };
}

describe("Vendor Onboarding Guard & Store Default Region Middleware", () => {
  it("returns empty seller_members list (200) for newly registered member without actor_id", () => {
    const req = {
      auth_context: {
        actor_id: "",
        actor_type: "member",
        auth_identity_id: "authid_new_vendor",
      },
      queryConfig: {
        pagination: { skip: 0, take: 50 },
      },
    } as unknown as MedusaRequest;
    const { res, state } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    unregisteredSellersListMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(state.statusCode).toBe(200);
    expect(state.body).toEqual({
      seller_members: [],
      count: 0,
      offset: 0,
      limit: 50,
    });
  });

  it("preserves custom pagination offset and limit for unregistered member", () => {
    const req = {
      auth_context: {
        actor_id: "",
        actor_type: "member",
        auth_identity_id: "authid_new_vendor",
      },
      queryConfig: {
        pagination: { skip: 10, take: 25 },
      },
    } as unknown as MedusaRequest;
    const { res, state } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    unregisteredSellersListMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(state.body).toEqual({
      seller_members: [],
      count: 0,
      offset: 10,
      limit: 25,
    });
  });

  it("delegates to next() when member already has actor_id", () => {
    const req = {
      auth_context: {
        actor_id: "mem_existing",
        actor_type: "member",
        auth_identity_id: "authid_existing",
      },
    } as unknown as MedusaRequest;
    const { res, state } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    unregisteredSellersListMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(state.body).toBeUndefined();
  });

  it("does not bypass auth when auth_identity_id is missing or actor_type is not member", async () => {
    const unauthReq = {
      auth_context: undefined,
      scope: {
        resolve: () => ({}),
      },
    } as unknown as AuthenticatedMedusaRequest;
    const { res, state } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    unregisteredSellersListMiddleware(unauthReq, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(state.body).toBeUndefined();

    // Confirm @mercurjs/core GET still rejects unauthenticated requests
    await expect(mercurGetVendorSellers(unauthReq, res)).rejects.toThrow(
      "You must be authenticated to access seller information."
    );
  });

  it("populates missing store.default_region_id with Thailand (th/thb) region before seller creation", async () => {
    const updateStoreCalls: Array<{
      id: string;
      default_region_id: string;
    }> = [];

    const middleware = createEnsureStoreDefaultRegionMiddleware({
      loadStoreAndRegions: async () => ({
        store: { id: "store_01", default_region_id: null },
        regions: [
          {
            id: "reg_th",
            currency_code: "thb",
            countries: [{ iso_2: "th" }],
          },
        ],
      }),
      setStoreDefaultRegion: async (_scope, storeId, regionId) => {
        updateStoreCalls.push({ id: storeId, default_region_id: regionId });
      },
    });

    const req = { scope: {} } as unknown as MedusaRequest;
    const { res } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    await middleware(req, res, next);
    expect(updateStoreCalls).toEqual([
      { id: "store_01", default_region_id: "reg_th" },
    ]);
    expect(next).toHaveBeenCalledTimes(1);

    // Subsequent call uses in-memory verified flag without redundant writes
    await middleware(req, res, next);
    expect(updateStoreCalls).toHaveLength(1);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("skips store update when store.default_region_id is already configured", async () => {
    const setStoreDefaultRegion = jest.fn(async () => undefined);
    const middleware = createEnsureStoreDefaultRegionMiddleware({
      loadStoreAndRegions: async () => ({
        store: { id: "store_01", default_region_id: "reg_existing" },
        regions: [],
      }),
      setStoreDefaultRegion,
    });

    const req = { scope: {} } as unknown as MedusaRequest;
    const { res } = createMockRes();
    const next = jest.fn() as unknown as MedusaNextFunction;

    await middleware(req, res, next);

    expect(setStoreDefaultRegion).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
