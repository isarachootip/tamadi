import { Plus } from "@medusajs/icons";
import { Button, Input, Label, Select, toast } from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createTamadeeCategory,
  type TamadeeCategory,
} from "../../../lib/tamadee-api";

interface InlineCategorySelectorProps {
  readonly categories: TamadeeCategory[];
  readonly selectedCategoryId: string;
  readonly onSelect: (categoryId: string) => void;
}

export function InlineCategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: InlineCategorySelectorProps) {
  const queryClient = useQueryClient();
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const createCategoryMutation = useMutation({
    mutationFn: createTamadeeCategory,
    onSuccess: (created) => {
      toast.success(`สร้างหมวดหมู่ "${created.name}" แล้ว`);
      setNewCategoryName("");
      setShowInlineCreate(false);
      onSelect(created.id);
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["tamadee-categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "สร้างหมวดหมู่ไม่สำเร็จ");
    },
  });

  const handleCreateInline = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("กรุณากรอกชื่อหมวดหมู่ใหม่");
      return;
    }
    createCategoryMutation.mutate({ name: trimmed });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="quick-product-category">หมวดหมู่สินค้า (Category)</Label>
        <Button
          type="button"
          size="small"
          variant="transparent"
          onClick={() => setShowInlineCreate((prev) => !prev)}
        >
          <Plus />
          {showInlineCreate ? "ปิดช่องสร้างหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}
        </Button>
      </div>

      <Select value={selectedCategoryId} onValueChange={onSelect}>
        <Select.Trigger id="quick-product-category">
          <Select.Value placeholder="เลือกหมวดหมู่สินค้า" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="__none__">ไม่ระบุหมวดหมู่</Select.Item>
          {categories.map((cat) => (
            <Select.Item key={cat.id} value={cat.id}>
              {cat.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      {showInlineCreate && (
        <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-2.5 sm:flex-row sm:items-center">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="พิมพ์ชื่อหมวดหมู่ใหม่ เช่น อาหารโฮมเมด"
          />
          <Button
            type="button"
            size="small"
            className="w-full shrink-0 sm:w-auto"
            isLoading={createCategoryMutation.isPending}
            onClick={handleCreateInline}
          >
            บันทึก
          </Button>
        </div>
      )}
    </div>
  );
}
