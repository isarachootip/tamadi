import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows";

interface AuthContextShape {
  actor_id?: string;
  actor_type?: string;
  auth_identity_id?: string;
}

interface AuthenticatedVendorRequest extends MedusaRequest {
  auth_context?: AuthContextShape;
}

interface StoreSummary {
  id: string;
  default_region_id?: string | null;
}

interface RegionSummary {
  id: string;
  currency_code?: string | null;
  countries?: Array<{ iso_2?: string | null }> | null;
}

export interface EnsureStoreDefaultRegionDeps {
  loadStoreAndRegions: (scope: MedusaContainer) => Promise<{
    store: StoreSummary | undefined;
    regions: RegionSummary[];
  }>;
  setStoreDefaultRegion: (
    scope: MedusaContainer,
    storeId: string,
    regionId: string
  ) => Promise<void>;
}

const DEFAULT_SELLERS_LIMIT = 50;

/**
 * Workaround for @mercurjs/core v2.4.1 bug in `GET /vendor/sellers`:
 * Although vendorMiddlewares marks `/vendor/sellers` with `allowUnregistered: true`
 * for newly registered vendors (`auth_identity_id` present, `actor_id === ""`),
 * `@mercurjs/core`'s `GET` handler throws 401 when `!actor_id`, causing
 * `@mercurjs/client` to wipe `mercur_vendor_auth_token` from localStorage on
 * `/seller/onboarding` and `/seller/store-select`.
 */
export function unregisteredSellersListMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  const auth = (req as AuthenticatedVendorRequest).auth_context;
  const isPreOnboardingMember =
    auth?.actor_type === "member" &&
    typeof auth.auth_identity_id === "string" &&
    auth.auth_identity_id.length > 0 &&
    !auth.actor_id;

  if (!isPreOnboardingMember) {
    next();
    return;
  }

  const offset = req.queryConfig?.pagination?.skip ?? 0;
  const limit = req.queryConfig?.pagination?.take ?? DEFAULT_SELLERS_LIMIT;

  res.status(200).json({
    seller_members: [],
    count: 0,
    offset,
    limit,
  });
}

const defaultDeps: EnsureStoreDefaultRegionDeps = {
  async loadStoreAndRegions(scope: MedusaContainer) {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    const [{ data: stores }, { data: regions }] = await Promise.all([
      query.graph({
        entity: "store",
        fields: ["id", "default_region_id"],
      }),
      query.graph({
        entity: "region",
        fields: ["id", "currency_code", "countries.iso_2"],
      }),
    ]);

    return {
      store: (stores as StoreSummary[])[0],
      regions: regions as RegionSummary[],
    };
  },
  async setStoreDefaultRegion(
    scope: MedusaContainer,
    storeId: string,
    regionId: string
  ) {
    await updateStoresWorkflow(scope).run({
      input: {
        selector: { id: storeId },
        update: { default_region_id: regionId },
      },
    });
  },
};

function pickPreferredRegion(
  regions: RegionSummary[]
): RegionSummary | undefined {
  return (
    regions.find((region) =>
      region.countries?.some(
        (country) => country.iso_2?.toLowerCase() === "th"
      )
    ) ??
    regions.find((region) => region.currency_code?.toLowerCase() === "thb") ??
    regions[0]
  );
}

/**
 * Ensures `store.default_region_id` points to the Thailand (`th`/`thb`) region
 * before `POST /vendor/sellers` runs `createSellerAccountWorkflow`, so newly
 * onboarded sellers are automatically linked to the marketplace region even on
 * databases seeded before `default_region_id` was added to the seed script.
 */
export function createEnsureStoreDefaultRegionMiddleware(
  deps: EnsureStoreDefaultRegionDeps = defaultDeps
) {
  let defaultRegionVerified = false;

  return async function ensureStoreDefaultRegion(
    req: MedusaRequest,
    _res: MedusaResponse,
    next: MedusaNextFunction
  ): Promise<void> {
    if (defaultRegionVerified) {
      next();
      return;
    }

    try {
      const { store, regions } = await deps.loadStoreAndRegions(req.scope);
      if (store?.default_region_id) {
        defaultRegionVerified = true;
        next();
        return;
      }

      const preferredRegion = store ? pickPreferredRegion(regions) : undefined;
      if (store && preferredRegion) {
        await deps.setStoreDefaultRegion(
          req.scope,
          store.id,
          preferredRegion.id
        );
        defaultRegionVerified = true;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const ensureStoreDefaultRegionMiddleware =
  createEnsureStoreDefaultRegionMiddleware();
