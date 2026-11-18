export interface CompressedImagePayload {
  readonly base64: string;
  readonly mimeType: "image/jpeg";
  readonly previewDataUrl: string;
  readonly fileNameHint: string;
}

function cleanFileNameHint(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_0-9]+/g, " ")
    .trim()
    .slice(0, 60);
}

export function compressImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.82
): Promise<CompressedImagePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        reject(new Error("ข้อมูลรูปภาพว่างเปล่า"));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error("ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("เบราว์เซอร์ไม่รองรับการประมวลผลรูปภาพ"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
        const commaIdx = jpegDataUrl.indexOf(",");
        const base64 =
          commaIdx !== -1 ? jpegDataUrl.slice(commaIdx + 1) : jpegDataUrl;

        resolve({
          base64,
          mimeType: "image/jpeg",
          previewDataUrl: jpegDataUrl,
          fileNameHint: cleanFileNameHint(file.name),
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
