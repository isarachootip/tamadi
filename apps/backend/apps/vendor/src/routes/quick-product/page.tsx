import { Plus } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui";
import type { RouteConfig } from "@mercurjs/dashboard-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTamadeeQuickProduct, listTamadeeCategories } from "../../lib/tamadee-api";
import { ImageUploadField } from "./_components/image-upload-field";
import { InlineCategorySelector } from "./_components/inline-category-selector";
import {
  buildQuickProductPayload,
  createEmptyVariantRow,
  type VariantRowDraft,
} from "./_components/quick-product-helpers";
import { VariantRowsEditor } from "./_components/variant-rows-editor";

export const config: RouteConfig = {
  label: "เพิ่มสินค้าด่วน",
  icon: Plus,
  nested: "/products",
};

export const handle = {
  breadcrumb: () => "เพิ่มสินค้าด่วน",
};

export default function QuickProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("__none__");
  const [weightGrams, setWeightGrams] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [optionTitle, setOptionTitle] = useState("ตัวเลือก");
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [variantRows, setVariantRows] = useState<VariantRowDraft[]>([
    createEmptyVariantRow(0),
  ]);

  const { data: categories = [] } = useQuery({
    queryKey: ["tamadee-categories"],
    queryFn: listTamadeeCategories,
  });

  const createProductMutation = useMutation({
    mutationFn: createTamadeeQuickProduct,
    onSuccess: (result) => {
      const shippingNotice = result.provisioned_fulfillment
        ? " และสร้างคลังสินค้า/ค่าส่งมาตรฐาน (฿45) ให้อัตโนมัติแล้ว"
        : "";
      toast.success(
        `สร้างสินค้า "${result.product.title}" พร้อม ${result.offers.length} ตัวเลือกเรียบร้อย${shippingNotice}`
      );
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["offers"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      navigate("/offers");
    },
    onError: (error: Error) => {
      toast.error(error.message || "ไม่สามารถสร้างสินค้าได้");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const built = buildQuickProductPayload({
      title,
      description,
      categoryId,
      weightGrams,
      images,
      pendingImageUrl,
      optionTitle,
      publishImmediately,
      variantRows,
    });
    if (!built.ok) {
      toast.error(built.error);
      return;
    }
    if (pendingImageUrl.trim()) {
      setImages(built.finalImages);
      setPendingImageUrl("");
    }
    createProductMutation.mutate(built.payload);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Container className="p-0">
        <div className="border-b border-ui-border-base px-6 py-4">
          <Heading level="h1">เพิ่มสินค้าใหม่พร้อมราคาและสต็อก</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            สร้างสินค้า ตัวเลือก ตั้งราคาบาท (THB) และจำนวนสต็อกครบจบในหน้าเดียว
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-product-title">ชื่อสินค้า *</Label>
              <Input
                id="quick-product-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น น้ำพริกเผากุ้งแห้งสูตรครัวคุณแหม่ม"
                required
              />
            </div>

            <InlineCategorySelector
              categories={categories}
              selectedCategoryId={categoryId}
              onSelect={setCategoryId}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-product-desc">รายละเอียดสินค้า</Label>
            <Textarea
              id="quick-product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="บอกจุดเด่น วัตถุดิบ วิธีเก็บรักษา หรือข้อมูลจัดส่ง"
              rows={3}
            />
          </div>

          <ImageUploadField
            images={images}
            pendingUrl={pendingImageUrl}
            onPendingUrlChange={setPendingImageUrl}
            onChange={setImages}
          />

          <div className="border-t border-ui-border-base pt-5">
            <VariantRowsEditor
              rows={variantRows}
              optionTitle={optionTitle}
              onOptionTitleChange={setOptionTitle}
              onChange={setVariantRows}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-ui-border-base pt-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-product-weight">น้ำหนักโดยประมาณ (กรัม)</Label>
              <Input
                id="quick-product-weight"
                type="number"
                min="1"
                step="1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="เช่น 250"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-ui-border-base px-4 py-3">
              <div>
                <Label htmlFor="quick-product-publish">เผยแพร่ขายทันที</Label>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  เปิดขายและแสดงสินค้าบนหน้าร้านทันทีหลังบันทึก (ปิดเพื่อบันทึกเป็นแบบร่าง)
                </Text>
              </div>
              <Switch
                id="quick-product-publish"
                checked={publishImmediately}
                onCheckedChange={setPublishImmediately}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-ui-border-base pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/products")}
              disabled={createProductMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={createProductMutation.isPending}>
              บันทึกและลงขายสินค้า
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
