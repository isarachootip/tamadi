import { Photo } from "@medusajs/icons";
import { Button, Input, Label, Text, toast } from "@medusajs/ui";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import {
  MAX_PRODUCT_IMAGES,
  resizeImageFileToLimit,
} from "../../../lib/image-resizer";
import { uploadVendorImages } from "../../../lib/tamadee-api";
import { ImagePreviewGrid } from "./image-preview-grid";
import { mergePendingImageUrl } from "./quick-product-helpers";

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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - images.length);

  const processAndUploadFiles = async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0 || remainingSlots <= 0) return;

    setIsUploading(true);
    try {
      const resizedFiles: File[] = [];
      let resizedCount = 0;
      for (const file of imageFiles.slice(0, remainingSlots)) {
        const result = await resizeImageFileToLimit(file);
        resizedFiles.push(result.file);
        if (result.wasResized) resizedCount += 1;
      }

      const uploadedUrls = await uploadVendorImages(resizedFiles);
      onChange(
        Array.from(new Set([...images, ...uploadedUrls])).slice(0, MAX_PRODUCT_IMAGES)
      );
      const resizeNote =
        resizedCount > 0 ? ` (ย่อขนาดอัตโนมัติ ≤ 1MB จำนวน ${resizedCount} รูป)` : "";
      toast.success(`อัปโหลดรูปภาพแล้ว ${uploadedUrls.length} รูป${resizeNote}`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void processAndUploadFiles(Array.from(event.target.files ?? []));
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
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3" data-tamadee-auto-resize="handled">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>
            รูปภาพสินค้า ({images.length}/{MAX_PRODUCT_IMAGES} รูป — รูปแรกเป็นภาพปก)
          </Label>
          <Text size="xsmall" className="text-ui-fg-subtle">
            เลือกหรือลากวางได้หลายรูปพร้อมกัน ระบบจะย่อขนาดอัตโนมัติให้ไม่เกิน 1 MB ต่อรูป
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
            {isUploading ? "กำลังย่อขนาดและอัปโหลด..." : "เลือกรูปภาพ (หลายรูป)"}
          </Button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && remainingSlots > 0 && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-4 text-center transition-colors ${
          isDragging
            ? "border-ui-fg-interactive bg-ui-bg-subtle-hover"
            : "border-ui-border-strong bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover"
        }`}
      >
        <Text size="small" className="font-medium">
          คลิกหรือลากไฟล์รูปภาพมาวางที่นี่ (เพิ่มได้อีก {remainingSlots} รูป)
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">
          รองรับ JPG / PNG / WebP • ไฟล์ใหญ่กว่า 1 MB จะถูก Resize อัตโนมัติก่อนอัปโหลด
        </Text>
      </div>

      <div className="flex items-center gap-2">
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
          disabled={!pendingUrl.trim() || remainingSlots <= 0}
          onClick={handleAddUrl}
        >
          เพิ่มลิงก์
        </Button>
      </div>

      <ImagePreviewGrid
        images={images}
        onMakeCover={handleMakeCover}
        onRemove={handleRemove}
      />
    </div>
  );
}
