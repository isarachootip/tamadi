import { toast } from "@medusajs/ui";
import { useMemo, useState } from "react";
import { processImageWithOptionalAiBg } from "../../../lib/ai-background-remover";
import { MAX_PRODUCT_IMAGES } from "../../../lib/image-resizer";
import { uploadVendorImages } from "../../../lib/tamadee-api";

interface UseImageUploadBatchParams {
  readonly images: string[];
  readonly onChange: (nextImages: string[]) => void;
}

export function useImageUploadBatch({
  images,
  onChange,
}: UseImageUploadBatchParams) {
  const [isUploading, setIsUploading] = useState(false);
  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [revertingUrl, setRevertingUrl] = useState<string | null>(null);
  const [originalFallbacks, setOriginalFallbacks] = useState<Record<string, File>>({});

  const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - images.length);
  const revertableUrls = useMemo(
    () => new Set(Object.keys(originalFallbacks)),
    [originalFallbacks]
  );

  const processAndUploadFiles = async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0 || remainingSlots <= 0) return;

    const batch = imageFiles.slice(0, remainingSlots);
    setIsUploading(true);
    try {
      const processedFiles: File[] = [];
      const pendingOriginals: Array<File | null> = [];
      let aiCount = 0;
      let fallbackCount = 0;

      for (const [index, file] of batch.entries()) {
        const prefix = batch.length > 1 ? `(${index + 1}/${batch.length}) ` : "";
        setStatusMessage(
          removeBgEnabled
            ? `${prefix}กำลังเตรียมตัดฉากหลังด้วย AI...`
            : `${prefix}กำลังจัดกรอบ 1:1 พื้นหลังขาว...`
        );
        const result = await processImageWithOptionalAiBg(file, {
          removeBg: removeBgEnabled,
          onStatus: (msg) => setStatusMessage(`${prefix}${msg}`),
        });
        processedFiles.push(result.file);
        pendingOriginals.push(result.aiApplied ? result.originalStandardFile : null);
        if (result.aiApplied) aiCount += 1;
        if (result.fallbackReason) fallbackCount += 1;
      }

      setStatusMessage("กำลังอัปโหลดรูปภาพ...");
      const uploadedUrls = await uploadVendorImages(processedFiles);
      const nextFallbacks: Record<string, File> = { ...originalFallbacks };
      uploadedUrls.forEach((url, idx) => {
        const orig = pendingOriginals[idx];
        if (orig) nextFallbacks[url] = orig;
      });
      setOriginalFallbacks(nextFallbacks);

      onChange(
        Array.from(new Set([...images, ...uploadedUrls])).slice(0, MAX_PRODUCT_IMAGES)
      );
      if (fallbackCount > 0) {
        toast.warning(
          `AI ตัดฉากหลังไม่สำเร็จ ${fallbackCount} รูป — ระบบใช้กรอบ 1:1 พื้นหลังขาวมาตรฐานให้อัตโนมัติ`
        );
      }
      const aiNote =
        aiCount > 0
          ? ` (ลบฉากหลังด้วย AI ${aiCount} รูป)`
          : " (จัดกรอบ 1:1 พื้นหลังขาว)";
      toast.success(`อัปโหลดรูปภาพแล้ว ${uploadedUrls.length} รูป${aiNote}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setIsUploading(false);
      setStatusMessage(null);
    }
  };

  const revertOriginal = async (index: number) => {
    const targetUrl = images[index];
    const originalFile = targetUrl ? originalFallbacks[targetUrl] : undefined;
    if (!targetUrl || !originalFile) return;

    setRevertingUrl(targetUrl);
    try {
      const [uploadedUrl] = await uploadVendorImages([originalFile]);
      if (!uploadedUrl) return;
      onChange(images.map((url, idx) => (idx === index ? uploadedUrl : url)));
      clearFallbackForUrl(targetUrl);
      toast.success("สลับกลับมาใช้ภาพต้นฉบับ (กรอบ 1:1 พื้นหลังขาว) เรียบร้อย");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถสลับกลับเป็นภาพต้นฉบับได้"
      );
    } finally {
      setRevertingUrl(null);
    }
  };

  const clearFallbackForUrl = (url?: string) => {
    if (!url || !originalFallbacks[url]) return;
    setOriginalFallbacks((prev) => {
      const copy = { ...prev };
      delete copy[url];
      return copy;
    });
  };

  return {
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
  };
}
