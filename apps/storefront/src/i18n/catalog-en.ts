export interface LocalizedTextEntry {
  readonly title: string;
  readonly description: string;
}

export const CATEGORY_EN: Readonly<Record<string, LocalizedTextEntry>> = {
  clothing: {
    title: "Clothing",
    description: "Tailored natural-fiber apparel crafted for tropical comfort",
  },
  footwear: {
    title: "Footwear",
    description: "Handcrafted minimalist shoes with natural Thai para-rubber soles",
  },
  bags: {
    title: "Bags",
    description: "Heavyweight canvas, vegetable-tanned leather & woven reed bags",
  },
  jewelry: {
    title: "Jewelry",
    description: "925 sterling silver, hand-hammered brass & natural stone pieces",
  },
  crafts: {
    title: "Home & Crafts",
    description: "Wheel-thrown ceramics, reclaimed teakwood & mindful homeware",
  },
};

export const CATEGORY_NAME_TO_EN: Readonly<Record<string, string>> = {
  "เสื้อผ้า": "Clothing",
  "รองเท้า": "Footwear",
  "กระเป๋า": "Bags",
  "เครื่องประดับ": "Jewelry",
  "ของใช้/งานคราฟต์": "Home & Crafts",
};

export const SELLER_EN: Readonly<Record<string, LocalizedTextEntry>> = {
  "ลินินละไม สตูดิโอ": {
    title: "Lamai Linen Studio",
    description: "Chiang Mai handwoven linen apparel & canvas bags stitched with care",
  },
  "ก้าวดี คราฟต์ชูส์": {
    title: "Kaodee Craft Shoes",
    description: "Bangkok artisan leather footwear cushioned with 100% Thai para-rubber",
  },
  "บ้านดิน & ทองเหลือง": {
    title: "Baandin & Brass Studio",
    description: "Hand-forged brass jewelry & high-fired stoneware ceramics for soulful homes",
  },
};

export const PRODUCT_EN: Readonly<Record<string, LocalizedTextEntry>> = {
  "linen-relaxed-shirt": { title: "Relaxed Pure Linen Shirt", description: "100% breathable pure linen shirt with a relaxed silhouette for any occasion." },
  "linen-wide-pants": { title: "High-Waist Wide Linen Pants", description: "Structured linen-cotton wide-leg trousers with deep side pockets." },
  "indigo-oversize-tee": { title: "Natural Indigo Oversized Tee", description: "Heavyweight organic cotton hand-dyed with authentic Sakon Nakhon indigo." },
  "cotton-muslin-dress": { title: "Double-Gauze Muslin Mini Dress", description: "Airy non-sheer A-line cotton muslin dress—no ironing needed, ideal for beach days." },
  "hemp-work-jacket": { title: "Handwoven Hemp Workwear Jacket", description: "Durable handloomed Thai hemp chore jacket offering sun protection and airflow." },
  "linen-resort-shorts": { title: "Drawstring Linen Resort Shorts", description: "Easy elastic-waist linen shorts with braided cotton drawstring." },
  "white-canvas-sneaker": { title: "Hand-Stitched White Canvas Sneaker", description: "14oz heavy canvas upper hand-sewn onto natural Thai para-rubber soles." },
  "leather-double-strap-sandal": { title: "Veg-Tan Double-Strap Leather Sandal", description: "Contoured cork footbed with vegetable-tanned cowhide straps that mold to your feet." },
  "minimal-slipon-black": { title: "Minimalist Matte Black Slip-On", description: "Laceless heavy canvas slip-on with shock-absorbing latex foam insole." },
  "suede-mule-clog": { title: "Minimalist Smoke Suede Mule Clog", description: "Effortless closed-toe suede mule crafted for studio work or cafe days." },
  "rubber-recovery-slide": { title: "Thai Para-Rubber Recovery Slide", description: "One-piece molded Thai natural rubber slide with arch support and wet-grip tread." },
  "handstitched-loafer": { title: "Convertible Hand-Stitched Leather Loafer", description: "Featherlight artisan leather loafer with collapsible heel for 2-way wear." },
  "heavy-canvas-tote": { title: "Padded Laptop Heavy Canvas Tote", description: "Spacious everyday tote featuring a 14-inch padded laptop sleeve and bottle holder." },
  "woven-reed-market-bag": { title: "Phatthalung Woven Sedge & Leather Bag", description: "Handwoven Krajood reed bag by southern Thai artisans with cotton lining and top zip." },
  "leather-crossbody-mini": { title: "Veg-Tan Mini Leather Crossbody", description: "Compact full-grain leather crossbody fitting phone and wallet with adjustable strap." },
  "nylon-ripstop-sling": { title: "Water-Repellent Ripstop Sling Bag", description: "Ultralight 180g packable crossbody sling built for travel and everyday carry." },
  "quilted-cotton-pouch": { title: "Indigo Quilted Cotton Organizer Pouch", description: "Softly padded washable cotton pouch for cosmetics, cables, or travel essentials." },
  "waxed-canvas-backpack": { title: "Waterproof Waxed Canvas Rolltop Backpack", description: "Expandable rolltop rucksack finished with rust-proof solid brass hardware." },
  "hammered-brass-cuff": { title: "Hand-Hammered Wave Brass Cuff", description: "Individually hammer-textured solid brass cuff bracelet with adjustable fit." },
  "silver925-organic-ring": { title: "Organic 925 Sterling Silver Ring", description: "Nickel-free hypoallergenic solid 925 silver ring hand-polished to a warm sheen." },
  "ceramic-bead-necklace": { title: "Celadon Ash-Glaze Ceramic Bead Necklace", description: "Hand-rolled ceramic beads strung on sweat-resistant braided waxed cord." },
  "minimal-brass-hoop-earrings": { title: "Minimal Brass Hoops with 925 Silver Posts", description: "Featherlight everyday brass hoop earrings with sterling silver posts for sensitive ears." },
  "freshwater-pearl-bracelet": { title: "Baroque Freshwater Pearl Bracelet", description: "Natural baroque freshwater pearls paired with a solid sterling silver clasp." },
  "woven-cotton-hat-pin": { title: "Brushed Brass Parcel Mascot Pin", description: "Charming matte-cast solid brass Tamadee parcel lapel & tote pin." },
  "stoneware-drip-mug": { title: "Matte Speckled Stoneware Mug (320ml)", description: "Wheel-thrown stoneware mug—microwave and dishwasher safe with ergonomic handle." },
  "teak-coffee-drip-stand": { title: "Reclaimed Teak & Brass Pour-Over Stand", description: "Upcycled golden Thai teak base with height-adjustable solid brass dripper rod." },
  "soy-wax-lemongrass-candle": { title: "Lemongrass & Pandan Soy Wax Candle", description: "100% natural soy candle with cotton wick in a reusable handmade ceramic vessel." },
  "handwoven-cotton-table-runner": { title: "Bark-Dyed Handspun Cotton Table Runner", description: "Loom-woven cotton runner naturally dyed with mangosteen rind and jackfruit heartwood." },
  "ceramic-incense-holder": { title: "River Pebble Ceramic Incense Holder", description: "Zen pebble-inspired stoneware ash catcher to calm your workspace." },
  "leather-desk-valet-tray": { title: "Snap-Corner Leather Desk Valet Tray", description: "Vegetable-tanned leather catchall tray with brass snaps that unsnap flat for travel." },
};
