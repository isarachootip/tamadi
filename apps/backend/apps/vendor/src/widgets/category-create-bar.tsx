import { Plus } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { defineWidgetConfig } from "@mercurjs/dashboard-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import {
  createTamadeeCategory,
  listTamadeeCategories,
} from "../lib/tamadee-api";

export const config = defineWidgetConfig({
  zone: "categories.list.before",
});

export default function CategoryCreateBar() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("__none__");

  const { data: categories = [] } = useQuery({
    queryKey: ["tamadee-categories"],
    queryFn: listTamadeeCategories,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: createTamadeeCategory,
    onSuccess: (created) => {
      toast.success(`สร้างหมวดหมู่ "${created.name}" เรียบร้อยแล้ว`);
      setName("");
      setDescription("");
      setParentId("__none__");
      setIsOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["tamadee-categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "ไม่สามารถสร้างหมวดหมู่สินค้าได้");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("กรุณากรอกชื่อหมวดหมู่สินค้า");
      return;
    }

    createMutation.mutate({
      name: trimmed,
      description: description.trim() || undefined,
      parent_category_id: parentId === "__none__" ? null : parentId,
    });
  };

  return (
    <Container className="mb-4 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div>
          <Heading level="h2">สร้างหมวดหมู่สินค้าใหม่ (Category)</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            เพิ่มหมวดหมู่ให้เหมาะกับสินค้าของร้านคุณ (เช่น อาหารโฮมเมด ขนม เครื่องดื่ม)
          </Text>
        </div>
        <Button
          type="button"
          size="small"
          variant={isOpen ? "secondary" : "primary"}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Plus />
          {isOpen ? "ปิดฟอร์ม" : "สร้างหมวดหมู่ใหม่"}
        </Button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-ui-border-base px-6 py-4 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tamadee-cat-name">ชื่อหมวดหมู่ *</Label>
              <Input
                id="tamadee-cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น อาหารโฮมเมด, น้ำพริก, ขนมไทย"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tamadee-cat-parent">หมวดหมู่หลัก (ไม่บังคับ)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <Select.Trigger id="tamadee-cat-parent">
                  <Select.Value placeholder="ไม่มีหมวดหมู่หลัก (ระดับบนสุด)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="__none__">
                    ไม่มีหมวดหมู่หลัก (ระดับบนสุด)
                  </Select.Item>
                  {categories.map((cat) => (
                    <Select.Item key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tamadee-cat-desc">คำอธิบาย (ไม่บังคับ)</Label>
            <Textarea
              id="tamadee-cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดสั้น ๆ ของหมวดหมู่สินค้า"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="small"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="small"
              isLoading={createMutation.isPending}
            >
              บันทึกหมวดหมู่
            </Button>
          </div>
        </form>
      )}
    </Container>
  );
}
