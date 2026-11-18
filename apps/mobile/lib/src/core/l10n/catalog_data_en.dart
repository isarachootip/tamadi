class CatalogTextPair {
  const CatalogTextPair(this.title, this.description);

  final String title;
  final String description;
}

const Map<String, CatalogTextPair> categoryEnByHandle = <String, CatalogTextPair>{
  'clothing': CatalogTextPair('Clothing', 'Tailored natural-fiber apparel for tropical comfort'),
  'apparel': CatalogTextPair('Clothing', 'Tailored natural-fiber apparel for tropical comfort'),
  'footwear': CatalogTextPair('Footwear', 'Handcrafted minimalist shoes with Thai para-rubber soles'),
  'bags': CatalogTextPair('Bags', 'Heavyweight canvas, veg-tanned leather & woven reed bags'),
  'jewelry': CatalogTextPair('Jewelry', '925 sterling silver, hammered brass & natural stone pieces'),
  'crafts': CatalogTextPair('Home & Crafts', 'Wheel-thrown ceramics, teakwood & mindful homeware'),
};

const Map<String, String> categoryNameEnMap = <String, String>{
  'เสื้อผ้า': 'Clothing',
  'รองเท้า': 'Footwear',
  'กระเป๋า': 'Bags',
  'เครื่องประดับ': 'Jewelry',
  'ของใช้/งานคราฟต์': 'Home & Crafts',
};

const Map<String, CatalogTextPair> sellerEnByName = <String, CatalogTextPair>{
  'ลินินละไม สตูดิโอ': CatalogTextPair('Lamai Linen Studio', 'Chiang Mai handwoven linen apparel & canvas bags'),
  'ละไม สตูดิโอ': CatalogTextPair('Lamai Linen Studio', 'Natural handwoven linen apparel'),
  'ก้าวดี คราฟต์ชูส์': CatalogTextPair('Kaodee Craft Shoes', 'Bangkok artisan leather footwear with para-rubber soles'),
  'บ้านดิน & ทองเหลือง': CatalogTextPair('Baandin & Brass Studio', 'Hand-forged brass jewelry & stoneware ceramics'),
  'บ้านดิน คราฟต์': CatalogTextPair('Baandin Craft Studio', 'Handcrafted ceramics & canvas bags'),
};

const Map<String, CatalogTextPair> productEnByHandle = <String, CatalogTextPair>{
  'linen-relaxed-shirt': CatalogTextPair('Relaxed Pure Linen Shirt', '100% breathable pure linen shirt for any occasion.'),
  'linen-wide-pants': CatalogTextPair('High-Waist Wide Linen Pants', 'Structured linen-cotton wide-leg trousers with deep pockets.'),
  'indigo-oversize-tee': CatalogTextPair('Natural Indigo Oversized Tee', 'Organic cotton hand-dyed with Sakon Nakhon indigo.'),
  'cotton-muslin-dress': CatalogTextPair('Double-Gauze Muslin Mini Dress', 'Airy non-sheer cotton muslin dress—no ironing needed.'),
  'hemp-work-jacket': CatalogTextPair('Handwoven Hemp Workwear Jacket', 'Durable handloomed Thai hemp chore jacket.'),
  'linen-resort-shorts': CatalogTextPair('Drawstring Linen Resort Shorts', 'Easy elastic-waist linen shorts with cotton drawstring.'),
  'white-canvas-sneaker': CatalogTextPair('Hand-Stitched White Canvas Sneaker', '14oz canvas hand-sewn onto Thai para-rubber soles.'),
  'leather-double-strap-sandal': CatalogTextPair('Veg-Tan Double-Strap Leather Sandal', 'Contoured cork footbed with vegetable-tanned cowhide.'),
  'minimal-slipon-black': CatalogTextPair('Minimalist Matte Black Slip-On', 'Laceless heavy canvas slip-on with latex foam insole.'),
  'suede-mule-clog': CatalogTextPair('Minimalist Smoke Suede Mule Clog', 'Effortless closed-toe suede mule for studio or cafe days.'),
  'rubber-recovery-slide': CatalogTextPair('Thai Para-Rubber Recovery Slide', 'One-piece molded Thai natural rubber slide with arch support.'),
  'handstitched-loafer': CatalogTextPair('Convertible Hand-Stitched Leather Loafer', 'Artisan leather loafer with collapsible 2-way heel.'),
  'heavy-canvas-tote': CatalogTextPair('Padded Laptop Heavy Canvas Tote', 'Spacious everyday tote with 14-inch padded laptop sleeve.'),
  'canvas-tote-bag': CatalogTextPair('Heavyweight Canvas Tote Bag', 'Roomy everyday canvas tote bag.'),
  'woven-reed-market-bag': CatalogTextPair('Phatthalung Woven Sedge & Leather Bag', 'Handwoven Krajood reed bag with cotton lining and zip.'),
  'leather-crossbody-mini': CatalogTextPair('Veg-Tan Mini Leather Crossbody', 'Compact full-grain leather crossbody with adjustable strap.'),
  'nylon-ripstop-sling': CatalogTextPair('Water-Repellent Ripstop Sling Bag', 'Ultralight 180g packable crossbody sling.'),
  'quilted-cotton-pouch': CatalogTextPair('Indigo Quilted Cotton Organizer Pouch', 'Softly padded washable cotton pouch for essentials.'),
  'waxed-canvas-backpack': CatalogTextPair('Waterproof Waxed Canvas Rolltop Backpack', 'Expandable rolltop rucksack with solid brass hardware.'),
  'hammered-brass-cuff': CatalogTextPair('Hand-Hammered Wave Brass Cuff', 'Hammer-textured solid brass cuff bracelet.'),
  'silver925-organic-ring': CatalogTextPair('Organic 925 Sterling Silver Ring', 'Nickel-free solid 925 silver ring hand-polished to a sheen.'),
  'ceramic-bead-necklace': CatalogTextPair('Celadon Ash-Glaze Ceramic Bead Necklace', 'Hand-rolled ceramic beads on braided waxed cord.'),
  'minimal-brass-hoop-earrings': CatalogTextPair('Minimal Brass Hoops (925 Silver Posts)', 'Featherlight brass hoops with 925 silver posts.'),
  'freshwater-pearl-bracelet': CatalogTextPair('Baroque Freshwater Pearl Bracelet', 'Natural baroque freshwater pearls with 925 silver clasp.'),
  'woven-cotton-hat-pin': CatalogTextPair('Brushed Brass Parcel Mascot Pin', 'Matte-cast solid brass Tamadee parcel lapel & tote pin.'),
  'stoneware-drip-mug': CatalogTextPair('Matte Speckled Stoneware Mug (320ml)', 'Wheel-thrown stoneware mug—microwave & dishwasher safe.'),
  'teak-coffee-drip-stand': CatalogTextPair('Reclaimed Teak & Brass Pour-Over Stand', 'Golden Thai teak base with adjustable solid brass rod.'),
  'soy-wax-lemongrass-candle': CatalogTextPair('Lemongrass & Pandan Soy Wax Candle', '100% natural soy candle in a handmade ceramic vessel.'),
  'handwoven-cotton-table-runner': CatalogTextPair('Bark-Dyed Handspun Cotton Table Runner', 'Loom-woven cotton naturally dyed with mangosteen rind.'),
  'ceramic-incense-holder': CatalogTextPair('River Pebble Ceramic Incense Holder', 'Zen pebble-inspired stoneware ash catcher.'),
  'leather-desk-valet-tray': CatalogTextPair('Snap-Corner Leather Desk Valet Tray', 'Veg-tanned leather tray that unsnaps flat for travel.'),
};
