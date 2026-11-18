import assert from "node:assert/strict";
import {
  formatPriceByLocale,
  getUiDictionary,
  parseAppLocale,
} from "../src/i18n";
import {
  localizeCategory,
  localizeProductSummary,
  localizeSeller,
} from "../src/i18n/localize-catalog";

export function runI18nTests(): void {
  assert.equal(parseAppLocale("th"), "th");
  assert.equal(parseAppLocale("en"), "en");
  assert.equal(parseAppLocale("zh"), "zh");
  assert.equal(parseAppLocale("zh-CN"), "zh");
  assert.equal(parseAppLocale("invalid"), "th");

  assert.equal(formatPriceByLocale(890, "th"), "฿890");
  assert.equal(formatPriceByLocale(890, "en"), "฿890 (~$26)");
  assert.equal(formatPriceByLocale(890, "zh"), "฿890 (~¥185)");

  const enDict = getUiDictionary("en");
  const zhDict = getUiDictionary("zh");
  assert.equal(enDict.nav.cart, "Cart");
  assert.equal(zhDict.nav.cart, "购物车");

  const cat = localizeCategory(
    { id: "c1", name: "เสื้อผ้า", handle: "clothing", rank: 0 },
    "zh"
  );
  assert.equal(cat.name, "服饰");

  const prod = localizeProductSummary(
    {
      id: "p1",
      title: "เสื้อเชิ้ตลินิน",
      handle: "linen-relaxed-shirt",
      priceAmount: 890,
      categoryIds: ["c1"],
      categoryNames: ["เสื้อผ้า"],
    },
    "en"
  );
  assert.equal(prod.title, "Relaxed Pure Linen Shirt");
  assert.equal(prod.categoryNames[0], "Clothing");

  const seller = localizeSeller(
    { id: "s1", name: "ลินินละไม สตูดิโอ", handle: "lamai" },
    "zh"
  );
  assert.ok(seller.name.includes("亚麻"));
}
