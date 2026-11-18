import type { MedusaContainer } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils";
import {
  createCustomerAccountWorkflow,
  updateCustomersWorkflow,
} from "@medusajs/medusa/core-flows";
import type { VerifiedLineUserProfile } from "./line-oauth-client";

export interface ProvisionedLineSession {
  readonly customerId: string;
  readonly jwtToken: string;
  readonly displayName: string;
}

export async function provisionLineCustomerAndJwt(
  container: MedusaContainer,
  profile: VerifiedLineUserProfile
): Promise<ProvisionedLineSession> {
  const authModule = container.resolve(Modules.AUTH);
  const customerModule = container.resolve(Modules.CUSTOMER);
  const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE);
  const { http } = config.projectConfig;

  const existingIdentities = await authModule.listProviderIdentities({
    entity_id: profile.userId,
    provider: "line",
  });

  let authIdentityId = existingIdentities[0]?.auth_identity_id;
  if (!authIdentityId) {
    const created = await authModule.createAuthIdentities({
      provider_identities: [
        {
          entity_id: profile.userId,
          provider: "line",
          user_metadata: {
            display_name: profile.displayName,
            picture_url: profile.pictureUrl ?? null,
          },
        },
      ],
    });
    authIdentityId = created.id;
  }

  const identity = await authModule.retrieveAuthIdentity(authIdentityId);
  const metaMap = (identity.app_metadata ?? {}) as Record<string, unknown>;
  let customerId =
    typeof metaMap["customer_id"] === "string" ? metaMap["customer_id"] : "";

  const targetEmail =
    profile.email?.toLowerCase() ??
    `${profile.userId.toLowerCase()}@line.tamadee.online`;

  if (!customerId) {
    const byEmail = await customerModule.listCustomers({ email: targetEmail });
    if (byEmail[0]) {
      customerId = byEmail[0].id;
      await authModule.updateAuthIdentities({
        id: authIdentityId,
        app_metadata: { ...metaMap, customer_id: customerId },
      });
    } else {
      const { result: createdCustomer } = await createCustomerAccountWorkflow(
        container
      ).run({
        input: {
          authIdentityId,
          customerData: {
            email: targetEmail,
            first_name: profile.displayName,
            metadata: {
              line_user_id: profile.userId,
              line_display_name: profile.displayName,
              line_picture_url: profile.pictureUrl ?? null,
            },
          },
        },
      });
      customerId = createdCustomer.id;
    }
  }

  await updateCustomersWorkflow(container).run({
    input: {
      selector: { id: customerId },
      update: {
        metadata: {
          line_user_id: profile.userId,
          line_display_name: profile.displayName,
          line_picture_url: profile.pictureUrl ?? null,
        },
      },
    },
  });

  const jwtToken = generateJwtToken(
    {
      actor_id: customerId,
      actor_type: "customer",
      auth_identity_id: authIdentityId,
      auth_provider: "line",
      mfa_enabled: false,
      mfa_challenge_completed_at: null,
      app_metadata: { customer_id: customerId },
      user_metadata: { line_user_id: profile.userId },
    },
    {
      secret: http.jwtSecret,
      expiresIn: http.jwtExpiresIn,
      jwtOptions: http.jwtOptions,
    }
  );

  return {
    customerId,
    jwtToken,
    displayName: profile.displayName,
  };
}
