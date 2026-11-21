import {
  AI_STUDIO_PADDING_RATIO,
  STANDARD_BG_HEX,
} from "./image-canvas-geometry";
import { standardizeProductImage } from "./image-resizer";

export interface ProcessedProductImage {
  readonly file: File;
  readonly originalStandardFile: File;
  readonly aiApplied: boolean;
  readonly fallbackReason?: string;
}

export interface ProcessProductImageOptions {
  readonly removeBg: boolean;
  readonly onStatus?: (message: string) => void;
}

function formatProgressLabel(key: string, current: number, total: number): string {
  const percent =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (key.includes("fetch")) {
    return percent > 0
      ? `กำลังโหลดโมเดล AI (${percent}%)...`
      : "กำลังโหลดโมเดล AI...";
  }
  return "กำลังตัดฉากหลังด้วย AI...";
}

/**
 * Produces a standardized 1:1 `#FFFFFF` product image, optionally running
 * client-side AI background removal (`@imgly/background-removal`, lazy-loaded).
 * If AI fails or is unsupported, automatically falls back to the instant 1:1
 * white-canvas image so sellers are never blocked from uploading.
 */
export async function processImageWithOptionalAiBg(
  sourceFile: File,
  options: ProcessProductImageOptions
): Promise<ProcessedProductImage> {
  const originalResult = await standardizeProductImage(
    sourceFile,
    sourceFile.name,
    { backgroundColor: STANDARD_BG_HEX, paddingRatio: 0 }
  );

  if (!options.removeBg) {
    return {
      file: originalResult.file,
      originalStandardFile: originalResult.file,
      aiApplied: false,
    };
  }

  try {
    options.onStatus?.("กำลังเตรียมโมเดล AI ตัดฉากหลัง...");
    const { removeBackground } = await import("@imgly/background-removal");

    const cutoutBlob = await removeBackground(originalResult.file, {
      model: "isnet_quint8",
      output: { format: "image/png" },
      progress: (key: string, current: number, total: number) => {
        options.onStatus?.(formatProgressLabel(key, current, total));
      },
    });

    options.onStatus?.("กำลังจัดกรอบ 1:1 พื้นหลังขาว...");
    const aiStandardized = await standardizeProductImage(
      cutoutBlob,
      sourceFile.name,
      {
        backgroundColor: STANDARD_BG_HEX,
        paddingRatio: AI_STUDIO_PADDING_RATIO,
      }
    );

    return {
      file: aiStandardized.file,
      originalStandardFile: originalResult.file,
      aiApplied: true,
    };
  } catch (error: unknown) {
    const reason =
      error instanceof Error ? error.message : "เบราว์เซอร์ไม่รองรับ AI ตัดฉากหลัง";
    return {
      file: originalResult.file,
      originalStandardFile: originalResult.file,
      aiApplied: false,
      fallbackReason: reason,
    };
  }
}
