# คู่มือระบบหลังบ้าน Tamadee Marketplace (`apps/backend`)

เอกสารสรุปสถาปัตยกรรม วิธีรัน บัญชีทดสอบ รายการ API สำหรับฝั่งลูกค้า และรายงานขอบเขตฟีเจอร์ของ **Mercur v2.4.1 (บน Medusa v2.22.3)** สำหรับตลาดกลางหลายผู้ขาย **Tamadee (ทำมาดี ทำมาขาย)**

---

## 1. โครงสร้างและโดเมนหลัก

- **โดเมน Production:** `https://bwebtamdi.tamadee.online` (ผ่าน Caddy 2 Reverse Proxy ไปยัง `backend:9000`)
- **Operator Admin Panel (ผู้ดูแลตลาดกลาง):** `/dashboard` (เช่น `http://localhost:9000/dashboard`)
- **Vendor Panel (หลังบ้านผู้ขาย):** `/seller` (เช่น `http://localhost:9000/seller`)
- **โครงสร้างภายใน `apps/backend`:**
  - `packages/api` — เซิร์ฟเวอร์ Medusa v2 + `@mercurjs/core` พร้อมสคริปต์จำลองข้อมูลไทย (`src/scripts/seed/`)
  - `apps/admin` — แอป Vite สำหรับผู้ดูแลระบบ (รวมเข้ากับเซิร์ฟเวอร์ตอน Build อัตโนมัติ)
  - `apps/vendor` — แอป Vite สำหรับร้านค้าผู้ขาย (รวมเข้ากับเซิร์ฟเวอร์ตอน Build อัตโนมัติ)

---

## 2. วิธีรันบนเครื่องพัฒนา (Local Development)

1. **เปิดฐานข้อมูล PostgreSQL 16 (พอร์ต `5433`) และ Redis 7 (พอร์ต `6379`):**
   ```bash
   pnpm infra:dev:up
   ```
2. **คัดลอกไฟล์ตัวแปรสภาพแวดล้อมและติดตั้งแพ็กเกจ:**
   ```bash
   cp apps/backend/packages/api/.env.example apps/backend/packages/api/.env
   pnpm --dir apps/backend install
   ```
3. **รัน Migration และจำลองข้อมูลตลาดกลางภาษาไทย (THB / VAT 7% รวมในราคา / ค่าธรรมเนียม 10%):**
   ```bash
   pnpm backend:migrate
   pnpm backend:seed
   ```
4. **Build หน้าจอ Admin + Vendor และเปิดเซิร์ฟเวอร์:**
   ```bash
   pnpm backend:build
   pnpm --dir apps/backend --filter @acme/api start
   # หรือโหมดพัฒนาแบบ Hot Reload (รัน API พอร์ต 9000, Admin 7000, Vendor 7001):
   pnpm backend:dev
   ```
5. **รันชุดทดสอบ Unit Test และชุดตรวจรับ End-to-End ระยะ 1:**
   ```bash
   pnpm --dir apps/backend --filter @acme/api test:unit
   pnpm --dir apps/backend --filter @acme/api verify:phase1
   ```

> **วิธีรันบน Production VPS (Docker Compose):** ตั้งค่า `infra/.env` จาก `infra/.env.example` แล้วสั่ง `docker compose -f infra/docker-compose.yml up -d --build` คอนเทนเนอร์ `backend` (`MEDUSA_WORKER_MODE=server`) จะรัน `medusa db:migrate` อัตโนมัติก่อนเริ่มให้บริการคู่กับ `worker` (`MEDUSA_WORKER_MODE=worker`)

---

## 3. บัญชีทดสอบเริ่มต้น (เฉพาะเครื่องพัฒนาเท่านั้น)

> **คำเตือนความปลอดภัย:** รหัสผ่านเริ่มต้นกำหนดผ่าน `TAMADEE_SEED_*` ในไฟล์ `.env` บนเครื่องพัฒนาเท่านั้น ห้ามใช้รหัสผ่านเหล่านี้บน Production เด็ดขาด

| บทบาท | อีเมล | หน้าจอเข้าใช้งาน | รายละเอียด |
| --- | --- | --- | --- |
| **Operator Admin** | `admin@tamadee.online` | `/dashboard` | อนุมัติร้านค้า ตั้งค่าคอมมิชชัน 10% ดูแลคำสั่งซื้อรวม |
| **ผู้ขาย 1** | `lamai@tamadee.online` | `/seller` | ลินินละไม สตูดิโอ (เชียงใหม่ • ค่าส่งเหมา ฿40) |
| **ผู้ขาย 2** | `kaodee@tamadee.online` | `/seller` | ก้าวดี คราฟต์ชูส์ (กรุงเทพฯ • ค่าส่งเหมา ฿50) |
| **ผู้ขาย 3** | `baandin@tamadee.online` | `/seller` | บ้านดิน & ทองเหลือง (นครปฐม • ค่าส่งเหมา ฿45) |

- **กฎการสมัครผู้ขายใหม่:** เปิด `seller_registration: true` ผู้ขายที่สมัครเองผ่าน `/seller` หรือ `POST /vendor/sellers` จะได้สถานะ `pending_approval` และยังไม่แสดงบนหน้าร้านจนกว่า Admin จะกดอนุมัติ (`POST /admin/sellers/:id/approve`)

---

## 4. รายการ Store & Auth API สำหรับ Flutter (`apps/mobile`) และ Next.js (`apps/storefront`)

ทุกคำขอไปยัง `/store/*` ต้องแนบ Header `x-publishable-api-key: <PUBLISHABLE_TOKEN>` (ดูค่าได้จากผลลัพธ์ `pnpm backend:seed` หรือหน้า Admin -> API Keys) และรองรับ CORS จาก `m.tamadee.online`, `tamdi.tamadee.online`, และ `webtamdi.tamadee.online` แล้ว

| หมวดงาน | Method & Endpoint | การใช้งานหลักในระยะ 2–3 |
| --- | --- | --- |
| **ภูมิภาค & สกุลเงิน** | `GET /store/regions` | ดึง `region_id` ของประเทศไทย (`currency_code: "thb"`, VAT 7% รวมในราคา) |
| **หมวดหมู่สินค้า** | `GET /store/product-categories` | ดึง 5 หมวดไทย (`เสื้อผ้า`, `รองเท้า`, `กระเป๋า`, `เครื่องประดับ`, `ของใช้/งานคราฟต์`) |
| **คุณสมบัติตัวกรอง** | `GET /store/product-attributes` | ดึงตัวเลือกขนาด (`size`) และสี (`color`) สำหรับกรองสินค้า |
| **ค้นหา & รายการสินค้า** | `GET /store/products` | รองรับ `?q=`, `?category_id=`, `?region_id=`, `&fields=*variants.calculated_price` |
| **รายละเอียดสินค้า** | `GET /store/products/:id` | ดึงข้อมูลสินค้า รูปภาพ ตัวเลือกไซส์/สี และข้อเสนอของผู้ขาย |
| **ข้อเสนอผู้ขาย (Offers)** | `GET /store/offers` | ดึงราคา THB และสต็อกแยกตามผู้ขายของแต่ละ Variant |
| **หน้าร้านผู้ขาย** | `GET /store/sellers` และ `GET /store/sellers/:id` | แสดงรายชื่อและโปรไฟล์ร้านค้าที่ได้รับอนุมัติ (`open`) เท่านั้น |
| **ตะกร้าหลายร้าน** | `POST /store/carts`, `POST /store/carts/:id/line-items` | สร้างตะกร้าและเพิ่มสินค้าจากหลายผู้ขายในตะกร้าเดียว |
| **ค่าส่งแยกตามร้าน** | `GET /store/shipping-options?cart_id=:id`, `POST /store/carts/:id/shipping-methods` | เลือกวิธีจัดส่งเหมาจ่ายของแต่ละร้านค้า |
| **ชำระเงิน & แยกใบสั่งซื้อ** | `POST /store/payment-collections`, `POST /store/carts/:id/complete` | ชำระครั้งเดียวและแตกเป็นใบสั่งซื้อย่อยรายผู้ขายภายใต้ `OrderGroup` |
| **สมาชิก & คำสั่งซื้อลูกค้า** | `POST /auth/customer/emailpass(/register)`, `GET /store/customers/me`, `GET /store/order-groups` | สมัคร/เข้าสู่ระบบลูกค้า (แยกขาดจากบัญชีผู้ขาย `member`) และดูสถานะพัสดุรายร้าน |

> **หมายเหตุสำหรับ Vendor API (`/vendor/*`):** ใช้โทเคนจาก `POST /auth/member/emailpass` คู่กับ Header `x-seller-id: <SELLER_ID>`

---

## 5. รายงานขอบเขต Mercur Open Source (MIT) เทียบกับ Enterprise / ส่วนต่อขยายไทย

จากการตรวจสอบซอร์สโค้ดและเอกสาร `@mercurjs/core@2.4.1` พบว่าฟีเจอร์หลักของตลาดกลางอยู่ใน **Open Source (MIT)** ครบถ้วน:

1. **ที่มีพร้อมใน Open Source ทันที (ไม่ต้องซื้อ Enterprise):**
   - ระบบผู้ขายหลายราย (`Seller`), ทีมงานร้านค้า (`SellerMember`), และการอนุมัติร้านค้า (`pending_approval` -> `open` / `suspended` / `terminated`)
   - แค็ตตาล็อกสินค้ากลาง (`Master Product`), คำขออนุมัติแก้ไขสินค้า (`ProductChange`), และข้อเสนอขายรายร้าน (`Offer`)
   - การรวมตะกร้าหลายร้านและแตกคำสั่งซื้ออัตโนมัติ (`OrderGroup` -> 1 `Order` ต่อผู้ขาย)
   - ระบบคิดค่าคอมมิชชัน (`CommissionRate` แบบ `%` และ `fixed` ตั้งค่า Global 10% และสร้างกฎรายหมวด/รายร้านได้)
   - บัญชีแยกประเภทการโอนเงินผู้ขาย (`Payout` ledger + การหักคืนเมื่อคืนเงิน) และโมดูลรีวิวสินค้า (`Review`)
2. **สิ่งที่อยู่ใน Enterprise หรือจำเป็นต้องพัฒนาเชื่อมต่อเองสำหรับตลาดไทย (ในระยะ 3):**
   - **ตัวเชื่อมต่อ Enterprise ภายนอก:** เช่น Magento 2 / Adobe Commerce Connector และฟีเจอร์ Managed Hosting บน Medusa Cloud (ไม่จำเป็นต้องใช้สำหรับ Tamadee)
   - **ระบบชำระเงินไทย (Opn Payments / PromptPay QR / COD):** Mercur มีปลั๊กอินสำเร็จรูปเฉพาะ Stripe Connect ซึ่งไม่ตอบโจทย์ PromptPay QR และการเก็บเงินปลายทางรายร้านในไทย จึงต้องสร้าง Payment Provider โมดูลของ Opn Payments + COD เองในระยะ 3
   - **การโอนเงินให้ผู้ขายเข้าบัญชีธนาคารไทย (Payout Disbursement):** โมดูล `Payout` ของ Mercur บันทึกยอดสุทธิหลังหักคอมมิชชัน 10% ให้ครบถ้วนแล้ว ในระยะแรกผู้ดูแลตลาดสามารถโอนเข้าบัญชีธนาคารไทยของร้านค้าตามยอดใน `/dashboard` และบันทึกสถานะการโอนได้โดยไม่เสียค่าไลเซนส์ Enterprise
