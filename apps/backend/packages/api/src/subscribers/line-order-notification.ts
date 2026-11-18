import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { parseBackendEnv } from "../config/env";
import {
  formatOrderNotificationText,
  sendLinePushNotification,
  type OrderNotificationEventType,
} from "../modules/line-integration/line-messaging";

interface OrderEventPayload {
  readonly id?: string;
  readonly order_id?: string;
}

interface QueriedOrderRow {
  readonly id: string;
  readonly display_id?: number | string | null;
  readonly total?: number | null;
  readonly customer?: {
    readonly metadata?: Readonly<Record<string, unknown>> | null;
  } | null;
}

const SUPPORTED_EVENTS = new Set<OrderNotificationEventType>([
  "order.placed",
  "order.fulfillment_created",
  "order.shipment_created",
  "order.canceled",
]);

export default async function lineOrderNotificationSubscriber({
  event,
  container,
}: SubscriberArgs<OrderEventPayload>): Promise<void> {
  const env = parseBackendEnv(process.env);
  if (!env.lineNotificationsEnabled || !env.lineMessagingAccessToken) {
    return;
  }

  if (!SUPPORTED_EVENTS.has(event.name as OrderNotificationEventType)) {
    return;
  }

  const orderId = event.data?.order_id ?? event.data?.id;
  if (!orderId) {
    return;
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "total", "customer.metadata"],
      filters: { id: orderId },
    });

    const order = (data as QueriedOrderRow[])[0];
    if (!order) return;

    const rawLineId = order.customer?.metadata?.["line_user_id"];
    const lineUserId = typeof rawLineId === "string" ? rawLineId.trim() : "";
    if (!lineUserId) return;

    const text = formatOrderNotificationText({
      eventType: event.name as OrderNotificationEventType,
      orderDisplayId: String(order.display_id ?? order.id.slice(-6)),
      totalThb: typeof order.total === "number" ? order.total : undefined,
    });

    await sendLinePushNotification({
      channelAccessToken: env.lineMessagingAccessToken,
      lineUserId,
      text,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`[line-order-notification] skipped (${orderId}): ${msg}`);
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.fulfillment_created",
    "order.shipment_created",
    "order.canceled",
  ],
  context: {
    subscriberId: "tamadee-line-order-notification",
  },
};
