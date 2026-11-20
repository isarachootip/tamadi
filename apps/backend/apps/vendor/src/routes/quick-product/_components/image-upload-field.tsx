import { Photo, Trash } from "@medusajs/icons";
import { Button, Input, Label, Text, toast } from "@medusajs/ui";
import { type ChangeEvent, useRef, useState } from "react";
import { uploadVendorImage } from "../../../lib/tamadee-api";

interface ImageUploadFieldProps {
  readonly images: string[];
  readonly onChange: (nextImages: string[]) => void;
}

export function ImageUploadField({ images, onChange }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles.slice(0, Math.max(1, 8 - images.length))) {
        const url = await uploadVendorImage(file);
        uploadedUrls.push(url);
      }
      onChange([...images, ...uploadedUrls]);
      toast.success(`อัปโหลดรูปภาพแล้ว ${uploadedUrls.length} รูป`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      toast.error("กรุณากรอก URL รูปภาพที่ถูกต้อง (ขึ้นต้นด้วย https://)");
      return;
    }
    if (images.includes(trimmed)) {
      setUrlInput("");
      return;
    }
    onChange([...images, trimmed]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>รูปภาพสินค้า (รูปแรกจะเป็นภาพปก)</Label>
          <Text size="xsmall" className="text-ui-fg-subtle">
            รองรับอัปโหลดไฟล์ JPG/PNG/WebP หรือวาง URL รูปภาพ (สูงสุด 8 รูป)
          </Text>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            size="small"
            variant="secondary"
            isLoading={isUploading}
            disabled={images.length >= 8}
            onClick={() => fileInputRef.current?.click()}
          >
            <Photo />
            อัปโหลดรูปภาพ
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="หรือวางลิงก์รูปภาพ เช่น https://..."
          disabled={images.length >= 8}
        />
        <Button
          type="button"
          size="small"
          variant="secondary"
          disabled={!urlInput.trim() || images.length >= 8}
          onClick={handleAddUrl}
        >
          เพิ่มลิงก์
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle"
            >
              <img
                src={url}
                alt={`Product preview ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-ui-bg-base/90 px-1.5 py-0.5 text-[10px] font-medium">
                  ภาพปก
                </span>
              )}
              <Button
                type="button"
                size="small"
                variant="danger"
                className="absolute right-1.5 top-1.5 h-6 w-6 p-0"
                onClick={() => handleRemove(index)}
                aria-label="ลบรูปภาพ"
              >
                <Trash />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
