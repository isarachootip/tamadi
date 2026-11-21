import { resolveAdminAliasMap } from "./admin-auth-aliases";

export const MIN_ADMIN_PASSWORD_LENGTH = 8;

export type OperatorAdminRole = "admin" | "sysadmin";

export interface OperatorAdminSpec {
  readonly username: OperatorAdminRole;
  readonly role: OperatorAdminRole;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface ExistingAdminUser {
  readonly id: string;
  readonly email: string;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
}

export interface CreateAdminUserInput {
  readonly authIdentityId: string;
  readonly username: OperatorAdminRole;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly metadata: Record<string, unknown>;
}

export interface AdminSyncDeps {
  readonly findUserByEmail: (email: string) => Promise<ExistingAdminUser | null>;
  readonly ensureIdentity: (email: string, password: string) => Promise<string>;
  readonly updatePassword: (email: string, password: string) => Promise<void>;
  readonly createUser: (input: CreateAdminUserInput) => Promise<string>;
  readonly updateUserMetadata: (
    userId: string,
    metadata: Record<string, unknown>
  ) => Promise<void>;
  readonly logInfo?: (message: string) => void;
  readonly logWarn?: (message: string) => void;
}

export interface AdminSyncSummary {
  readonly createdCount: number;
  readonly updatedCount: number;
}

export function resolveOperatorAdminSpecs(
  env: Readonly<Record<string, string | undefined>> = process.env,
  onWarn?: (message: string) => void
): OperatorAdminSpec[] {
  const aliases = resolveAdminAliasMap(env);
  const candidates: Array<{
    readonly username: OperatorAdminRole;
    readonly email: string;
    readonly rawPassword: string | undefined;
    readonly firstName: string;
    readonly lastName: string;
  }> = [
    {
      username: "admin",
      email: aliases.admin,
      rawPassword:
        env.TAMADEE_ADMIN_PASSWORD?.trim() ||
        env.TAMADEE_SEED_ADMIN_PASSWORD?.trim(),
      firstName: "ผู้ดูแลระบบ",
      lastName: "Tamadee Admin",
    },
    {
      username: "sysadmin",
      email: aliases.sysadmin,
      rawPassword: env.TAMADEE_SYSADMIN_PASSWORD?.trim(),
      firstName: "ผู้ดูแลระบบหลัก",
      lastName: "Tamadee SysAdmin",
    },
  ];

  const specs: OperatorAdminSpec[] = [];
  for (const item of candidates) {
    if (!item.rawPassword) {
      continue;
    }
    if (item.rawPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
      onWarn?.(
        `[Tamadee Admin Sync] Skipping "${item.username}" (${item.email}): password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`
      );
      continue;
    }
    specs.push({
      username: item.username,
      role: item.username,
      email: item.email,
      password: item.rawPassword,
      firstName: item.firstName,
      lastName: item.lastName,
    });
  }
  return specs;
}

export function createAdminSyncService(deps: AdminSyncDeps) {
  return {
    async syncAccounts(
      specs: readonly OperatorAdminSpec[]
    ): Promise<AdminSyncSummary> {
      let createdCount = 0;
      let updatedCount = 0;

      for (const spec of specs) {
        const existing = await deps.findUserByEmail(spec.email);
        const targetMetadata: Record<string, unknown> = {
          ...(existing?.metadata ?? {}),
          username: spec.username,
          role: spec.role,
        };

        if (!existing) {
          const authIdentityId = await deps.ensureIdentity(
            spec.email,
            spec.password
          );
          await deps.updatePassword(spec.email, spec.password);
          await deps.createUser({
            authIdentityId,
            username: spec.username,
            email: spec.email,
            firstName: spec.firstName,
            lastName: spec.lastName,
            metadata: targetMetadata,
          });
          createdCount += 1;
          deps.logInfo?.(
            `[Tamadee Admin Sync] Created operator "${spec.username}" (${spec.email}).`
          );
          continue;
        }

        await deps.ensureIdentity(spec.email, spec.password);
        await deps.updatePassword(spec.email, spec.password);
        await deps.updateUserMetadata(existing.id, targetMetadata);
        updatedCount += 1;
        deps.logInfo?.(
          `[Tamadee Admin Sync] Synced credentials & role for "${spec.username}" (${spec.email}).`
        );
      }

      return { createdCount, updatedCount };
    },
  };
}
