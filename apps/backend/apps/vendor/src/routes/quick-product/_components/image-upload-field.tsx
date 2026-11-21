import { Photo } from "@medusajs/icons";
import { Button, Input, Label, Text, toast } from "@medusajs/ui";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import { MAX_PRODUCT_IMAGES } from "../../../lib/image-resizer";
import { AiBgToggleBar } from "./ai-bg-toggle-bar";
import { ImagePreviewGrid } from "./image-preview-grid";
import { mergePendingImageUrl } from "./quick-product-helpers";
import { useImageUploadBatch } from "./use-image-upload-batch";

interface ImageUploadFieldProps {
  readonly images: string[];
  readonly pendingUrl: string;
  readonly onPendingUrlChange: (nextUrl: string) => void;
  readonly onChange: (nextImages: string[]) => void;
}

export function ImageUploadField({
  images,
  pendingUrl,
  onPendingUrlChange,
  onChange,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    isUploading,
    remainingSlots,
    removeBgEnabled,
    setRemoveBgEnabled,
    statusMessage,
    revertingUrl,
    revertableUrls,
    processAndUploadFiles,
    revertOriginal,
    clearFallbackForUrl,
  } = useImageUploadBatch({ images, onChange });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    void processAndUploadFiles(files).finally(() => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isUploading && remainingSlots > 0) {
      void processAndUploadFiles(Array.from(event.dataTransfer.files ?? []));
    }
  };

  const handleAddUrl = () => {
    if (!pendingUrl.trim()) return;
    const merged = mergePendingImageUrl(images, pendingUrl, MAX_PRODUCT_IMAGES);
    if (!merged.ok) {
      toast.error(merged.error);
      return;
    }
    onChange(merged.images);
    onPendingUrlChange("");
  };

  const handleUrlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddUrl();
    }
  };

  const handleMakeCover = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    onChange([images[index]!, ...images.filter((_, idx) => idx !== index)]);
  };

  const handleRemove = (index: number) => {
    const removedUrl = images[index];
    onChange(images.filter((_, idx) => idx !== index));
    clearFallbackForUrl(removedUrl);
  };

  return (
    <div className="space-y-3" data-tamadee-auto-resize="handled">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>
            รูปภาพสินค้า ({images.length}/{MAX_PRODUCT_IMAGES} รูป — รูปแรกเป็นภาพปก)
          </Label>
          <Text size="xsmall" className="text-ui-fg-subtle">
            ปรับขนาดอัตโนมัติเป็นสี่เหลี่ยมจัตุรัส 1:1 (1080×1080) พื้นหลังขาว (≤ 1 MB) ไม่ตัดขอบสินค้า
          </Text>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            size="small"
            variant="secondary"
            isLoading={isUploading}
            disabled={remainingSlots <= 0}
            onClick={() => fileInputRef.current?.click()}
          >
            <Photo />
            {isUploading ? "กำลังประมวลผลรูปภาพ..." : "เลือกรูปภาพ (หลายรูป)"}
          </Button>
        </div>
      </div>

      <AiBgToggleBar
        enabled={removeBgEnabled}
        disabled={isUploading}
        statusMessage={statusMessage}
        onChange={setRemoveBgEnabled}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() =>
          !isUploading && remainingSlots > 0 && fileInputRef.current?.click()
        }
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          isDragging
            ? "border-ui-fg-interactive bg-ui-bg-subtle-hover"
            : "border-ui-border-strong bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover"
        }`}
      >
        <Photo className="h-6 w-6 text-ui-fg-subtle" />
        <Text size="small" weight="plus">
          แตะเพื่อเลือกรูปจากมือถือ หรือลากวางหลายรูปที่นี่ (เพิ่มได้อีก {remainingSlots} รูป)
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">
          รองรับ JPG / PNG / WebP • จัดกรอบ 1:1 พื้นหลังขาวให้อัตโนมัติ (≤ 1 MB)
        </Text>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={pendingUrl}
          onChange={(e) => onPendingUrlChange(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder="หรือวางลิงก์รูปภาพ เช่น https://..."
          disabled={remainingSlots <= 0}
        />
        <Button
          type="button"
          size="small"
          variant="secondary"
          className="w-full shrink-0 sm:w-auto"
          disabled={!pendingUrl.trim() || remainingSlots <= 0}
          onClick={handleAddUrl}
        >
          เพิ่มลิงก์
        </Button>
      </div>

      <ImagePreviewGrid
        images={images}
        revertableUrls={revertableUrls}
        revertingUrl={revertingUrl}
        onMakeCover={handleMakeCover}
        onRevertOriginal={(idx) => void revertOriginal(idx)}
        onRemove={handleRemove}
      />
    </div>
  );
}
