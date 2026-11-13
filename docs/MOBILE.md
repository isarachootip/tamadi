# คู่มือพัฒนาและรันแอปมือถือ Tamadee (`apps/mobile`)

แอปมือถือและเว็บมือถือของ **Tamadee (ทำมาดี ทำมาขาย)** พัฒนาด้วย **Flutter 3.50 / Dart 3.14** จากโค้ดชุดเดียว รองรับทั้ง **Android**, **iOS** และ **Mobile Web PWA (`https://m.tamadee.online`)** โดยใช้โทเคนสี ฟอนต์ โลโก้ และมาสคอตร่วมกับ `packages/flutter_ui` และเชื่อมต่อข้อมูลจริงกับ **Mercur v2 / Medusa v2 Store & Auth API**

---

## 1. โครงสร้างสถาปัตยกรรม (Clean Architecture)

ทุกไฟล์ใน `apps/mobile/lib/` ถูกควบคุมความยาวไม่เกิน 200 บรรทัด และแยกความรับผิดชอบออกเป็น 4 ชั้นชัดเจน:

- **`lib/src/core/`** — การตั้งค่ารันไทม์ (`AppConfig`), ตัวจัดรูปแบบสกุลเงินบาท (`ThbFormatter`), ไคลเอนต์ HTTP (`ApiClient` บน `Dio`), ตัวแปลง JSON แบบ Type-safe ปลอด `dynamic` (`JsonParsers`) และตัวจัดเก็บข้อมูล (`TokenStorage` บน `FlutterSecureStorage`, `LocalPrefsStorage` บน `SharedPreferences`)
- **`lib/src/domain/`** — โมเดลธุรกิจ (`ProductSummary`, `ProductDetail`, `SellerSummary`, `CartModel`, `SellerCartGroup`, `CustomerProfile`) และอินเทอร์เฟซ Repository
- **`lib/src/data/`** — ตัวแปลงข้อมูล (`Mappers`) และการใช้งานจริงกับ Mercur v2 (`MercurCatalogRepository`, `MercurCartRepository`, `MercurAuthRepository`)
- **`lib/src/presentation/`** — Riverpod 3.5 Providers/Notifiers, GoRouter 18.1 (`PathUrlStrategy`), Shell กรอบจอมือถือบนจอใหญ่ (`MobileFrameWrapper`) และหน้าจอทั้ง 8 โมดูล

---

## 2. แผนผังหน้าจอและเส้นทาง (Routes & Deep Links)

| เส้นทาง (URL / Deep Link) | หน้าจอ | รายละเอียดหลัก |
|---|---|---|
| `/` | หน้าแรก (Home) | โลโก้ Tamadee, ค้นหา, แบนเนอร์คอลเลกชันใหม่, หมวดหมู่ 5 หมวด, AI เลือกให้คุณ และสินค้ามาใหม่ |
| `/categories` | หมวดหมู่ทั้งหมด | รายการหมวดหมู่สินค้าทั้ง 5 หมวดพร้อมกดเข้าดูสินค้าในหมวด |
| `/products` | ค้นหาและกรองสินค้า | ค้นหาคำสำคัญ, กรองตามหมวดหมู่/ช่วงราคา และเรียงลำดับราคา |
| `/products/:id` | รายละเอียดสินค้า | ปัดดูรูปหลายมุม, เลือกสี/ไซซ์ตามตัวเลือกจริง, การ์ดร้านค้าผู้ขาย, กดหัวใจ และเพิ่มลงตะกร้า |
| `/sellers/:id` | หน้าร้านผู้ขาย | ข้อมูลร้านค้า ระยะเวลาจัดส่ง และรายการสินค้าทั้งหมดของร้านนั้น |
| `/cart` | ตะกร้าสินค้าแยกร้าน | จัดกลุ่มรายการและคำนวณค่าส่งแยกตามผู้ขายอัตโนมัติ พร้อมช่องโค้ดส่วนลดและตัวเลือกวิธีชำระเงิน |
| `/wishlist` | รายการโปรด | สินค้าที่กดหัวใจเก็บไว้ ซิงก์สถานะข้ามทุกหน้าจอ |
| `/account` | บัญชีของฉัน | สลับโหมดสว่าง/มืด/ตามระบบ, ข้อมูลสมาชิก, ประวัติคำสั่งซื้อ (`Order Groups`), จัดการที่อยู่จัดส่ง |
| `/account/login`, `/account/register` | เข้าสู่ระบบ / สมัครสมาชิก | เชื่อมต่อ Medusa Customer Auth JWT พร้อมโอนตะกร้าสินค้าปัจจุบันเข้าบัญชีอัตโนมัติ |
| `/account/addresses` | ที่อยู่จัดส่ง | ดูและเพิ่มที่อยู่จัดส่งในประเทศไทย |
| `/ai` | ผู้ช่วย AI "น้องทำมะดิ" | โหมดหน้าจอมืดเฉพาะตัว พร้อมพรีวิวชุดแมตช์และชิปคำถามด่วน (UI Shell เตรียมเชื่อม LLM ในระยะ 5) |

---

## 3. การตั้งค่าตัวแปรสภาพแวดล้อม (`--dart-define`)

ห้ามใส่ API Key จริงลงใน Git ให้คัดลอกไฟล์ตัวอย่างก่อนรันบนเครื่อง:

```bash
cp apps/mobile/.env.example.json apps/mobile/.env.json
```

แก้ไขค่า `TAMADEE_PUBLISHABLE_KEY` ใน `apps/mobile/.env.json` ให้ตรงกับ Publishable API Key จากหน้า Admin (`/dashboard` -> Settings -> Publishable API Keys):

```json
{
  "TAMADEE_API_BASE_URL": "http://127.0.0.1:9000",
  "TAMADEE_PUBLISHABLE_KEY": "pk_your_medusa_publishable_api_key",
  "TAMADEE_SITE_URL": "https://m.tamadee.online"
}
```

> **หมายเหตุสำหรับ Android Emulator:** เมื่อรันบน Android Emulator ระบบ `AppConfig` จะแปลง `127.0.0.1` หรือ `localhost` เป็น `10.0.2.2` ให้อัตโนมัติโดยไม่ต้องแก้ไฟล์ `.env.json`

---

## 4. คำสั่งรันพัฒนาบนเครื่อง (Local Development)

ตรวจสอบให้แน่ใจว่าเปิดฐานข้อมูลและ Backend (`pnpm backend:dev` ที่พอร์ต `9000`) เรียบร้อยแล้ว จากนั้นรันจากโฟลเดอร์ `apps/mobile`:

```bash
cd apps/mobile
flutter pub get

# 1. รันบนเว็บเบราว์เซอร์ Chrome (จำลองกรอบมือถือกลางจอเหมือน m.tamadee.online)
flutter run -d chrome --web-port 8080 --dart-define-from-file=.env.json

# 2. รันบน Android Emulator
flutter run -d android --dart-define-from-file=.env.json

# 3. รันบน iOS Simulator (เฉพาะ macOS)
flutter run -d ios --dart-define-from-file=.env.json
```

---

## 5. การตรวจสอบคุณภาพโค้ดและชุดทดสอบ (Verification & Tests)

```bash
cd apps/mobile

# ตรวจ Static Analysis แบบเข้มงวด (ห้ามมี error, warning หรือ info แม้แต่รายการเดียว)
flutter analyze --fatal-infos --fatal-warnings

# รัน Unit Tests + Widget Tests แบบออฟไลน์ทั้งหมด
flutter test

# รัน E2E Integration Test ยิงจริงเข้า Mercur Backend ที่รันอยู่บนพอร์ต 9000
flutter test test/live_backend_e2e_test.dart --dart-define-from-file=.env.json
```

---

## 6. Deep Links และการขึ้นระบบจริงบน `m.tamadee.online`

1. **ไฟล์ยืนยันโดเมนสำหรับเปิดแอปอัตโนมัติ (App Links / Universal Links):**
   - Android: `apps/mobile/web/.well-known/assetlinks.json` (เปลี่ยนค่า `REPLACE_WITH_PRODUCTION_SIGNING_CERT_SHA256_FINGERPRINT` เมื่อมี Keystore จริง)
   - iOS: `apps/mobile/web/.well-known/apple-app-site-association` (เปลี่ยนค่า `TEAMID` เป็น Apple Developer Team ID จริง)
2. **การเสิร์ฟผ่าน Docker & Caddy (`m.tamadee.online`):**
   - `apps/mobile/Dockerfile` คอมไพล์ `flutter build web --release` พร้อมฝังค่า `TAMADEE_API_BASE_URL` และ `TAMADEE_PUBLISHABLE_KEY` ตั้งแต่ขั้นตอน Build และเสิร์ฟด้วย `nginx:1.27-alpine` บนพอร์ต `8080`
   - `apps/mobile/nginx.conf` บังคับ `Content-Type: application/json` ให้ `/.well-known/*` มี `/healthz` สำหรับ Docker Healthcheck และทำ SPA Fallback (`try_files $uri $uri/ /index.html`) รองรับการเปิดลิงก์ตรงทุกหน้า
   - ใน `infra/.env` บนเซิร์ฟเวอร์ ให้ตั้งค่า `TAMADEE_PUBLISHABLE_KEY` และรัน `docker compose -f infra/docker-compose.yml up -d --build mobile-web caddy`
