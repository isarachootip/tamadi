# Tamadee ("ทำมาดี ทำมาขาย")

Marketplace หลายผู้ขายสำหรับตลาดไทย (สินค้าไม่เกิน 500 รายการ สกุลเงิน THB)

## สถาปัตยกรรม Hybrid & โดเมนหลัก

| ส่วนระบบ | โฟลเดอร์ / โดเมน | เทคโนโลยี |
|---|---|---|
| **Flutter Mobile App** | `m.tamadee.online` + Android / iOS (`apps/mobile`) | Flutter + Riverpod + GoRouter + Dio (Web Build + Deep Links) |
| **Mobile Web (PWA)** | `tamdi.tamadee.online` (`apps/storefront`) | Next.js (App Router) + Tailwind CSS (โหลดไวจากลิงก์โซเชียล) |
| **Desktop Web & SEO** | `webtamdi.tamadee.online` (`apps/storefront`) | Next.js โค้ดชุดเดียวกับ `tamdi` แยก Layout |
| **Backend, Admin & Vendor** | `bwebtamdi.tamadee.online` (`apps/backend`) | Mercur (บน Medusa v2) + PostgreSQL 16 + Redis 7 |

## แพ็กเกจที่ใช้ร่วมกัน (`packages/`)
- `packages/ui` (`@tamadee/ui`): Design Tokens, Tailwind v4 `@theme` และ React SVG Components สำหรับฝั่งเว็บ
- `packages/flutter_ui` (`tamadee_flutter_ui`): Flutter `ThemeData` (Light/Dark), ค่าสี/ฟอนต์ และ SVG Widgets สำหรับฝั่งแอปมือถือ

## แบรนด์และอัตลักษณ์
- **มาสคอต:** "น้องทำมะดิ" กล่องพัสดุยิ้มได้ มีตราเครื่องหมายถูกโผล่จากฝากล่อง (`brand/*.svg`)
- **สีหลัก:** `#111111` (ดำ), `#C6F432` (เขียวมะนาว), `#FFFFFF` (ขาว), `#F1F1EE` (เทาอ่อน) รองรับ Dark Mode
- **ฟอนต์:** `Space Grotesk` (โลโก้/ตัวเลข) และ `Anuphan` (ภาษาไทย)
- **UX มือถือ:** Minimal + Bold Typography, มุมโค้งมน, ปุ่มกดสูงอย่างน้อย `44px` (`44dp`)

## เอกสารโครงการ
- [PLAN.md](./PLAN.md) — แผนภาพรวมและข้อตกลงทางสถาปัตยกรรม
- [docs/PHASE0.md](./docs/PHASE0.md) — ขั้นตอนเตรียมโดเมนและระบบพื้นฐาน
- [docs/COOLIFY.md](./docs/COOLIFY.md) — คู่มือขึ้นเซิร์ฟเวอร์ผ่าน Git + Coolify (4 โดเมน)
- [docs/DEPLOY.md](./docs/DEPLOY.md) — คู่มือติดตั้ง VPS Ubuntu 24.04 LTS แบบรัน Docker Compose โดยตรง
- [docs/PROMPTS.md](./docs/PROMPTS.md) — แผนการดำเนินงานแบ่งตามระยะ
