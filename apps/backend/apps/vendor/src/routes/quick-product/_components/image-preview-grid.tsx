import { Trash } from "@medusajs/icons";
import { Button } from "@medusajs/ui";

interface ImagePreviewGridProps {
  readonly images: string[];
  readonly onMakeCover: (index: number) => void;
  readonly onRemove: (index: number) => void;
}

export function ImagePreviewGrid({
  images,
  onMakeCover,
  onRemove,
}: ImagePreviewGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
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
          {index === 0 ? (
            <span className="absolute left-1.5 top-1.5 rounded bg-ui-bg-base/90 px-1.5 py-0.5 text-[10px] font-medium">
              ภาพปก
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onMakeCover(index)}
              className="absolute left-1.5 top-1.5 rounded bg-ui-bg-base/90 px-1.5 py-0.5 text-[10px] font-medium hover:bg-ui-bg-base"
            >
              ตั้งเป็นภาพปก
            </button>
          )}
          <Button
            type="button"
            size="small"
            variant="danger"
            className="absolute right-1.5 top-1.5 h-6 w-6 p-0"
            onClick={() => onRemove(index)}
            aria-label="ลบรูปภาพ"
          >
            <Trash />
          </Button>
        </div>
      ))}
    </div>
  );
}
