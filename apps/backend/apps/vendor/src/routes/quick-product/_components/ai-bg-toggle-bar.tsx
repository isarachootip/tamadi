import { Sparkles } from "@medusajs/icons";
import { Switch, Text } from "@medusajs/ui";

interface AiBgToggleBarProps {
  readonly enabled: boolean;
  readonly disabled: boolean;
  readonly statusMessage: string | null;
  readonly onChange: (nextEnabled: boolean) => void;
}

export function AiBgToggleBar({
  enabled,
  disabled,
  statusMessage,
  onChange,
}: AiBgToggleBarProps) {
  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-base px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ui-fg-interactive" />
          <div className="space-y-0.5">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              ลบฉากหลังด้วย AI อัตโนมัติ (ฟรีบนเบราว์เซอร์)
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              ตัดพื้นหลังเดิมออกแล้ววางสินค้ากลางฉากหลังขาว 1:1 — โหลดโมเดลครั้งแรก ~20MB แล้วแคชไว้ (หากไม่ถูกใจสลับใช้ภาพต้นฉบับได้ทันที)
            </Text>
          </div>
        </div>
        <Switch
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onChange}
          aria-label="เปิดใช้งานการลบฉากหลังด้วย AI"
        />
      </div>

      {statusMessage ? (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-ui-bg-subtle px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ui-fg-interactive" />
          <Text size="xsmall" weight="plus" className="text-ui-fg-base">
            {statusMessage}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
