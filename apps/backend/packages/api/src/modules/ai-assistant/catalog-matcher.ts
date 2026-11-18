import type { AiCatalogItem, SupportedLocale } from "./types";

const MULTILINGUAL_SYNONYMS: readonly (readonly [
  readonly string[],
  readonly string[],
])[] = [
  [
    ["ทะเล", "beach", "resort", "summer", "海边", "沙滩", "度假"],
    ["ทะเล", "ลินิน", "ขาสั้น", "มัสลิน", "สาน", "linen", "shorts"],
  ],
  [
    ["ลินิน", "เสื้อ", "linen", "shirt", "clothing", "dress", "亚麻", "衬衫", "衣服", "连衣裙"],
    ["ลินิน", "เชิ้ต", "เสื้อผ้า", "เดรส", "shirt", "linen"],
  ],
  [
    ["ของขวัญ", "เซรามิก", "แก้ว", "gift", "ceramic", "mug", "craft", "candle", "礼物", "陶瓷", "杯", "手作", "香薰"],
    ["ของขวัญ", "เซรามิก", "คราฟต์", "แก้ว", "เทียน", "ทองเหลือง", "mug", "ceramic"],
  ],
  [
    ["รองเท้า", "เดิน", "shoe", "sneaker", "sandal", "leather", "loafer", "鞋", "凉鞋", "皮鞋"],
    ["รองเท้า", "ผ้าใบ", "แตะ", "หนัง", "โลฟเฟอร์", "sandal", "sneaker"],
  ],
  [
    ["กระเป๋า", "คาเฟ่", "bag", "tote", "backpack", "pouch", "cafe", "包", "帆布包", "背包"],
    ["กระเป๋า", "แคนวาส", "สาน", "เป้", "สะพาย", "tote", "bag"],
  ],
  [
    ["เครื่องประดับ", "แหวน", "สร้อย", "jewelry", "ring", "necklace", "brass", "silver", "首饰", "戒指", "项链", "黄铜", "纯银"],
    ["เครื่องประดับ", "ทองเหลือง", "เงิน", "แหวน", "สร้อย", "ต่างหู", "กำไล"],
  ],
];

export function detectPromptLocale(text: string): SupportedLocale {
  if (/[\u4e00-\u9fff]/.test(text)) {
    return "zh";
  }
  if (/[\u0e00-\u0e7f]/.test(text)) {
    return "th";
  }
  return /[a-zA-Z]/.test(text) ? "en" : "th";
}

export function extractBudgetThb(query: string): number | null {
  const normalized = query.replace(/,/g, "");
  const patterns = [
    /(?:งบ|ไม่เกิน|ต่ำกว่า|น้อยกว่า|ไม่แพงกว่า|ในงบ|ราคาไม่เกิน|ราวๆ|under|below|max|budget|within|预算|不超过|低于)\s*(?:thb|฿)?\s*(\d{2,6})/i,
    /(\d{2,6})\s*(?:บาท|thb|baht|泰铢|以内)/i,
    /฿\s*(\d{2,6})/,
  ];

  for (const regex of patterns) {
    const match = normalized.match(regex);
    if (match?.[1]) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value >= 50) {
        return value;
      }
    }
  }
  return null;
}

function extractKeywords(query: string): string[] {
  const lower = query.toLowerCase();
  const cleaned = lower
    .replace(/[0-9,฿.!?"'()]/g, " ")
    .replace(
      /(หา|อยากได้|ช่วย|แนะนำ|ให้หน่อย|หน่อย|ครับ|ค่ะ|งบไม่เกิน|ไม่เกิน|ต่ำกว่า|งบ|บาท|under|below|budget|thb|for|find|looking)/g,
      " "
    );

  const expanded = new Set<string>(
    cleaned
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
  );

  for (const [triggers, related] of MULTILINGUAL_SYNONYMS) {
    if (triggers.some((tr) => lower.includes(tr))) {
      for (const word of related) {
        expanded.add(word);
      }
    }
  }
  return Array.from(expanded);
}

export function matchCatalogProducts(
  query: string,
  catalog: readonly AiCatalogItem[],
  limit = 4
): readonly AiCatalogItem[] {
  const budget = extractBudgetThb(query);
  const keywords = extractKeywords(query);
  const affordable =
    budget !== null
      ? catalog.filter((item) => item.priceAmount <= budget)
      : [...catalog];
  const pool = affordable.length > 0 ? affordable : [...catalog];

  const scored = pool.map((item) => {
    const haystack = [
      item.title,
      item.description ?? "",
      item.categoryNames.join(" "),
      item.sellerName,
      item.handle.replace(/-/g, " "),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const kw of keywords) {
      if (item.title.toLowerCase().includes(kw)) score += 5;
      else if (haystack.includes(kw)) score += 2;
    }
    if (budget !== null && item.priceAmount <= budget) score += 1;
    return { item, score };
  });

  scored.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.item.priceAmount - b.item.priceAmount
  );

  const chosen: AiCatalogItem[] = [];
  let sum = 0;
  const wantsSet = /ชุด|เซ็ต|outfit|set|套装/.test(query.toLowerCase());

  for (const entry of scored) {
    if (chosen.length >= limit) break;
    if (wantsSet && budget !== null && chosen.length >= 1 && sum + entry.item.priceAmount > budget) {
      continue;
    }
    chosen.push(entry.item);
    sum += entry.item.priceAmount;
  }

  return chosen.length > 0 ? chosen : scored.slice(0, limit).map((s) => s.item);
}

export function groundProductIds(
  candidateIds: readonly string[],
  catalog: readonly AiCatalogItem[],
  budgetThb: number | null
): readonly AiCatalogItem[] {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const grounded: AiCatalogItem[] = [];
  for (const rawId of candidateIds) {
    const id = rawId.trim();
    if (seen.has(id)) continue;
    const real = byId.get(id);
    if (!real || (budgetThb !== null && real.priceAmount > budgetThb)) continue;
    seen.add(id);
    grounded.push(real);
  }
  return grounded;
}

export function buildFallbackReply(
  query: string,
  products: readonly AiCatalogItem[],
  budgetThb: number | null,
  locale: SupportedLocale = "th"
): string {
  if (products.length === 0) {
    if (locale === "en") return "No matching handcrafted Thai items found yet. Try adjusting your keywords or budget!";
    if (locale === "zh") return "暂未找到符合条件的泰国手作好物，请尝试调整关键词或预算！";
    return "ตอนนี้ยังไม่พบสินค้าที่ตรงเงื่อนไข ลองปรับคำค้นหาหรือขยายงบประมาณดูครับ!";
  }
  const sum = products.reduce((acc, p) => acc + p.priceAmount, 0);
  const names = products.slice(0, 3).map((p) => `${p.title} (฿${p.priceAmount.toLocaleString("en-US")})`).join(", ");

  if (locale === "en") {
    return budgetThb !== null
      ? `Nong Tammadi picked ${products.length} authentic Thai studio items within your ฿${budgetThb.toLocaleString("en-US")} THB budget: ${names} (Total ฿${sum.toLocaleString("en-US")} THB, 7% VAT included). Tap Add to Cart below!`
      : `Nong Tammadi curated ${products.length} Thai creator pieces matching "${query}": ${names} (prices in THB incl. 7% VAT).`;
  }
  if (locale === "zh") {
    return budgetThb !== null
      ? `小Tamadee为您精选了 ${products.length} 件符合 ฿${budgetThb.toLocaleString("en-US")} 泰铢预算的泰国设计师好物：${names}（合计 ฿${sum.toLocaleString("en-US")} 含7%增值税），可直接点击下方加入购物车！`
      : `小Tamadee为您挑选了 ${products.length} 件与“${query}”相符的泰国匠心手作：${names}（价格均含7%增值税）。`;
  }
  return budgetThb !== null
    ? `น้องทำมะดิคัดของจริงจากร้านไทยที่อยู่ในงบไม่เกิน ฿${budgetThb.toLocaleString("en-US")} มาให้ ${products.length} ชิ้น ได้แก่ ${names} (รวม ฿${sum.toLocaleString("en-US")} ราคารวม VAT 7% แล้ว) กดใส่ตะกร้าจากการ์ดด้านล่างได้เลยครับ!`
    : `น้องทำมะดิคัดชิ้นงานที่เข้ากับ "${query}" จากผู้สร้างสรรค์ไทยมาให้ ${products.length} รายการ ได้แก่ ${names} กดเลือกชมหรือใส่ตะกร้าได้ทันทีครับ!`;
}

export const buildFallbackThaiReply = buildFallbackReply;
