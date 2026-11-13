# แผนสร้าง Tamadee (ปรับปรุงสถาปัตยกรรม Hybrid Flutter + Next.js)

## ข้อมูลหลักของโปรเจกต์
- **รูปแบบธุรกิจ:** Multi-vendor Marketplace เปิดให้ผู้ขายรายอื่นนำของที่ตั้งใจทำมาขาย (ต้องรอ Admin อนุมัติ, คอมมิชชันตั้งต้น 10%)
- **ขนาดแคตตาล็อก:** สินค้าไม่เกิน 500 รายการ สกุลเงิน `THB` (ราคารวม VAT 7% Inclusive)
- **หมวดหมู่ตั้งต้น:** `เสื้อผ้า`, `รองเท้า`, `กระเป๋า`, `เครื่องประดับ`, `ของใช้/งานคราฟต์`
- **การจัดส่งและชำระเงิน:** ผู้ขายส่งเองคิดค่าส่งแยกร้าน รองรับ Opn Payments (PromptPay QR ล็อกสต็อก 15 นาที, บัตรเครดิต/เดบิต) และเก็บเงินปลายทาง (COD)

## โครงสร้างระบบ (Hybrid Architecture)
| โฟลเดอร์ / โดเมน | หน้าที่ | เทคโนโลยี |
|---|---|---|
| `apps/backend` -> `bwebtamdi.tamadee.online` | Store/Admin/Vendor API, Admin (`/dashboard`), Vendor (`/seller`), Worker | Mercur (บน Medusa v2) + PostgreSQL 16 + Redis 7 + Cloudflare R2 |
| `apps/mobile` -> `m.tamadee.online` + Android / iOS | แอปมือถือ Flutter (ทั้ง Native App, Web Build บน `m.` และ Deep Link เข้าแอปจริง) | Flutter (Riverpod + GoRouter + Dio + Clean Architecture) |
| `apps/storefront` -> `tamdi.tamadee.online` | หน้าร้านเว็บมือถือ (PWA) โหลดไวสำหรับคลิกลิงก์จากโซเชียล | Next.js + Tailwind + `@tamadee/ui` |
| `apps/storefront` -> `webtamdi.tamadee.online` | หน้าร้านจอใหญ่ + Google SEO / Sitemap / OpenGraph | Next.js โค้ดชุดเดียวกับ `tamdi` แยก Layout ตาม Hostname |
| `packages/ui` & `packages/flutter_ui` | Design Tokens, โลโก้ และมาสคอต "น้องทำมะดิ" คู่ขนานทั้ง Web & Mobile | TypeScript/React และ Dart/Flutter |

## ลำดับระยะงาน
- **ระยะ 0 (เสร็จแล้ว):** ตั้ง Monorepo, Docker Dev/Prod, Caddy 3 โดเมน, `@tamadee/ui` และ `docs/DEPLOY.md`
- **ระยะ 0.5 (กำลังดำเนินการ):** อัปเกรด Flutter SDK และสร้าง `packages/flutter_ui` พร้อม Widget Tests
- **ระยะ 1:** Backend Marketplace (`apps/backend` ด้วย Mercur, Seed ข้อมูล 3 ร้าน 30 สินค้า, `docs/BACKEND.md`)
- **ระยะ 2A:** แอปมือถือ Flutter (`apps/mobile`) ครบ Flow เลือกสินค้า ร้านค้า ตะกร้า สมาชิก และโครงหน้าผู้ช่วย AI
- **ระยะ 2B:** เว็บหน้าร้านมือถือ PWA (`tamdi.tamadee.online`)
- **ระยะ 3:** ชำระเงิน Opn Payments, จัดส่งแยกร้าน, ล็อกสต็อก 15 นาที และรายงานยอดโอนผู้ขาย CSV
- **ระยะ 4:** เว็บหน้าร้านจอใหญ่และ SEO (`webtamdi.tamadee.online`)
- **ระยะ 5:** ฟีเจอร์ล้ำ (AI น้องทำมะดิ, ค้นหาด้วยรูปถ่าย, LINE Login & แจ้งเตือน, Push Notification)
- **ระยะ 6:** ขึ้น Production, สำรองฐานข้อมูล, CI/CD, กฎหมาย PDPA และ E2E Tests
