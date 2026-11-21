import { ArrowUturnLeft, Sparkles, Trash } from "@medusajs/icons";
import { Button } from "@medusajs/ui";

interface ImagePreviewGridProps {
  readonly images: string[];
  readonly revertableUrls?: ReadonlySet<string>;
  readonly revertingUrl?: string | null;
  readonly onMakeCover: (index: number) => void;
  readonly onRevertOriginal?: (index: number) => void;
  readonly onRemove: (index: number) => void;
}

export function ImagePreviewGrid({
  images,
  revertableUrls,
  revertingUrl,
  onMakeCover,
  onRevertOriginal,
  onRemove,
}: ImagePreviewGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((url, index) => {
        const canRevert = Boolean(revertableUrls?.has(url) && onRevertOriginal);
        const isReverting = revertingUrl === url;

        return (
          <div
            key={url}
            className="flex flex-col overflow-hidden rounded-xl border border-ui-border-base bg-white"
          >
            <div className="relative aspect-square w-full bg-white">
              <img
                src={url}
                alt={`Product preview ${index + 1}`}
                className="h-full w-full object-contain"
              />
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-ui-bg-base/95 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                  ภาพปก
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onMakeCover(index)}
                  className="absolute left-1.5 top-1.5 rounded bg-ui-bg-base/95 px-1.5 py-0.5 text-[10px] font-medium shadow-sm hover:bg-ui-bg-base"
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
              {canRevert ? (
                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Sparkles className="h-3 w-3" />
                  AI พื้นหลังขาว
                </span>
              ) : null}
            </div>

            {canRevert ? (
              <div className="border-t border-ui-border-base bg-ui-bg-subtle p-1.5">
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  className="w-full text-[11px]"
                  isLoading={isReverting}
                  disabled={Boolean(revertingUrl)}
                  onClick={() => onRevertOriginal?.(index)}
                >
                  <ArrowUturnLeft className="h-3.5 w-3.5" />
                  ใช้ภาพต้นฉบับ
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
