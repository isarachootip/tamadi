import { Plus } from "@medusajs/icons";
import { Container, Heading, Input, Label, Text, Textarea, toast } from "@medusajs/ui";
import type { RouteConfig } from "@mercurjs/dashboard-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTamadeeQuickProduct, listTamadeeCategories } from "../../lib/tamadee-api";
import { ImageUploadField } from "./_components/image-upload-field";
import { InlineCategorySelector } from "./_components/inline-category-selector";
import { PublishAndSubmitSection } from "./_components/publish-and-submit-section";
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
    <div className="mx-auto max-w-4xl space-y-4 pb-24 sm:pb-10">
      <Container className="overflow-hidden bg-ui-bg-base p-0">
        <div className="border-b border-ui-border-base bg-ui-bg-base px-4 py-4 sm:px-6">
          <Heading level="h1" className="text-lg sm:text-xl">
            เพิ่มสินค้าใหม่พร้อมราคาและสต็อก
          </Heading>
          <Text size="small" className="mt-0.5 text-ui-fg-subtle">
            กรอกง่ายในหน้าเดียว ครบทั้งชื่อ รูปภาพ ราคาบาท และจำนวนสต็อก
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-ui-border-base">
          <section className="space-y-4 px-4 py-5 sm:px-6">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              1. ข้อมูลสินค้า
            </Text>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="quick-product-title">ชื่อสินค้า *</Label>
                <Input
                  id="quick-product-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น พอร์คช็อป, น้ำพริกเผากุ้งแห้ง"
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
          </section>

          <section className="space-y-3 px-4 py-5 sm:px-6">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              2. รูปภาพสินค้า
            </Text>
            <ImageUploadField
              images={images}
              pendingUrl={pendingImageUrl}
              onPendingUrlChange={setPendingImageUrl}
              onChange={setImages}
            />
          </section>

          <section className="space-y-3 px-4 py-5 sm:px-6">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              3. ราคาและสต็อก
            </Text>
            <VariantRowsEditor
              rows={variantRows}
              optionTitle={optionTitle}
              onOptionTitleChange={setOptionTitle}
              onChange={setVariantRows}
            />
          </section>

          <PublishAndSubmitSection
            weightGrams={weightGrams}
            onWeightChange={setWeightGrams}
            publishImmediately={publishImmediately}
            onPublishChange={setPublishImmediately}
            isSubmitting={createProductMutation.isPending}
            onCancel={() => navigate("/products")}
          />
        </form>
      </Container>
    </div>
  );
}
