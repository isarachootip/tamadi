import {
  computeContainPlacement,
  STANDARD_BG_HEX,
  STANDARD_CANVAS_SIZE,
} from "./image-canvas-geometry";

export const MAX_IMAGE_BYTES = 1_000_000;
export const TARGET_IMAGE_BYTES = 950 * 1024;
export const MAX_PRODUCT_IMAGES = 10;

const CANVAS_SIZE_STEPS = [STANDARD_CANVAS_SIZE, 960, 800, 640] as const;
const QUALITY_STEPS = [0.88, 0.80, 0.72, 0.62, 0.50] as const;

export interface StandardizeImageOptions {
  readonly targetBytes?: number;
  readonly backgroundColor?: string;
  readonly paddingRatio?: number;
}

export interface ResizedImageResult {
  readonly file: File;
  readonly originalBytes: number;
  readonly finalBytes: number;
  readonly wasResized: boolean;
}

export function buildResizedFilename(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "").trim() || "product-image";
  return `${base}.jpg`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function decodeImageSource(
  sourceBlob: Blob,
  label: string
): Promise<{
  readonly width: number;
  readonly height: number;
  readonly draw: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
  readonly release: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(sourceBlob);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, x, y, w, h) => ctx.drawImage(bitmap, x, y, w, h),
      release: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(sourceBlob);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () =>
      reject(new Error(`ไม่สามารถอ่านไฟล์รูปภาพ ${label} ได้`));
    element.src = objectUrl;
  });

  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (ctx, x, y, w, h) => ctx.drawImage(img, x, y, w, h),
    release: () => URL.revokeObjectURL(objectUrl),
  };
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("ไม่สามารถบีบอัดไฟล์รูปภาพได้"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Standardizes any uploaded product image into a uniform 1:1 square (`1080x1080`)
 * JPEG on a pure white (`#FFFFFF`) background using centered `contain` framing
 * (zero cropping of food/products), compressed strictly <= 1 MB.
 */
export async function standardizeProductImage(
  source: File | Blob,
  filename: string,
  options: StandardizeImageOptions = {}
): Promise<ResizedImageResult> {
  const targetBytes = options.targetBytes ?? TARGET_IMAGE_BYTES;
  const backgroundColor = options.backgroundColor ?? STANDARD_BG_HEX;
  const paddingRatio = options.paddingRatio ?? 0;

  const decoded = await decodeImageSource(source, filename);
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("เบราว์เซอร์ไม่รองรับการปรับขนาดรูปภาพ");
    }

    let smallestBlob: Blob | null = null;

    for (const canvasSize of CANVAS_SIZE_STEPS) {
      const rect = computeContainPlacement(
        decoded.width,
        decoded.height,
        canvasSize,
        paddingRatio
      );
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      decoded.draw(ctx, rect.x, rect.y, rect.drawWidth, rect.drawHeight);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToJpegBlob(canvas, quality);
        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }
        if (blob.size <= targetBytes) {
          const standardized = new File([blob], buildResizedFilename(filename), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          return {
            file: standardized,
            originalBytes: source.size,
            finalBytes: standardized.size,
            wasResized: true,
          };
        }
      }
    }

    if (!smallestBlob || smallestBlob.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `ไม่สามารถย่อขนาด "${filename}" ให้ต่ำกว่า 1 MB ได้ กรุณาเลือกรูปที่เล็กลง`
      );
    }

    const fallbackFile = new File(
      [smallestBlob],
      buildResizedFilename(filename),
      { type: "image/jpeg", lastModified: Date.now() }
    );
    return {
      file: fallbackFile,
      originalBytes: source.size,
      finalBytes: fallbackFile.size,
      wasResized: true,
    };
  } finally {
    decoded.release();
  }
}

export async function resizeImageFileToLimit(
  file: File,
  targetBytes: number = TARGET_IMAGE_BYTES
): Promise<ResizedImageResult> {
  return standardizeProductImage(file, file.name, { targetBytes });
}
