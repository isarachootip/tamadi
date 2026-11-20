import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  approveSellerWorkflow,
  SellerWorkflowEvents,
} from "@mercurjs/core/workflows";
import { SellerStatus } from "@mercurjs/types";

interface SellerCreatedPayload {
  readonly id?: string;
}

/**
 * Automatically approves newly self-registered Tamadee sellers so they can
 * immediately publish products and have their offers visible in storefronts.
 */
export default async function autoApproveSellerHandler({
  event,
  container,
}: SubscriberArgs<SellerCreatedPayload | SellerCreatedPayload[]>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const payloads = Array.isArray(event.data) ? event.data : [event.data];

  for (const payload of payloads) {
    const sellerId = payload?.id;
    if (!sellerId) {
      continue;
    }

    try {
      const { data } = await query.graph({
        entity: "seller",
        fields: ["id", "status"],
        filters: { id: sellerId },
      });
      const currentStatus = (data as Array<{ status?: string }>)[0]?.status;
      if (currentStatus !== SellerStatus.PENDING_APPROVAL) {
        continue;
      }

      await approveSellerWorkflow(container).run({
        input: { seller_id: sellerId },
      });
      logger.info(`[Tamadee] Auto-approved newly registered seller ${sellerId}`);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      logger.warn(
        `[Tamadee] Failed to auto-approve seller ${sellerId}: ${reason}`
      );
    }
  }
}

export const config: SubscriberConfig = {
  event: [SellerWorkflowEvents.CREATED],
  context: {
    subscriberId: "tamadee-auto-approve-seller",
  },
};
