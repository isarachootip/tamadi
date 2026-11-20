import { Plus, Trash } from "@medusajs/icons";
import { Button, Input, Label, Text } from "@medusajs/ui";
import {
  createEmptyVariantRow,
  type VariantRowDraft,
} from "./quick-product-helpers";

interface VariantRowsEditorProps {
  readonly rows: VariantRowDraft[];
  readonly optionTitle: string;
  readonly onOptionTitleChange: (value: string) => void;
  readonly onChange: (nextRows: VariantRowDraft[]) => void;
}

export function VariantRowsEditor({
  rows,
  optionTitle,
  onOptionTitleChange,
  onChange,
}: VariantRowsEditorProps) {
  const updateRow = (
    id: string,
    field: keyof Omit<VariantRowDraft, "id">,
    value: string
  ) => {
    onChange(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    onChange([...rows, createEmptyVariantRow(rows.length)]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      return;
    }
    onChange(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>ตัวเลือกสินค้า ราคา (บาท) และสต็อก *</Label>
          <Text size="xsmall" className="text-ui-fg-subtle">
            หากสินค้ามีหลายขนาด/รสชาติ กด "เพิ่มตัวเลือก" ได้สูงสุด 30 รายการ
          </Text>
        </div>

        <Button
          type="button"
          size="small"
          variant="secondary"
          disabled={rows.length >= 30}
          onClick={addRow}
        >
          <Plus />
          เพิ่มตัวเลือก
        </Button>
      </div>

      {rows.length > 1 && (
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="quick-option-title">ชื่อหัวข้อตัวเลือก</Label>
          <Input
            id="quick-option-title"
            value={optionTitle}
            onChange={(e) => onOptionTitleChange(e.target.value)}
            placeholder="เช่น ขนาด, รสชาติ, ไซส์"
          />
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-3 rounded-lg border border-ui-border-base p-3 md:grid-cols-12"
          >
            <div className="space-y-1 md:col-span-4">
              <Label htmlFor={`variant-title-${row.id}`}>
                ชื่อตัวเลือก #{index + 1} *
              </Label>
              <Input
                id={`variant-title-${row.id}`}
                value={row.title}
                onChange={(e) => updateRow(row.id, "title", e.target.value)}
                placeholder="เช่น ธรรมดา, พิเศษ, ไซส์ M"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <Label htmlFor={`variant-price-${row.id}`}>ราคา (THB) *</Label>
              <Input
                id={`variant-price-${row.id}`}
                type="number"
                min="1"
                step="1"
                value={row.priceThb}
                onChange={(e) => updateRow(row.id, "priceThb", e.target.value)}
                placeholder="เช่น 120"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor={`variant-stock-${row.id}`}>สต็อก (ชิ้น) *</Label>
              <Input
                id={`variant-stock-${row.id}`}
                type="number"
                min="0"
                step="1"
                value={row.stockQuantity}
                onChange={(e) =>
                  updateRow(row.id, "stockQuantity", e.target.value)
                }
                placeholder="10"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor={`variant-sku-${row.id}`}>SKU (ไม่บังคับ)</Label>
              <Input
                id={`variant-sku-${row.id}`}
                value={row.sku}
                onChange={(e) => updateRow(row.id, "sku", e.target.value)}
                placeholder="สร้างให้อัตโนมัติ"
              />
            </div>

            <div className="flex items-end justify-end md:col-span-1">
              <Button
                type="button"
                size="small"
                variant="transparent"
                disabled={rows.length <= 1}
                onClick={() => removeRow(row.id)}
                aria-label="ลบตัวเลือก"
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
