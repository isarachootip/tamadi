import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows";

export async function ensureEmailPassIdentity(
  container: MedusaContainer,
  email: string,
  password: string
): Promise<string> {
  const authModule = container.resolve(Modules.AUTH);
  const reg = await authModule.register("emailpass", {
    body: { email, password },
  });
  if (reg.success && reg.authIdentity) {
    return reg.authIdentity.id;
  }
  const [identity] = await authModule.listProviderIdentities({
    entity_id: email,
    provider: "emailpass",
  });
  if (!identity?.auth_identity_id) {
    throw new Error(`Unable to resolve auth identity for ${email}`);
  }
  return identity.auth_identity_id;
}

export async function ensureOperatorAdmin(
  container: MedusaContainer
): Promise<string> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const adminEmail =
    process.env.TAMADEE_SEED_ADMIN_EMAIL || "admin@tamadee.online";
  const adminPassword =
    process.env.TAMADEE_SEED_ADMIN_PASSWORD || "TamadeeAdmin2026!";

  const { data: existingUsers } = await query.graph({
    entity: "user",
    fields: ["id"],
    filters: { email: adminEmail },
  });
  if (existingUsers.length > 0) {
    return (existingUsers as { id: string }[])[0].id;
  }

  logger.info(`[Tamadee Seed] Creating Operator Admin (${adminEmail})...`);
  const authIdentityId = await ensureEmailPassIdentity(
    container,
    adminEmail,
    adminPassword
  );
  const { result } = await createUserAccountWorkflow(container).run({
    input: {
      authIdentityId,
      userData: {
        email: adminEmail,
        first_name: "ผู้ดูแลระบบ",
        last_name: "Tamadee",
      },
    },
  });
  return result.id;
}
