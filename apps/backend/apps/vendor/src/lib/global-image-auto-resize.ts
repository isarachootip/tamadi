import { toast } from "@medusajs/ui";
import {
  resizeImageFileToLimit,
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

export function needsAutoResize(
  files: readonly File[],
  targetBytes: number = TARGET_IMAGE_BYTES
): boolean {
  return files.some((file) => isResizableImage(file) && file.size > targetBytes);
}

async function resizeBatch(
  files: readonly File[]
): Promise<{ readonly dataTransfer: DataTransfer; readonly resizedCount: number }> {
  const dataTransfer = new DataTransfer();
  let resizedCount = 0;

  for (const file of files) {
    if (isResizableImage(file) && file.size > TARGET_IMAGE_BYTES) {
      const result = await resizeImageFileToLimit(file, TARGET_IMAGE_BYTES);
      dataTransfer.items.add(result.file);
      if (result.wasResized) {
        resizedCount += 1;
      }
    } else {
      dataTransfer.items.add(file);
    }
  }

  return { dataTransfer, resizedCount };
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
      const { dataTransfer, resizedCount } = await resizeBatch(files);
      target.files = dataTransfer.files;
      if (resizedCount > 0) {
        toast.success(
          `ย่อขนาดรูปภาพอัตโนมัติไม่เกิน 1 MB แล้ว ${resizedCount} รูป`
        );
      }
      const nextEvent = new Event("change", { bubbles: true });
      syntheticEvents.add(nextEvent);
      target.dispatchEvent(nextEvent);
    } catch (error: unknown) {
      target.value = "";
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถย่อขนาดรูปภาพได้"
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
      const { dataTransfer, resizedCount } = await resizeBatch(files);
      if (resizedCount > 0) {
        toast.success(
          `ย่อขนาดรูปภาพอัตโนมัติไม่เกิน 1 MB แล้ว ${resizedCount} รูป`
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
        error instanceof Error ? error.message : "ไม่สามารถย่อขนาดรูปภาพได้"
      );
    }
  })();
}

/**
 * Installs capture-phase listeners so every image uploader across `@mercurjs/vendor`
 * (including built-in Create Product, Product Media Edit, and Store Settings)
 * automatically resizes images > 1 MB before MercurJS's 2 MB validation runs.
 */
export function installGlobalImageAutoResize(): void {
  if (installed || typeof window === "undefined") {
    return;
  }
  installed = true;
  window.addEventListener("change", handleFileInputChange, true);
  window.addEventListener("drop", handleFileDrop, true);
}
