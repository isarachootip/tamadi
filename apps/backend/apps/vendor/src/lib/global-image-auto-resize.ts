import { toast } from "@medusajs/ui";
import {
  standardizeProductImage,
  TARGET_IMAGE_BYTES,
} from "./image-resizer";

const HANDLED_ATTR = "data-tamadee-auto-resize";
const IMAGE_EXT_PATTERN = /\.(jpe?g|png|webp|heic|avif)$/i;
const syntheticEvents = new WeakSet<Event>();
let installed = false;

function isResizableImage(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT_PATTERN.test(file.name);
}

function isAlreadyHandledTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest(`[${HANDLED_ATTR}="handled"]`));
}

export function needsAutoResize(files: readonly File[]): boolean {
  return files.some((file) => isResizableImage(file));
}

async function standardizeBatch(
  files: readonly File[]
): Promise<{ readonly dataTransfer: DataTransfer; readonly standardizedCount: number }> {
  const dataTransfer = new DataTransfer();
  let standardizedCount = 0;

  for (const file of files) {
    if (isResizableImage(file)) {
      const result = await standardizeProductImage(file, file.name, {
        targetBytes: TARGET_IMAGE_BYTES,
      });
      dataTransfer.items.add(result.file);
      standardizedCount += 1;
    } else {
      dataTransfer.items.add(file);
    }
  }

  return { dataTransfer, standardizedCount };
}

function handleFileInputChange(event: Event): void {
  if (syntheticEvents.has(event)) {
    return;
  }
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "file") {
    return;
  }
  if (isAlreadyHandledTarget(target) || !target.files?.length) {
    return;
  }

  const files = Array.from(target.files);
  if (!needsAutoResize(files)) {
    return;
  }

  event.stopImmediatePropagation();
  event.stopPropagation();

  void (async () => {
    try {
      const { dataTransfer, standardizedCount } = await standardizeBatch(files);
      target.files = dataTransfer.files;
      if (standardizedCount > 0) {
        toast.success(
          `ปรับขนาดมาตรฐาน 1:1 พื้นหลังขาว (≤ 1 MB) แล้ว ${standardizedCount} รูป`
        );
      }
      const nextEvent = new Event("change", { bubbles: true });
      syntheticEvents.add(nextEvent);
      target.dispatchEvent(nextEvent);
    } catch (error: unknown) {
      target.value = "";
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถปรับขนาดรูปภาพได้"
      );
    }
  })();
}

function handleFileDrop(event: Event): void {
  if (syntheticEvents.has(event) || !(event instanceof DragEvent)) {
    return;
  }
  const target = event.target;
  if (isAlreadyHandledTarget(target) || !event.dataTransfer?.files?.length) {
    return;
  }

  const files = Array.from(event.dataTransfer.files);
  if (!needsAutoResize(files)) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();

  void (async () => {
    try {
      const { dataTransfer, standardizedCount } = await standardizeBatch(files);
      if (standardizedCount > 0) {
        toast.success(
          `ปรับขนาดมาตรฐาน 1:1 พื้นหลังขาว (≤ 1 MB) แล้ว ${standardizedCount} รูป`
        );
      }
      const nextEvent = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      if ((nextEvent.dataTransfer?.files?.length ?? 0) === 0) {
        Object.defineProperty(nextEvent, "dataTransfer", {
          value: dataTransfer,
        });
      }
      syntheticEvents.add(nextEvent);
      target?.dispatchEvent(nextEvent);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถปรับขนาดรูปภาพได้"
      );
    }
  })();
}

/**
 * Installs capture-phase listeners so every image uploader across `@mercurjs/vendor`
 * (built-in Create Product, Product Media Edit, Store Settings) automatically
 * standardizes uploaded images to 1:1 1080x1080 #FFFFFF JPEG <= 1 MB.
 */
export function installGlobalImageAutoResize(): void {
  if (installed || typeof window === "undefined") {
    return;
  }
  installed = true;
  window.addEventListener("change", handleFileInputChange, true);
  window.addEventListener("drop", handleFileDrop, true);
}
