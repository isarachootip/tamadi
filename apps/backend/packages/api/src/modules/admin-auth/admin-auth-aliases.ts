import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

export interface AdminAliasMap {
  readonly admin: string;
  readonly sysadmin: string;
}

export const DEFAULT_ADMIN_EMAIL = "admin@tamadee.online";
export const DEFAULT_SYSADMIN_EMAIL = "sysadmin@tamadee.online";

export function resolveAdminAliasMap(
  env: Readonly<Record<string, string | undefined>> = process.env
): AdminAliasMap {
  const adminEmail =
    env.TAMADEE_ADMIN_EMAIL?.trim() ||
    env.TAMADEE_SEED_ADMIN_EMAIL?.trim() ||
    DEFAULT_ADMIN_EMAIL;
  const sysadminEmail =
    env.TAMADEE_SYSADMIN_EMAIL?.trim() || DEFAULT_SYSADMIN_EMAIL;

  return {
    admin: adminEmail.toLowerCase(),
    sysadmin: sysadminEmail.toLowerCase(),
  };
}

export function normalizeAdminLoginIdentifier(
  rawIdentifier: string,
  aliasMap: AdminAliasMap = resolveAdminAliasMap()
): string {
  const trimmed = rawIdentifier.trim();
  const key = trimmed.toLowerCase();
  if (key === "admin") {
    return aliasMap.admin;
  }
  if (key === "sysadmin") {
    return aliasMap.sysadmin;
  }
  return trimmed;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Rewrites short operator usernames (`admin`, `sysadmin`) to their corresponding
 * email addresses on `POST /auth/user/emailpass` before Medusa's emailpass
 * provider authenticates the request.
 */
export function createAdminUsernameAliasMiddleware(
  aliasMap: AdminAliasMap = resolveAdminAliasMap()
) {
  return function adminUsernameAliasMiddleware(
    req: MedusaRequest,
    _res: MedusaResponse,
    next: MedusaNextFunction
  ): void {
    if (isPlainRecord(req.body) && typeof req.body.email === "string") {
      req.body.email = normalizeAdminLoginIdentifier(req.body.email, aliasMap);
    }
    next();
  };
}

export const adminUsernameAliasMiddleware = createAdminUsernameAliasMiddleware();
