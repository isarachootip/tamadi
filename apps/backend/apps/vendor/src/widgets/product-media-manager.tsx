import { Button, Container, Heading, Switch, Text, toast } from "@medusajs/ui";
import { defineWidgetConfig } from "@mercurjs/dashboard-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MAX_PRODUCT_IMAGES } from "../lib/image-resizer";
import { updateTamadeeProductMedia } from "../lib/tamadee-api";
import { ImageUploadField } from "../routes/quick-product/_components/image-upload-field";
import { mergePendingImageUrl } from "../routes/quick-product/_components/quick-product-helpers";

interface ProductWidgetData {
  readonly id?: string;
  readonly title?: string;
  readonly status?: string;
  readonly thumbnail?: string | null;
  readonly images?: Array<{ readonly url?: string }>;
}

interface ProductMediaManagerProps {
  readonly data?: ProductWidgetData;
}

export const config = defineWidgetConfig({
  zone: "product.detail.main.after",
});

function extractInitialImages(product?: ProductWidgetData): string[] {
  if (!product) {
    return [];
  }
  const urls = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images ?? [])
      .map((img) => img.url)
      .filter((url): url is string => Boolean(url)),
  ];
  return Array.from(new Set(urls)).slice(0, MAX_PRODUCT_IMAGES);
}

export default function ProductMediaManagerWidget({
  data: product,
}: ProductMediaManagerProps) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(() =>
    extractInitialImages(product)
  );
  const [pendingUrl, setPendingUrl] = useState("");
  const [publishNow, setPublishNow] = useState(
    product?.status !== "published"
  );

  useEffect(() => {
    setImages(extractInitialImages(product));
    setPublishNow(product?.status !== "published");
  }, [product?.id, product?.thumbnail, product?.status, product?.images?.length]);

  const saveMutation = useMutation({
    mutationFn: (payload: { images: string[]; publish: boolean }) =>
      updateTamadeeProductMedia(product!.id!, {
        images: payload.images,
        thumbnail: payload.images[0] ?? null,
        ...(payload.publish ? { publish_immediately: true } : {}),
      }),
    onSuccess: (res) => {
      const pubText =
        res.product.status === "published" ? " และเผยแพร่ (Published) แล้ว" : "";
      toast.success(
        `บันทึกรูปภาพ ${res.product.images.length} รูปเรียบร้อย${pubText}`
      );
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({
        queryKey: ["product", product?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "ไม่สามารถบันทึกรูปภาพสินค้าได้");
    },
  });

  if (!product?.id) {
    return null;
  }

  const isUnpublished = product.status !== "published";

  const handleSave = () => {
    const merged = mergePendingImageUrl(images, pendingUrl, MAX_PRODUCT_IMAGES);
    if (!merged.ok) {
      toast.error(merged.error);
      return;
    }
    if (pendingUrl.trim()) {
      setImages(merged.images);
      setPendingUrl("");
    }
    saveMutation.mutate({
      images: merged.images,
      publish: isUnpublished && publishNow,
    });
  };

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h2">จัดการรูปภาพสินค้า (หลายรูป + ย่อขนาดอัตโนมัติ ≤ 1MB)</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          เพิ่ม ลบ หรือเปลี่ยนภาพปกได้ทันที ระบบย่อขนาดไฟล์ใหญ่กว่า 1 MB ให้อัตโนมัติก่อนอัปโหลด
        </Text>
      </div>

      <div className="space-y-4 px-6 py-5">
        <ImageUploadField
          images={images}
          pendingUrl={pendingUrl}
          onPendingUrlChange={setPendingUrl}
          onChange={setImages}
        />

        {isUnpublished && (
          <div className="flex items-center justify-between rounded-lg border border-ui-border-base px-4 py-3">
            <div>
              <Text size="small" weight="plus">
                เผยแพร่ขายทันที (Publish)
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                เปลี่ยนสถานะสินค้านี้จาก {product.status} เป็น Published พร้อมบันทึกรูปภาพ
              </Text>
            </div>
            <Switch checked={publishNow} onCheckedChange={setPublishNow} />
          </div>
        )}

        <div className="flex justify-end border-t border-ui-border-base pt-4">
          <Button
            type="button"
            isLoading={saveMutation.isPending}
            onClick={handleSave}
          >
            {isUnpublished && publishNow
              ? "บันทึกรูปภาพและเผยแพร่ (Publish)"
              : "บันทึกรูปภาพสินค้า"}
          </Button>
        </div>
      </div>
    </Container>
  );
}
