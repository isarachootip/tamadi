import {
  createAdminUsernameAliasMiddleware,
  normalizeAdminLoginIdentifier,
  resolveAdminAliasMap,
} from "../admin-auth-aliases";
import {
  createAdminSyncService,
  MIN_ADMIN_PASSWORD_LENGTH,
  resolveOperatorAdminSpecs,
  type AdminSyncDeps,
  type ExistingAdminUser,
} from "../admin-sync-service";

describe("Admin Short-Username Auth Aliases", () => {
  const aliasMap = resolveAdminAliasMap({});

  it("maps default short usernames admin and sysadmin to @tamadee.online emails", () => {
    expect(aliasMap).toEqual({
      admin: "admin@tamadee.online",
      sysadmin: "sysadmin@tamadee.online",
    });
    expect(normalizeAdminLoginIdentifier("admin", aliasMap)).toBe(
      "admin@tamadee.online"
    );
    expect(normalizeAdminLoginIdentifier("  SYSADMIN  ", aliasMap)).toBe(
      "sysadmin@tamadee.online"
    );
    expect(normalizeAdminLoginIdentifier("Admin", aliasMap)).toBe(
      "admin@tamadee.online"
    );
  });

  it("preserves arbitrary full emails untouched", () => {
    expect(normalizeAdminLoginIdentifier("owner@example.com", aliasMap)).toBe(
      "owner@example.com"
    );
    expect(normalizeAdminLoginIdentifier("admin@tamadee.online", aliasMap)).toBe(
      "admin@tamadee.online"
    );
  });

  it("rewrites req.body.email in middleware and calls next cleanly", () => {
    const middleware = createAdminUsernameAliasMiddleware(aliasMap);
    const req = { body: { email: "sysadmin", password: "secret" } };
    const next = jest.fn();

    middleware(req as never, {} as never, next);

    expect(req.body.email).toBe("sysadmin@tamadee.online");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("handles missing or non-object request bodies safely", () => {
    const middleware = createAdminUsernameAliasMiddleware(aliasMap);
    const req = { body: undefined };
    const next = jest.fn();

    middleware(req as never, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("Operator Admin Account Sync Service", () => {
  it("rejects weak passwords shorter than 8 characters and skips unset accounts", () => {
    const warnings: string[] = [];
    const specs = resolveOperatorAdminSpecs(
      {
        TAMADEE_ADMIN_PASSWORD: "1234",
        TAMADEE_SYSADMIN_PASSWORD: "StrongPassword#2026",
      },
      (msg) => warnings.push(msg)
    );

    expect(MIN_ADMIN_PASSWORD_LENGTH).toBe(8);
    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      username: "sysadmin",
      role: "sysadmin",
      email: "sysadmin@tamadee.online",
    });
    expect(warnings.some((w) => w.includes("admin"))).toBe(true);
  });

  it("creates missing admins and updates password + metadata for existing admins", async () => {
    const existingByEmail = new Map<string, ExistingAdminUser>([
      [
        "admin@tamadee.online",
        { id: "user_admin_1", email: "admin@tamadee.online", metadata: {} },
      ],
    ]);
    const created: Array<{ email: string; metadata: Record<string, unknown> }> = [];
    const updatedPasswords: Array<{ email: string; password: string }> = [];
    const updatedMetadata: Array<{
      userId: string;
      metadata: Record<string, unknown>;
    }> = [];

    const deps: AdminSyncDeps = {
      async findUserByEmail(email) {
        return existingByEmail.get(email) ?? null;
      },
      async ensureIdentity(email, password) {
        return `auth_${email}_${password.length}`;
      },
      async updatePassword(email, password) {
        updatedPasswords.push({ email, password });
      },
      async createUser(input) {
        created.push({ email: input.email, metadata: input.metadata });
        return `user_${input.username}`;
      },
      async updateUserMetadata(userId, metadata) {
        updatedMetadata.push({ userId, metadata });
      },
      logInfo: jest.fn(),
      logWarn: jest.fn(),
    };

    const service = createAdminSyncService(deps);
    const specs = resolveOperatorAdminSpecs({
      TAMADEE_ADMIN_PASSWORD: "AdminSecure#2026",
      TAMADEE_SYSADMIN_PASSWORD: "SysAdminSecure#2026",
    });

    const summary = await service.syncAccounts(specs);

    expect(summary).toEqual({ createdCount: 1, updatedCount: 1 });
    expect(created).toEqual([
      {
        email: "sysadmin@tamadee.online",
        metadata: { username: "sysadmin", role: "sysadmin" },
      },
    ]);
    expect(updatedPasswords).toEqual([
      { email: "admin@tamadee.online", password: "AdminSecure#2026" },
      { email: "sysadmin@tamadee.online", password: "SysAdminSecure#2026" },
    ]);
    expect(updatedMetadata).toEqual([
      {
        userId: "user_admin_1",
        metadata: { username: "admin", role: "admin" },
      },
    ]);
  });
});
