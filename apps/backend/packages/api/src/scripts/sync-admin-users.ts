import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows";
import {
  createAdminSyncService,
  resolveOperatorAdminSpecs,
  type ExistingAdminUser,
} from "../modules/admin-auth/admin-sync-service";
import { ensureEmailPassIdentity } from "./seed/admin-user";

interface RawUserRow {
  readonly id: string;
  readonly email: string;
  readonly metadata?: Record<string, unknown> | null;
}

export default async function syncTamadeeAdminUsers({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const authModule = container.resolve(Modules.AUTH);
  const userModule = container.resolve(Modules.USER);

  const specs = resolveOperatorAdminSpecs(process.env, (warning) =>
    logger.warn(warning)
  );
  if (specs.length === 0) {
    logger.info(
      "[Tamadee Admin Sync] No TAMADEE_ADMIN_PASSWORD / TAMADEE_SYSADMIN_PASSWORD configured; skipping."
    );
    return;
  }

  const service = createAdminSyncService({
    async findUserByEmail(email): Promise<ExistingAdminUser | null> {
      const { data } = await query.graph({
        entity: "user",
        fields: ["id", "email", "metadata"],
        filters: { email },
      });
      const found = (data as RawUserRow[])[0];
      return found
        ? { id: found.id, email: found.email, metadata: found.metadata ?? null }
        : null;
    },

    async ensureIdentity(email, password): Promise<string> {
      return ensureEmailPassIdentity(container, email, password);
    },

    async updatePassword(email, password): Promise<void> {
      const result = await authModule.updateProvider("emailpass", {
        entity_id: email,
        password,
      });
      if (!result.success) {
        throw new Error(
          result.error || `Failed to update emailpass password for ${email}`
        );
      }
    },

    async createUser(input): Promise<string> {
      const { result } = await createUserAccountWorkflow(container).run({
        input: {
          authIdentityId: input.authIdentityId,
          userData: {
            email: input.email,
            first_name: input.firstName,
            last_name: input.lastName,
            metadata: input.metadata,
          },
        },
      });
      return result.id;
    },

    async updateUserMetadata(userId, metadata): Promise<void> {
      await userModule.updateUsers({ id: userId, metadata });
    },

    logInfo(message) {
      logger.info(message);
    },
    logWarn(message) {
      logger.warn(message);
    },
  });

  await service.syncAccounts(specs);
}
