export const MAX_IMAGE_BYTES = 1_000_000;
export const TARGET_IMAGE_BYTES = 950 * 1024;
export const MAX_PRODUCT_IMAGES = 10;

const DIMENSION_STEPS = [1600, 1280, 960, 720, 480] as const;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45] as const;

export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

export interface ResizedImageResult {
  readonly file: File;
  readonly originalBytes: number;
  readonly finalBytes: number;
  readonly wasResized: boolean;
}

export function computeTargetDimensions(
  width: number,
  height: number,
  maxDimension: number
): Dimensions {
  if (width <= 0 || height <= 0 || maxDimension <= 0) {
    return { width: Math.max(1, width), height: Math.max(1, height) };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
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
  file: File
): Promise<{
  readonly width: number;
  readonly height: number;
  readonly draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  readonly release: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      release: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`ไม่สามารถอ่านไฟล์รูปภาพ ${file.name} ได้`));
    element.src = objectUrl;
  });

  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
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
 * Automatically resizes and compresses an image File in the browser until it is
 * strictly <= 1 MB (`TARGET_IMAGE_BYTES`), outputting JPEG (`.jpg`) for broad
 * compatibility with `@mercurjs/core` upload validation and mobile storefronts.
 */
export async function resizeImageFileToLimit(
  file: File,
  targetBytes: number = TARGET_IMAGE_BYTES
): Promise<ResizedImageResult> {
  if (file.size <= targetBytes) {
    return {
      file,
      originalBytes: file.size,
      finalBytes: file.size,
      wasResized: false,
    };
  }

  const source = await decodeImageSource(file);
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("เบราว์เซอร์ไม่รองรับการย่อขนาดรูปภาพ");
    }

    let smallestBlob: Blob | null = null;

    for (const maxDim of DIMENSION_STEPS) {
      const target = computeTargetDimensions(source.width, source.height, maxDim);
      canvas.width = target.width;
      canvas.height = target.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, target.width, target.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      source.draw(ctx, target.width, target.height);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToJpegBlob(canvas, quality);
        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }
        if (blob.size <= targetBytes) {
          const resizedFile = new File(
            [blob],
            buildResizedFilename(file.name),
            { type: "image/jpeg", lastModified: Date.now() }
          );
          return {
            file: resizedFile,
            originalBytes: file.size,
            finalBytes: resizedFile.size,
            wasResized: true,
          };
        }
      }
    }

    if (!smallestBlob || smallestBlob.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `ไม่สามารถย่อขนาด "${file.name}" ให้ต่ำกว่า 1 MB ได้ กรุณาเลือกรูปที่เล็กลง`
      );
    }

    const fallbackFile = new File(
      [smallestBlob],
      buildResizedFilename(file.name),
      { type: "image/jpeg", lastModified: Date.now() }
    );
    return {
      file: fallbackFile,
      originalBytes: file.size,
      finalBytes: fallbackFile.size,
      wasResized: true,
    };
  } finally {
    source.release();
  }
}
