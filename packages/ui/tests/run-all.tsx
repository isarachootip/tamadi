import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BRAND_COLORS,
  BRAND_FONTS,
  BRAND_LAYOUT,
  NongTammadiMascot,
  SEMANTIC_THEME,
  TamadeeAppIcon,
  TamadeeLogo,
} from "../src/index";

const currentDir = dirname(fileURLToPath(import.meta.url));

function runSuite(): void {
  let passed = 0;

  // 1. Brand Color Tokens
  assert.equal(BRAND_COLORS.ink, "#111111");
  assert.equal(BRAND_COLORS.lime, "#C6F432");
  assert.equal(BRAND_COLORS.white, "#FFFFFF");
  assert.equal(BRAND_COLORS.surfaceMuted, "#F1F1EE");
  passed++;

  // 2. Light & Dark Mode Semantic Tokens
  assert.equal(SEMANTIC_THEME.light.background, "#FFFFFF");
  assert.equal(SEMANTIC_THEME.light.accent, "#C6F432");
  assert.equal(SEMANTIC_THEME.dark.background, "#111111");
  assert.equal(SEMANTIC_THEME.dark.accent, "#C6F432");
  passed++;

  // 3. Typography & Ergonomic Touch Target (>= 44px)
  assert.match(BRAND_FONTS.display, /Space Grotesk/);
  assert.match(BRAND_FONTS.sans, /Anuphan/);
  assert.ok(BRAND_LAYOUT.minTouchTargetPx >= 44);
  assert.equal(BRAND_LAYOUT.mobileViewportWidthPx, 390);
  passed++;

  // 4. SVG Components Render Accessible Brand Markup (Light & Dark)
  const logoLightHtml = renderToStaticMarkup(React.createElement(TamadeeLogo, { variant: "light" }));
  assert.match(logoLightHtml, /<svg/);
  assert.match(logoLightHtml, /viewBox="0 0 348 100"/);
  assert.match(logoLightHtml, /#C6F432/);
  assert.doesNotMatch(logoLightHtml, /<rect width="348" height="100"/);

  const logoDarkWithBgHtml = renderToStaticMarkup(
    React.createElement(TamadeeLogo, { variant: "dark", withBackground: true }),
  );
  assert.match(logoDarkWithBgHtml, /<rect width="348" height="100" fill="#111111"/);
  assert.match(logoDarkWithBgHtml, /fill="#FFFFFF">tama<\/text>/);

  const mascotLightHtml = renderToStaticMarkup(
    React.createElement(NongTammadiMascot, { variant: "light", size: 64 }),
  );
  assert.match(mascotLightHtml, /width="64"/);
  assert.match(mascotLightHtml, /น้องทำมะดิ/);

  const mascotDarkHtml = renderToStaticMarkup(
    React.createElement(NongTammadiMascot, { variant: "dark" }),
  );
  assert.match(mascotDarkHtml, /#F4F4F1/);

  const appIconHtml = renderToStaticMarkup(React.createElement(TamadeeAppIcon, { size: 96 }));
  assert.match(appIconHtml, /width="96"/);
  assert.match(appIconHtml, /rx="28"/);
  passed++;

  // 5. Tailwind v4 CSS Theme File & Copied Brand Assets Verification
  const themeCssPath = resolve(currentDir, "../src/theme.css");
  const themeCss = readFileSync(themeCssPath, "utf8");
  assert.match(themeCss, /@theme/);
  assert.match(themeCss, /#C6F432/i);
  assert.match(themeCss, /Space Grotesk/);
  assert.match(themeCss, /Anuphan/);

  const assetSvgPath = resolve(currentDir, "../assets/app-icon.svg");
  const assetSvg = readFileSync(assetSvgPath, "utf8");
  assert.match(assetSvg, /<svg/);
  passed++;

  console.log(`PASS: All ${String(passed)} @tamadee/ui test groups succeeded.`);
}

runSuite();
