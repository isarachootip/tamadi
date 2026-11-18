export type OrderNotificationEventType =
  | "order.placed"
  | "order.fulfillment_created"
  | "order.shipment_created"
  | "order.canceled";

export interface FormatOrderNotificationInput {
  readonly eventType: OrderNotificationEventType;
  readonly orderDisplayId: string;
  readonly totalThb?: number;
  readonly sellerName?: string;
  readonly trackingNumber?: string;
}

export function formatOrderNotificationText(
  input: FormatOrderNotificationInput
): string {
  const sellerSuffix = input.sellerName ? ` (ร้าน ${input.sellerName})` : "";
  const totalStr =
    input.totalThb !== undefined
      ? ` ยอดรวม ฿${Math.round(input.totalThb).toLocaleString("en-US")}`
      : "";

  switch (input.eventType) {
    case "order.placed":
      return `📦 น้องทำมะดิรับคำสั่งซื้อ #${input.orderDisplayId}${sellerSuffix} เรียบร้อยแล้วครับ!${totalStr}\nผู้ขายกำลังเตรียมแพ็กของส่งให้คุณ ติดตามสถานะได้ที่ https://tamdi.tamadee.online/account`;
    case "order.fulfillment_created":
      return `✨ ร้านค้ากำลังแพ็กพัสดุคำสั่งซื้อ #${input.orderDisplayId}${sellerSuffix} แล้วครับ เตรียมรอรับเลขพัสดุได้เลย!`;
    case "order.shipment_created": {
      const track = input.trackingNumber
        ? `\nเลขพัสดุ: ${input.trackingNumber}`
        : "";
      return `🚚 พัสดุคำสั่งซื้อ #${input.orderDisplayId}${sellerSuffix} จัดส่งออกแล้วครับ!${track}\nเช็กรายละเอียดได้ที่ https://tamdi.tamadee.online/account`;
    }
    case "order.canceled":
      return `⚠️ คำสั่งซื้อ #${input.orderDisplayId}${sellerSuffix} ถูกยกเลิกเรียบร้อยแล้ว หากมีข้อสงสัยติดต่อทีมงาน Tamadee ได้ตลอดครับ`;
  }
}

export async function sendLinePushNotification(input: {
  readonly channelAccessToken: string;
  readonly lineUserId: string;
  readonly text: string;
  readonly fetchFn?: typeof fetch;
}): Promise<boolean> {
  const fetchImpl = input.fetchFn ?? fetch;
  const response = await fetchImpl("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.channelAccessToken}`,
    },
    body: JSON.stringify({
      to: input.lineUserId,
      messages: [{ type: "text", text: input.text }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  return response.ok;
}
