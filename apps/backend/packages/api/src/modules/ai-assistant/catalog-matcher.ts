import type { AiCatalogItem } from "./types";

const THAI_SYNONYM_GROUPS: readonly (readonly [string, readonly string[]])[] = [
  ["ทะเล", ["ทะเล", "ลินิน", "ขาสั้น", "หมวก", "สาน", "ชายหาด", "ร้อน"]],
  ["คาเฟ่", ["คาเฟ่", "ลินิน", "เชิ้ต", "กระเป๋า", "แคนวาส", "มินิมอล"]],
  ["ของขวัญ", ["ของขวัญ", "เซรามิก", "ทองเหลือง", "เทียน", "คราฟต์", "แก้ว", "บ้าน"]],
  ["ทำงาน", ["ทำงาน", "เชิ้ต", "หนัง", "คัทชู", "กระเป๋า", "สุภาพ"]],
  ["เดิน", ["เดิน", "รองเท้า", "ผ้าใบ", "แตะ", "หนัง", "สบาย"]],
  ["เข้ม", ["เข้ม", "ดำ", "กรม", "น้ำตาล", "เขียว"]],
];

export function extractBudgetThb(query: string): number | null {
  const normalized = query.replace(/,/g, "");
  const patterns = [
    /(?:งบ|ไม่เกิน|ต่ำกว่า|น้อยกว่า|ไม่แพงกว่า|ในงบ|ราคาไม่เกิน|ราวๆ)\s*฿?\s*(\d{2,6})/i,
    /฿\s*(\d{2,6})/,
    /(\d{3,6})\s*บาท/,
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
  const cleaned = query
    .toLowerCase()
    .replace(/[0-9,฿.!?"'()]/g, " ")
    .replace(
      /(หา|อยากได้|ช่วย|แนะนำ|ให้หน่อย|หน่อย|ครับ|ค่ะ|งบไม่เกิน|ไม่เกิน|ต่ำกว่า|งบ|บาท|ชุด|ของ|ที่|ใส่|ไป)/g,
      " "
    );

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  const expanded = new Set<string>(tokens);
  const lowerFull = query.toLowerCase();
  for (const [trigger, related] of THAI_SYNONYM_GROUPS) {
    if (lowerFull.includes(trigger)) {
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
      if (item.title.toLowerCase().includes(kw)) {
        score += 5;
      } else if (haystack.includes(kw)) {
        score += 2;
      }
    }
    if (budget !== null && item.priceAmount <= budget) {
      score += 1;
    }
    return { item, score };
  });

  scored.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : a.item.priceAmount - b.item.priceAmount
  );

  const chosen: AiCatalogItem[] = [];
  let runningTotal = 0;
  const wantsSet = query.includes("ชุด") || query.includes("เซ็ต");

  for (const entry of scored) {
    if (chosen.length >= limit) break;
    if (
      wantsSet &&
      budget !== null &&
      chosen.length >= 1 &&
      runningTotal + entry.item.priceAmount > budget
    ) {
      continue;
    }
    chosen.push(entry.item);
    runningTotal += entry.item.priceAmount;
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
    const realItem = byId.get(id);
    if (!realItem) continue;
    if (budgetThb !== null && realItem.priceAmount > budgetThb) continue;
    seen.add(id);
    grounded.push(realItem);
  }
  return grounded;
}

export function buildFallbackThaiReply(
  query: string,
  products: readonly AiCatalogItem[],
  budgetThb: number | null
): string {
  if (products.length === 0) {
    return "ตอนนี้ยังไม่พบสินค้าในแคตตาล็อกที่ตรงกับเงื่อนไขนี้ ลองปรับคำค้นหาหรือขยายงบประมาณอีกนิดได้เลยครับ!";
  }
  const sum = products.reduce((acc, p) => acc + p.priceAmount, 0);
  const names = products
    .slice(0, 3)
    .map((p) => `${p.title} (฿${p.priceAmount.toLocaleString("en-US")})`)
    .join(", ");

  if (budgetThb !== null) {
    return `น้องทำมะดิคัดของจริงจากร้านไทยที่อยู่ในงบไม่เกิน ฿${budgetThb.toLocaleString("en-US")} มาให้ ${products.length} ชิ้น ได้แก่ ${names} (รวม ฿${sum.toLocaleString("en-US")} ราคารวม VAT 7% แล้ว) กดใส่ตะกร้าจากการ์ดด้านล่างได้เลยครับ!`;
  }
  return `น้องทำมะดิคัดชิ้นงานที่เข้ากับ "${query}" จากผู้สร้างสรรค์ไทยมาให้ ${products.length} รายการ ได้แก่ ${names} กดเลือกชมหรือใส่ตะกร้าได้ทันทีครับ!`;
}
