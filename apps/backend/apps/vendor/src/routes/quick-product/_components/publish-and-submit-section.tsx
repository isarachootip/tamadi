import { Button, Input, Label, Switch, Text } from "@medusajs/ui";

interface PublishAndSubmitSectionProps {
  readonly weightGrams: string;
  readonly onWeightChange: (value: string) => void;
  readonly publishImmediately: boolean;
  readonly onPublishChange: (checked: boolean) => void;
  readonly isSubmitting: boolean;
  readonly onCancel: () => void;
}

export function PublishAndSubmitSection({
  weightGrams,
  onWeightChange,
  publishImmediately,
  onPublishChange,
  isSubmitting,
  onCancel,
}: PublishAndSubmitSectionProps) {
  return (
    <>
      <section className="space-y-4 px-4 py-5 sm:px-6">
        <Text size="small" weight="plus" className="text-ui-fg-base">
          4. น้ำหนักและการเผยแพร่
        </Text>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quick-product-weight">น้ำหนักโดยประมาณ (กรัม)</Label>
            <Input
              id="quick-product-weight"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={weightGrams}
              onChange={(e) => onWeightChange(e.target.value)}
              placeholder="เช่น 250"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
            <div>
              <Label htmlFor="quick-product-publish">เผยแพร่ขายทันที</Label>
              <Text size="xsmall" className="text-ui-fg-subtle">
                แสดงสินค้าบนหน้าร้านทันทีหลังบันทึก (ปิดเพื่อบันทึกเป็นแบบร่าง)
              </Text>
            </div>
            <Switch
              id="quick-product-publish"
              checked={publishImmediately}
              onCheckedChange={onPublishChange}
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 bg-ui-bg-base/95 px-4 py-3 backdrop-blur sm:static sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          isLoading={isSubmitting}
        >
          บันทึกและลงขายสินค้า
        </Button>
      </div>
    </>
  );
}
