import type {
  TamadeeCategorySeed,
  TamadeeProductSeed,
  TamadeeSellerSeed,
} from "./types";

export const TAMADEE_CATEGORIES: readonly TamadeeCategorySeed[] = [
  { key: "clothing", name: "เสื้อผ้า", handle: "clothing", description: "เสื้อผ้าตัดเย็บประณีต ผ้าธรรมชาติใส่สบาย" },
  { key: "footwear", name: "รองเท้า", handle: "footwear", description: "รองเท้างานฝีมือ ดีไซน์มินิมอล ทนทานทุกก้าว" },
  { key: "bags", name: "กระเป๋า", handle: "bags", description: "กระเป๋าผ้าแคนวาส หนังแท้ และงานสานร่วมสมัย" },
  { key: "jewelry", name: "เครื่องประดับ", handle: "jewelry", description: "เครื่องประดับเงินแท้ ทองเหลือง และหินธรรมชาติ" },
  { key: "crafts", name: "ของใช้/งานคราฟต์", handle: "crafts", description: "เซรามิกปั้นมือ งานไม้ และของแต่งบ้านตั้งใจทำ" },
];

export const TAMADEE_SELLERS: readonly TamadeeSellerSeed[] = [
  {
    key: "lamai",
    name: "ลินินละไม สตูดิโอ",
    email: "lamai@tamadee.online",
    firstName: "ละไม",
    lastName: "ทอดี",
    city: "เมืองเชียงใหม่",
    province: "เชียงใหม่",
    postalCode: "50200",
    address1: "88 ถนนนิมมานเหมินท์ ซอย 9",
    description: "สตูดิโอเสื้อผ้าลินินและกระเป๋าผ้าทอมือจากเชียงใหม่ ใส่ใจทุกรอยตะเข็บ",
    shippingFlatFeeThb: 40,
  },
  {
    key: "kaodee",
    name: "ก้าวดี คราฟต์ชูส์",
    email: "kaodee@tamadee.online",
    firstName: "ก้าว",
    lastName: "ช่างหนัง",
    city: "วัฒนา",
    province: "กรุงเทพมหานคร",
    postalCode: "10110",
    address1: "42 สุขุมวิท 55 แขวงคลองตันเหนือ",
    description: "รองเท้าและเครื่องหนังทำมือ พื้นยางพาราไทยแท้ นุ่มสบายตลอดวัน",
    shippingFlatFeeThb: 50,
  },
  {
    key: "baandin",
    name: "บ้านดิน & ทองเหลือง",
    email: "baandin@tamadee.online",
    firstName: "ดิน",
    lastName: "ปั้นมือ",
    city: "สามพราน",
    province: "นครปฐม",
    postalCode: "73110",
    address1: "19/4 หมู่ 3 ตำบลท่าตลาด",
    description: "เครื่องประดับทองเหลืองดัดมือและเซรามิกเผาไฟสูงสำหรับคนรักบ้าน",
    shippingFlatFeeThb: 45,
  },
];

const SIZES_APPAREL = ["S", "M", "L", "XL"] as const;
const SIZES_SHOES = ["39", "40", "41", "42", "43"] as const;
const ONE_SIZE = ["Free Size"] as const;

export const TAMADEE_PRODUCTS: readonly TamadeeProductSeed[] = [
  // 1. หมวดเสื้อผ้า (6 รายการ)
  { handle: "linen-relaxed-shirt", title: "เสื้อเชิ้ตลินิน", description: "ทรงหลวม ผ้าลินินแท้ 100% ระบายอากาศดีเยี่ยม ใส่ได้ทุกโอกาส", category: "clothing", seller: "lamai", priceThb: 890, sizes: SIZES_APPAREL, color: "ขาวครีม", weightGrams: 280 },
  { handle: "linen-wide-pants", title: "กางเกงลินินขายาวเอวสูง", description: "กางเกงขากระบอกใหญ่ ผ้าลินินผสมฝ้ายทอแน่น มีกระเป๋าข้างลึก", category: "clothing", seller: "lamai", priceThb: 1190, sizes: SIZES_APPAREL, color: "ดำถ่าน", weightGrams: 360 },
  { handle: "indigo-oversize-tee", title: "เสื้อยืดฝ้ายย้อมครามธรรมชาติ", description: "คอตตอนออร์แกนิกทอหนา ย้อมครามสกลนครแท้ สีเฟดสวยตามกาลเวลา", category: "clothing", seller: "lamai", priceThb: 650, sizes: SIZES_APPAREL, color: "ครามเข้ม", weightGrams: 260 },
  { handle: "cotton-muslin-dress", title: "เดรสสั้นผ้ามัสลินทอสองชั้น", description: "เดรสทรงเอสัมผัสนุ่มเบา ไม่บาง ไม่ต้องรีด เหมาะกับวันพักผ่อนริมทะเล", category: "clothing", seller: "lamai", priceThb: 1290, sizes: SIZES_APPAREL, color: "เขียวมะกอก", weightGrams: 320 },
  { handle: "hemp-work-jacket", title: "แจ็กเก็ตผ้ากัญชงทรงเวิร์กแวร์", description: "ตัดเย็บจากผ้าใยกัญชงทอมือ ทนทาน กันแดดและระบายความร้อนได้ดี", category: "clothing", seller: "lamai", priceThb: 1890, sizes: SIZES_APPAREL, color: "น้ำตาลทราย", weightGrams: 520 },
  { handle: "linen-resort-shorts", title: "กางเกงขาสั้นลินินเชือกรูด", description: "กางเกงขาสั้นเอวยางยืดพร้อมเชือกฝ้ายถัก ใส่เดินเล่นสบายคล่องตัว", category: "clothing", seller: "lamai", priceThb: 690, sizes: SIZES_APPAREL, color: "เบจธรรมชาติ", weightGrams: 240 },

  // 2. หมวดรองเท้า (6 รายการ)
  { handle: "white-canvas-sneaker", title: "รองเท้าผ้าใบสีขาว", description: "ผ้าแคนวาสทอหนา 14 ออนซ์ พื้นยางพาราธรรมชาติเย็บมือรอบคู่", category: "footwear", seller: "kaodee", priceThb: 1590, sizes: SIZES_SHOES, color: "ขาวออฟไวท์", weightGrams: 850 },
  { handle: "leather-double-strap-sandal", title: "รองเท้าแตะหนังวัวฟอกฝาดสองสาย", description: "พื้นไม้ก๊อกปั้นรับอุ้งเท้า สายหนังวัวแท้ยิ่งใส่ยิ่งนุ่มเข้าทรงเท้า", category: "footwear", seller: "kaodee", priceThb: 1390, sizes: SIZES_SHOES, color: "น้ำตาลแทน", weightGrams: 680 },
  { handle: "minimal-slipon-black", title: "รองเท้าสลิปออนผ้าแคนวาสดำ", description: "สวมใส่ง่ายไร้เชือก พื้นด้านในบุโฟมยางพาราลดแรงกระแทก", category: "footwear", seller: "kaodee", priceThb: 1450, sizes: SIZES_SHOES, color: "ดำด้าน", weightGrams: 780 },
  { handle: "suede-mule-clog", title: "รองเท้าหัวปิดเปิดส้นหนังกลับ", description: "ทรงคล็อกมินิมอล ใส่ทำงานหรือเที่ยวคาเฟ่ได้ลงตัว", category: "footwear", seller: "kaodee", priceThb: 1790, sizes: SIZES_SHOES, color: "เทาควันบุหรี่", weightGrams: 820 },
  { handle: "rubber-recovery-slide", title: "รองเท้าแตะยางพาราซัพพอร์ตส้น", description: "หล่อขึ้นรูปชิ้นเดียวจากยางพาราไทย นุ่มเด้ง กันลื่นบนพื้นเปียก", category: "footwear", seller: "kaodee", priceThb: 590, sizes: SIZES_SHOES, color: "เขียวมะนาว", weightGrams: 460 },
  { handle: "handstitched-loafer", title: "รองเท้าโลฟเฟอร์หนังแท้เย็บมือ", description: "งานตัดเย็บด้วยมือโดยช่างฝีมือไทย น้ำหนักเบา พับส้นใส่ได้สองแบบ", category: "footwear", seller: "kaodee", priceThb: 2290, sizes: SIZES_SHOES, color: "น้ำตาลเข้ม", weightGrams: 860 },

  // 3. หมวดกระเป๋า (6 รายการ)
  { handle: "heavy-canvas-tote", title: "กระเป๋าโท้ตแคนวาสหนาช่องโน้ตบุ๊ก", description: "จุของได้เยอะ มีช่องบุกันกระแทกสำหรับแล็ปท็อป 14 นิ้ว และช่องขวดน้ำ", category: "bags", seller: "lamai", priceThb: 790, sizes: ONE_SIZE, color: "ขาวครีม", weightGrams: 420 },
  { handle: "woven-reed-market-bag", title: "กระเป๋าสานกระจูดสายหนังแท้", description: "งานสานมือจากกลุ่มแม่บ้านพัทลุง บุผ้าดิบด้านในพร้อมซิปปิดมิดชิด", category: "bags", seller: "lamai", priceThb: 950, sizes: ONE_SIZE, color: "ธรรมชาติ", weightGrams: 480 },
  { handle: "leather-crossbody-mini", title: "กระเป๋าสะพายข้างหนังฟอกฝาดมินิ", description: "ขนาดกะทัดรัดใส่มือถือและกระเป๋าสตางค์ได้ครบ สายปรับความยาวได้", category: "bags", seller: "kaodee", priceThb: 1490, sizes: ONE_SIZE, color: "ดำ", weightGrams: 350 },
  { handle: "nylon-ripstop-sling", title: "กระเป๋าคาดอกผ้าไนลอนกันละอองน้ำ", description: "น้ำหนักเบาเพียง 180 กรัม พับเก็บใส่กระเป๋ากางเกงได้ เหมาะกับสายลุย", category: "bags", seller: "kaodee", priceThb: 690, sizes: ONE_SIZE, color: "เขียวมะกอก", weightGrams: 190 },
  { handle: "quilted-cotton-pouch", title: "กระเป๋าจัดระเบียบบุนวมผ้าฝ้าย", description: "บุใยฝ้ายนุ่มสำหรับใส่เครื่องสำอางหรือสายชาร์จ ซักทำความสะอาดง่าย", category: "bags", seller: "lamai", priceThb: 390, sizes: ONE_SIZE, color: "ฟ้าครามอ่อน", weightGrams: 140 },
  { handle: "waxed-canvas-backpack", title: "เป้แคนวาสเคลือบแว็กซ์กันน้ำ", description: "ดีไซน์โรลท็อปขยายความจุได้ อะไหล่ทองเหลืองแท้ไม่ขึ้นสนิม", category: "bags", seller: "kaodee", priceThb: 2450, sizes: ONE_SIZE, color: "น้ำตาลโอลีฟ", weightGrams: 920 },

  // 4. หมวดเครื่องประดับ (6 รายการ)
  { handle: "hammered-brass-cuff", title: "กำไลทองเหลืองตอกลายคลื่นน้ำ", description: "ทองเหลืองแท้ตอกลายด้วยค้อนทีละชิ้น ปรับขนาดบีบเข้าข้อมือได้", category: "jewelry", seller: "baandin", priceThb: 550, sizes: ONE_SIZE, color: "ทองเหลือง", weightGrams: 80 },
  { handle: "silver925-organic-ring", title: "แหวนเงินแท้ 925 ทรงออร์แกนิก", description: "เงินแท้เปอร์เซ็นต์สูง ปราศจากนิกเกิล ไม่แพ้ ไม่คัน ขัดเงาด้วยมือ", category: "jewelry", seller: "baandin", priceThb: 890, sizes: ["50", "52", "54", "56"], color: "เงิน", weightGrams: 40 },
  { handle: "ceramic-bead-necklace", title: "สร้อยคอลูกปัดเซรามิกเคลือบขี้เถ้า", description: "ลูกปัดปั้นมือร้อยด้วยเชือกเทียนถักทนเหงื่อ เอกลักษณ์ไม่ซ้ำกันในแต่ละเส้น", category: "jewelry", seller: "baandin", priceThb: 620, sizes: ONE_SIZE, color: "เขียวศิลาดล", weightGrams: 95 },
  { handle: "minimal-brass-hoop-earrings", title: "ต่างหูห่วงทองเหลืองก้านเงินแท้", description: "น้ำหนักเบาใส่สบายทั้งวัน ก้านเป็นเงินแท้ 925 สำหรับคนผิวแพ้ง่าย", category: "jewelry", seller: "baandin", priceThb: 450, sizes: ONE_SIZE, color: "ทองเหลือง", weightGrams: 35 },
  { handle: "freshwater-pearl-bracelet", title: "สร้อยข้อมือมุกน้ำจืดทรงบาร็อก", description: "คัดมุกน้ำจืดทรงธรรมชาติคู่กับตะขอเงินแท้ ใส่ง่ายกับเสื้อเชิ้ตลินิน", category: "jewelry", seller: "baandin", priceThb: 990, sizes: ONE_SIZE, color: "ขาวมุก", weightGrams: 55 },
  { handle: "woven-cotton-hat-pin", title: "เข็มกลัดทองเหลืองรูปน้องกล่องพัสดุ", description: "เข็มกลัดติดเสื้อหรือกระเป๋าผ้า งานหล่อทองเหลืองขัดด้านสุดน่ารัก", category: "jewelry", seller: "baandin", priceThb: 290, sizes: ONE_SIZE, color: "ทองเหลือง", weightGrams: 30 },

  // 5. หมวดของใช้/งานคราฟต์ (6 รายการ)
  { handle: "stoneware-drip-mug", title: "แก้วมัคเซรามิกสโตนแวร์เคลือบด้าน", description: "ปั้นแป้นหมุนทีละใบ เข้าไมโครเวฟและเครื่องล้างจานได้ จับถนัดมือ 320 มล.", category: "crafts", seller: "baandin", priceThb: 490, sizes: ONE_SIZE, color: "ขาวจุดดิน", weightGrams: 420 },
  { handle: "teak-coffee-drip-stand", title: "แท่นดริปกาแฟไม้สักเก่าและทองเหลือง", description: "นำไม้สักเก่ามาชุบชีวิตใหม่คู่เสาทองเหลืองปรับระดับความสูงได้", category: "crafts", seller: "baandin", priceThb: 1350, sizes: ONE_SIZE, color: "ไม้สักทอง", weightGrams: 680 },
  { handle: "soy-wax-lemongrass-candle", title: "เทียนหอมไขถั่วเหลืองกลิ่นตะไคร้ใบเตย", description: "ไขถั่วเหลืองธรรมชาติ 100% ไส้ฝ้ายไม่เป็นเขม่าดำในถ้วยเซรามิกนำกลับมาใช้ต่อได้", category: "crafts", seller: "baandin", priceThb: 590, sizes: ONE_SIZE, color: "ขาวนวล", weightGrams: 450 },
  { handle: "handwoven-cotton-table-runner", title: "ผ้าคาดโต๊ะฝ้ายเข็นมือย้อมเปลือกไม้", description: "ทอกี่กระตุกพื้นบ้าน ย้อมสีธรรมชาติจากเปลือกมังคุดและแก่นขนุน", category: "crafts", seller: "lamai", priceThb: 750, sizes: ONE_SIZE, color: "น้ำตาลเปลือกไม้", weightGrams: 310 },
  { handle: "ceramic-incense-holder", title: "ถาดวางกำยานและธูปหอมเซรามิกปั้นมือ", description: "ดีไซน์ก้อนกรวดริมลำธาร รับขี้เถ้าได้สะอาดตา แต่งมุมโต๊ะทำงานให้สงบ", category: "crafts", seller: "baandin", priceThb: 350, sizes: ONE_SIZE, color: "เทาหิน", weightGrams: 260 },
  { handle: "leather-desk-valet-tray", title: "ถาดหนังวางของจุกจิกบนโต๊ะทำงาน", description: "หนังวัวฟอกฝาดติดกระดุมแป๊กทองเหลืองทั้งสี่มุม กางออกพกใส่กระเป๋าเดินทางได้", category: "crafts", seller: "kaodee", priceThb: 520, sizes: ONE_SIZE, color: "น้ำตาลแทน", weightGrams: 180 },
];
