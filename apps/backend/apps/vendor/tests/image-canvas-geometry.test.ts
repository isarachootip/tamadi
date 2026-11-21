import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_STUDIO_PADDING_RATIO,
  computeContainPlacement,
  STANDARD_BG_HEX,
  STANDARD_CANVAS_SIZE,
} from "../src/lib/image-canvas-geometry.ts";

describe("Vendor Product Image Canvas Geometry (1:1 #FFFFFF Contain)", () => {
  it("exports standard 1080x1080 pure white canvas constants", () => {
    assert.equal(STANDARD_CANVAS_SIZE, 1080);
    assert.equal(STANDARD_BG_HEX, "#FFFFFF");
    assert.equal(AI_STUDIO_PADDING_RATIO, 0.06);
  });

  it("fills a 1:1 square image edge-to-edge with zero padding", () => {
    assert.deepEqual(computeContainPlacement(2000, 2000, 1080, 0), {
      x: 0,
      y: 0,
      drawWidth: 1080,
      drawHeight: 1080,
    });
  });

  it("centers a landscape 16:9 image inside 1080x1080 without cropping", () => {
    const rect = computeContainPlacement(1600, 900, 1080, 0);
    assert.equal(rect.drawWidth, 1080);
    assert.equal(rect.drawHeight, 608);
    assert.equal(rect.x, 0);
    assert.equal(rect.y, 236);
    assert.ok(rect.x + rect.drawWidth <= 1080);
    assert.ok(rect.y + rect.drawHeight <= 1080);
  });

  it("centers a portrait 9:16 image inside 1080x1080 without cropping", () => {
    const rect = computeContainPlacement(900, 1600, 1080, 0);
    assert.equal(rect.drawHeight, 1080);
    assert.equal(rect.drawWidth, 608);
    assert.equal(rect.y, 0);
    assert.equal(rect.x, 236);
  });

  it("applies 6% studio breathing margin around AI cutouts on all sides", () => {
    const rect = computeContainPlacement(1000, 1000, 1080, AI_STUDIO_PADDING_RATIO);
    const expectedInner = Math.round(1080 * (1 - 2 * AI_STUDIO_PADDING_RATIO));
    assert.equal(rect.drawWidth, expectedInner);
    assert.equal(rect.drawHeight, expectedInner);
    assert.equal(rect.x, Math.round((1080 - expectedInner) / 2));
    assert.equal(rect.y, Math.round((1080 - expectedInner) / 2));
  });

  it("handles invalid/zero dimensions safely without NaN", () => {
    const rect = computeContainPlacement(0, -10, 1080, 0);
    assert.ok(Number.isFinite(rect.x));
    assert.ok(Number.isFinite(rect.y));
    assert.ok(rect.drawWidth > 0);
    assert.ok(rect.drawHeight > 0);
  });
});
