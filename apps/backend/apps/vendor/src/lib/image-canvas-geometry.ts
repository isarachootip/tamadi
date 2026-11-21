export const STANDARD_CANVAS_SIZE = 1080;
export const STANDARD_BG_HEX = "#FFFFFF";
export const AI_STUDIO_PADDING_RATIO = 0.06;

export interface ContainPlacement {
  readonly x: number;
  readonly y: number;
  readonly drawWidth: number;
  readonly drawHeight: number;
}

/**
 * Computes centered `contain` placement inside a square canvas (`canvasSize x canvasSize`)
 * with optional studio breathing margin (`paddingRatio` on each side, clamped to [0, 0.35]).
 * Never crops the product image and guards against zero/negative dimensions.
 */
export function computeContainPlacement(
  srcWidth: number,
  srcHeight: number,
  canvasSize: number = STANDARD_CANVAS_SIZE,
  paddingRatio: number = 0
): ContainPlacement {
  const safeCanvas = Math.max(1, Math.round(canvasSize));
  const clampedPadding = Math.min(0.35, Math.max(0, paddingRatio));
  const innerSize = Math.max(1, Math.round(safeCanvas * (1 - 2 * clampedPadding)));

  if (!Number.isFinite(srcWidth) || !Number.isFinite(srcHeight) || srcWidth <= 0 || srcHeight <= 0) {
    const offset = Math.round((safeCanvas - innerSize) / 2);
    return {
      x: offset,
      y: offset,
      drawWidth: innerSize,
      drawHeight: innerSize,
    };
  }

  const scale = Math.min(innerSize / srcWidth, innerSize / srcHeight);
  const drawWidth = Math.max(1, Math.min(innerSize, Math.round(srcWidth * scale)));
  const drawHeight = Math.max(1, Math.min(innerSize, Math.round(srcHeight * scale)));
  const x = Math.round((safeCanvas - drawWidth) / 2);
  const y = Math.round((safeCanvas - drawHeight) / 2);

  return { x, y, drawWidth, drawHeight };
}
