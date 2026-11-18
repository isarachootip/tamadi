import type { LocalizedTextEntry } from "./catalog-en";

export const CATEGORY_ZH: Readonly<Record<string, LocalizedTextEntry>> = {
  clothing: {
    title: "服饰",
    description: "剪裁考究的天然透气面料，适合热带与度假穿搭",
  },
  footwear: {
    title: "鞋履",
    description: "极简匠人手作鞋履，搭配泰国天然乳胶耐磨鞋底",
  },
  bags: {
    title: "包袋",
    description: "重磅帆布、植鞣真皮与泰南传统草编包袋",
  },
  jewelry: {
    title: "配饰首饰",
    description: "925纯银、手工锤纹黄铜与天然珍珠原石首饰",
  },
  crafts: {
    title: "家居与手作",
    description: "手工拉坯陶瓷、老柚木器物与疗愈生活香氛",
  },
};

export const CATEGORY_NAME_TO_ZH: Readonly<Record<string, string>> = {
  "เสื้อผ้า": "服饰",
  "รองเท้า": "鞋履",
  "กระเป๋า": "包袋",
  "เครื่องประดับ": "配饰首饰",
  "ของใช้/งานคราฟต์": "家居与手作",
};

export const SELLER_ZH: Readonly<Record<string, LocalizedTextEntry>> = {
  "ลินินละไม สตูดิโอ": {
    title: "清迈微风亚麻工坊 (Lamai Linen)",
    description: "来自清迈宁曼路的手织亚麻服饰与手作布包独立工坊",
  },
  "ก้าวดี คราฟต์ชูส์": {
    title: "曼谷好步手作鞋坊 (Kaodee Shoes)",
    description: "手工缝制真皮鞋履，采用100%泰国天然橡胶软底，全天舒适",
  },
  "บ้านดิน & ทองเหลือง": {
    title: "大地与黄铜器物室 (Baandin Studio)",
    description: "手工锻打黄铜首饰与高温柴烧质感生活陶瓷工坊",
  },
};

export const PRODUCT_ZH: Readonly<Record<string, LocalizedTextEntry>> = {
  "linen-relaxed-shirt": { title: "宽松纯亚麻衬衫", description: "100%纯天然亚麻织造，透气清爽，海边度假与日常通勤皆宜。" },
  "linen-wide-pants": { title: "高腰阔腿亚麻长裤", description: "垂坠感棉麻混纺阔腿裤，修饰腿型并配有加深侧袋。" },
  "indigo-oversize-tee": { title: "天然蓝染重磅宽松T恤", description: "有机厚实纯棉，采用泰国色军府传统植物蓝染，越穿越有韵味。" },
  "cotton-muslin-dress": { title: "双层棉纱免烫短款连衣裙", description: "轻盈不透的A字双层棉纱裙，免熨烫，海岛旅行出片必备。" },
  "hemp-work-jacket": { title: "手织大麻纤维工装夹克", description: "稀有手织天然大麻布缝制，防晒透气、挺括耐穿。" },
  "linen-resort-shorts": { title: "抽绳松紧腰亚麻度假短裤", description: "编织棉绳松紧腰设计，轻便透气，散步逛市集倍感自在。" },
  "white-canvas-sneaker": { title: "手缝天然乳胶底白帆布鞋", description: "14安士重磅帆布鞋面，手工环绕缝合泰国天然橡胶大底。" },
  "leather-double-strap-sandal": { title: "植鞣牛皮双带软木凉鞋", description: "贴合足弓的软木鞋床搭配头层植鞣牛皮，越穿越贴合脚型。" },
  "minimal-slipon-black": { title: "极简哑光黑一脚蹬帆布鞋", description: "免系带便捷穿脱，内置天然乳胶缓震鞋垫，久走不累。" },
  "suede-mule-clog": { title: "烟灰麂皮包头半拖博肯鞋", description: "极简包头露跟设计，轻松驾驭办公与咖啡馆休闲时光。" },
  "rubber-recovery-slide": { title: "泰国天然乳胶厚底舒压拖鞋", description: "一体成型泰国天然橡胶，软弹护足，湿地防滑。" },
  "handstitched-loafer": { title: "手缝两穿软跟真皮乐福鞋", description: "泰国老匠人纯手工缝制，轻盈柔软，后跟可踩下两穿。" },
  "heavy-canvas-tote": { title: "重磅帆布14寸电脑托特包", description: "大容量分区设计，内置14英寸防震电脑隔层与水杯侧袋。" },
  "woven-reed-market-bag": { title: "泰南蒲草编织真皮提手包", description: "博他仑府匠人手工草编，配纯棉内衬与安全拉链封口。" },
  "leather-crossbody-mini": { title: "植鞣真皮迷你斜挎小方包", description: "小巧精致却能轻松收纳手机与短夹，肩带长度自由调节。" },
  "nylon-ripstop-sling": { title: "防泼水超轻抗撕裂胸包", description: "仅重180克可折叠收纳入口袋，户外出行轻装首选。" },
  "quilted-cotton-pouch": { title: "蓝染绗缝纯棉收纳化妆包", description: "柔软夹棉内胆，适合收纳化妆品或充电线，可水洗易打理。" },
  "waxed-canvas-backpack": { title: "防水油蜡帆布卷口双肩包", description: "可扩容卷顶设计，搭配永不生锈的纯黄铜复古五金。" },
  "hammered-brass-cuff": { title: "手工锤纹水波黄铜开口手镯", description: "逐件手工锤打水波纹理，开口微调贴合不同手腕尺寸。" },
  "silver925-organic-ring": { title: "925纯银自然流线肌理戒指", description: "高纯度无镍防过敏925纯银，手工打磨温润光泽。" },
  "ceramic-bead-necklace": { title: "青瓷草木灰釉手作陶珠项链", description: "手工揉制陶珠配防汗编织蜡绳，每一条釉色皆独一无二。" },
  "minimal-brass-hoop-earrings": { title: "极简黄铜圆环耳环（925银针）", description: "轻盈无负担，耳针采用925纯银材质，敏感肌安心佩戴。" },
  "freshwater-pearl-bracelet": { title: "巴洛克天然淡水珍珠手链", description: "甄选自然异形淡水珍珠搭配925纯银搭扣，优雅百搭。" },
  "woven-cotton-hat-pin": { title: "Tamadee 微笑快递盒黄铜胸针", description: "哑光拉丝实心黄铜铸造品牌吉祥物胸针，点缀衣领与帆布包。" },
  "stoneware-drip-mug": { title: "哑光陶土斑点手作马克杯 (320ml)", description: "拉坯手作高温炻器，可进微波炉与洗碗机，握感温润舒适。" },
  "teak-coffee-drip-stand": { title: "百年老柚木配黄铜手冲咖啡架", description: "回收泰国黄金老柚木底座搭配可调节高度的纯黄铜支架。" },
  "soy-wax-lemongrass-candle": { title: "柠檬草斑兰叶天然大豆蜡香薰", description: "100%天然大豆蜡配无烟棉芯，燃尽后手作陶杯可循环使用。" },
  "handwoven-cotton-table-runner": { title: "山竹壳植物染手纺棉桌旗", description: "传统木织机手工织造，采用山竹果壳与菠萝蜜木天然染色。" },
  "ceramic-incense-holder": { title: "溪流鹅卵石手作陶瓷线香座", description: "禅意鹅卵石造型稳妥承接香灰，为书桌添一份宁静。" },
  "leather-desk-valet-tray": { title: "植鞣牛皮黄铜按扣桌面收纳盘", description: "四角纯铜按扣设计，解开即可平铺放入行李箱随身携带。" },
};
