# คู่มือพัฒนาและรันเว็บหน้าร้าน Tamadee (`apps/storefront`)

เว็บหน้าร้านของ **Tamadee (ทำมาดี ทำมาขาย)** พัฒนาด้วย **Next.js 16.4 (App Router + Turbopack)**, **Tailwind CSS v4**, **TypeScript Strict**, **Zod 4.6** และแพ็กเกจกลาง **`@tamadee/ui`** จากโค้ดชุดเดียว รองรับการแสดงผลทั้ง:
- **`tamdi.tamadee.online` (ระยะ 2B):** เว็บมือถือ PWA โหลดไวสำหรับลูกค้าที่กดลิงก์จาก LINE / Facebook / TikTok (เมื่อเปิดบนคอมพิวเตอร์จะแสดงกรอบจอมือถือ `max-w-[430px]` กลางหน้าจอ)
- **`webtamdi.tamadee.online` (ระยะ 4):** เว็บจอใหญ่และ SEO เต็มรูปแบบ แยกด้วย `src/proxy.ts` (`x-tamadee-surface`)

---

## 1. โครงสร้างสถาปัตยกรรม (Modular Clean Layers — ทุกไฟล์ `< 200` บรรทัด)

- **`src/domain/`** — โมเดลธุรกิจแบบ Immutable (`types.ts`), การคำนวณยอดตะกร้าและค่าจัดส่งแยกร้าน (`pricing.ts`), การจับคู่ตัวเลือกไซซ์/สีและตัวกรองสินค้า (`catalog-logic.ts`)
- **`src/data/`** — การอ่านค่า `.env` และคุกกี้ `HttpOnly` แบบปลอดภัย (`env.ts`, `cookies.ts`, `session.ts`), ไคลเอนต์เชื่อม Mercur API (`mercur-client.ts`), Zod Schemas ตรวจสอบ JSON ทุกรายการ (`schemas/*`), Mappers (`mappers/*`) และ Repositories (`repositories/*`)
- **`src/actions/`** — Next.js Server Actions ที่ตรวจสอบข้อมูลขาเข้าด้วย Zod ทุกจุด (`cart-actions.ts`, `auth-actions.ts`) พร้อมโอนตะกร้าสินค้าเข้าบัญชีลูกค้าอัตโนมัติเมื่อเข้าสู่ระบบ
- **`src/app/` & `src/components/`** — React Server Components (RSC) คู่กับ Client Islands ขนาดเล็ก รองรับ Dark Mode, PWA (`manifest.ts` + `public/sw.js`) และมาตรฐานการเข้าถึง WCAG AA/AAA

---

## 2. แผนผังเส้นทางหน้าจอ (Routes)

| เส้นทาง | หน้าจอ | รายละเอียด |
|---|---|---|
| `/` | หน้าแรก (Home) | โลโก้ Tamadee, ค้นหา, แบนเนอร์ `NEW DROP 2026`, หมวดหมู่ 5 หมวด, AI เลือกให้คุณ, สินค้ามาใหม่ และเมนูล่าง 5 ปุ่ม |
| `/categories` | หมวดหมู่และร้านค้า | รายการหมวดหมู่สินค้าทั้ง 5 หมวดพร้อมจำนวนสินค้าจริง และรายชื่อร้านค้าไทยที่ผ่านการอนุมัติ |
| `/products` | ค้นหาและตัวกรอง | ค้นหาคำสำคัญ กรองตามหมวดหมู่/ช่วงราคา และเรียงลำดับราคา |
| `/products/[id]` | รายละเอียดสินค้า | แกลเลอรีหลายรูป, เลือกสี/ไซซ์, การ์ดผู้ขาย, ปุ่มกดหัวใจ, ปุ่ม `"ใส่ตะกร้า"` และ `"ซื้อเลย"` |
| `/sellers/[id]` | หน้าร้านผู้ขาย | ข้อมูลร้านค้า นโยบายจัดส่ง และรายการสินค้าทั้งหมดของร้าน |
| `/cart` | ตะกร้าสินค้าแยกร้าน | จัดกลุ่มสินค้าและค่าส่งแยกตามผู้ขาย, ช่องโค้ดส่วนลด, ตัวเลือกวิธีชำระเงิน และสรุปยอดรวม VAT 7% |
| `/wishlist` | รายการถูกใจ | สินค้าที่กดหัวใจบันทึกไว้ |
| `/account`, `/account/login`, `/account/register`, `/account/addresses` | ระบบสมาชิก | สลับโหมดสว่าง/มืด/ตามระบบ, สมัคร/เข้าสู่ระบบ, จัดการที่อยู่จัดส่งในไทย และดูประวัติกลุ่มคำสั่งซื้อ |
| `/ai` | ผู้ช่วย AI "น้องทำมะดิ" | โครงหน้าจอโหมดมืด `#111111` พรีวิวชุดแนะนำและปุ่มคำถามด่วน (เตรียมเชื่อม LLM จริงในระยะ 5) |

---

## 3. การตั้งค่า `.env.local` และวิธีรันพัฒนาบนเครื่อง

คัดลอกไฟล์ตัวอย่างก่อนเริ่มใช้งาน (ห้าม commit `.env.local` ลง Git):

```bash
cp apps/storefront/.env.example apps/storefront/.env.local
```

ใส่ค่า `NEXT_PUBLIC_PUBLISHABLE_KEY` จากหน้า Admin ของ Mercur Backend แล้วรัน:

```bash
# รันโหมดพัฒนา (พอร์ต 3000)
pnpm storefront:dev

# สร้าง Production Build และรันทดสอบความเร็วจริง
pnpm storefront:build
pnpm --filter @tamadee/storefront start
```

---

## 4. การตรวจสอบคุณภาพโค้ดและชุดทดสอบ

```bash
# ตรวจสอบชนิดข้อมูล TypeScript แบบเข้มงวด (0 errors)
pnpm storefront:typecheck

# รัน Unit Tests (Domain + Zod Schemas + Mappers)
pnpm storefront:test

# รัน Live E2E Test ร่วมกับ Mercur Backend (พอร์ต 9000) และ Storefront (พอร์ต 3000)
pnpm --filter @tamadee/storefront test:live
```

---

## 5. ผลคะแนน Google Lighthouse มือถือจริง (Lighthouse 13.6 Mobile Emulation)

วัดบน Production Build (`next build` + `next start`) เชื่อมต่อข้อมูลจริงจาก Mercur v2 Backend:

| หน้าจอที่ตรวจวัด | Performance (มือถือ) | Accessibility (มือถือ) | Best Practices | LCP / CLS |
|---|---:|---:|---:|---:|
| หน้าแรก (`/`) | **100 / 100** | **100 / 100** | **96 / 100** | `0.9 s` / `0` |
| หน้ารายละเอียดสินค้า (`/products/[id]`) | **100 / 100** | **100 / 100** | **96 / 100** | `0.8 s` / `0` |
| หน้าตะกร้าสินค้า (`/cart`) | **100 / 100** | **100 / 100** | **100 / 100** | `0.8 s` / `0` |
