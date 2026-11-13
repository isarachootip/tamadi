# คู่มือขึ้นระบบ Tamadee ผ่าน Git + Coolify (4 โดเมนครบชุด)

ใช้ไฟล์ **`/docker-compose.coolify.yaml`** (ที่รากของโปรเจกต์) สำหรับติดตั้งผ่าน **Coolify v4** โดยเฉพาะ โดยจะ **ไม่รัน Caddy ซ้อน** เพื่อให้ `coolify-proxy` (Traefik/Caddy ของ Coolify) จัดการพอร์ต `80/443` และออกใบรับรอง HTTPS ทั้ง 4 โดเมนให้อัตโนมัติแบบไม่ชนพอร์ตและไม่ติด `502 Bad Gateway`

---

## 1. ชี้ DNS ทั้ง 4 โดเมนมายังเครื่อง Coolify
สร้าง **A Record** ทั้ง 4 ชื่อที่ผู้ให้บริการโดเมน `tamadee.online` ชี้มาที่ IP ของเครื่อง Coolify:
- `tamdi` → `<COOLIFY_SERVER_IP>`
- `m` → `<COOLIFY_SERVER_IP>`
- `webtamdi` → `<COOLIFY_SERVER_IP>`
- `bwebtamdi` → `<COOLIFY_SERVER_IP>`

---

## 2. สร้าง Resource ใหม่ใน Coolify
1. เข้าหน้าเว็บ Coolify → เลือก **Project / Environment** → กด **+ New**
2. เลือกแหล่งโค้ด Git ของคุณ (**GitHub App / Private Repository** หรือ **Public Repository**) แล้วใส่ URL:
   - Repository: `https://github.com/isarachootip/tamadi.git`
   - Branch: `main`
3. เลือก **Build Pack** เป็น **`Docker Compose`**
4. ตั้งค่าพาธให้ตรงตามนี้:
   - **Base Directory:** `/`
   - **Docker Compose Location:** `/docker-compose.coolify.yaml`
5. กด **Continue / Load Compose File**

---

## 3. ผูกโดเมนทั้ง 4 ตัวในแท็บ General (Services)
เมื่อ Coolify อ่านไฟล์ `docker-compose.coolify.yaml` แล้ว จะเห็นช่อง **Domains** ของ 3 บริการหลัก ให้กรอกดังนี้ (ระบุพอร์ตภายในต่อท้ายเพื่อให้ Coolify Proxy วิ่งเข้าถูกพอร์ต 100%):

| บริการใน Coolify | ค่าที่ใส่ในช่อง Domains |
|---|---|
| **`backend`** | `https://bwebtamdi.tamadee.online:9000` |
| **`mobile-web`** | `https://m.tamadee.online:8080` |
| **`storefront`** | `https://tamdi.tamadee.online:3000,https://webtamdi.tamadee.online:3000` |

กด **Save**

---

## 4. ตั้งค่า Environment Variables (Developer View)
ไปที่แท็บ **Environment Variables** → กดปุ่ม **Developer View** แล้ววางค่าด้านล่าง (เปลี่ยนรหัสผ่านเป็นค่าจริงของคุณ):

```env
POSTGRES_USER=tamadee
POSTGRES_PASSWORD=เปลี่ยนเป็นรหัสฐานข้อมูลยาวๆ_ไม่ซ้ำใคร
POSTGRES_DB=tamadee

JWT_SECRET=เปลี่ยนเป็นค่าสุ่มอย่างน้อย_32_ตัวอักษร
COOKIE_SECRET=เปลี่ยนเป็นค่าสุ่มอย่างน้อย_32_ตัวอักษร
STOREFRONT_REVALIDATE_SECRET=เปลี่ยนเป็นค่าสุ่ม_24_ตัวอักษร

MERCUR_BACKEND_URL=https://bwebtamdi.tamadee.online
MERCUR_VENDOR_URL=https://bwebtamdi.tamadee.online/seller
MOBILE_SITE_URL=https://m.tamadee.online
STOREFRONT_SITE_URL=https://tamdi.tamadee.online
COOKIE_DOMAIN=.tamadee.online

TAMADEE_SEED_ADMIN_EMAIL=admin@tamadee.online
TAMADEE_SEED_ADMIN_PASSWORD=ตั้งรหัสแอดมินของคุณ
TAMADEE_SEED_SELLER_PASSWORD=ตั้งรหัสร้านค้าตัวอย่างของคุณ

AUTO_SEED=true
TAMADEE_PUBLISHABLE_KEY=
```

> **สำคัญสำหรับ `TAMADEE_PUBLISHABLE_KEY` และ `MERCUR_BACKEND_URL`:** ในหน้า Environment Variables ของ Coolify ให้ติ๊ก **Available at Buildtime** ให้ตัวแปร `TAMADEE_PUBLISHABLE_KEY`, `MERCUR_BACKEND_URL`, และ `MOBILE_SITE_URL` ด้วย เพื่อให้ขั้นตอน Build ของ Flutter Web (`mobile-web`) และ Dashboard รับค่าไปคอมไพล์ได้ครบถ้วน

---

## 5. กด Deploy (2 จังหวะจบในหน้าเว็บ Coolify ไม่ต้อง SSH)

1. **กดปุ่ม `Deploy` ครั้งที่ 1:**
   - Coolify จะ Build ทุกคอนเทนเนอร์ รัน DB Migration และเพราะ `AUTO_SEED=true` ตัว `backend` จะสร้างข้อมูลเริ่มต้น (THB + VAT 7% + 5 หมวดไทย + 3 ร้านค้า + 30 สินค้า) ให้อัตโนมัติทันที
2. **คัดลอกค่า `pk_...` มาใส่แล้วกด Redeploy:**
   - เปิดแท็บ **Logs** ของบริการ `backend` ใน Coolify มองหาบรรทัด:
     `Publishable API Key: pk_...`
     *(หรือเข้าหน้า `https://bwebtamdi.tamadee.online/dashboard` → ล็อกอินด้วยอีเมล/รหัสแอดมิน → Settings → Publishable API Keys)*
   - นำค่า `pk_...` ไปใส่ในตัวแปร **`TAMADEE_PUBLISHABLE_KEY`** ในแท็บ Environment Variables (ตรวจสอบว่าติ๊ก **Available at Buildtime** แล้ว) และเปลี่ยน `AUTO_SEED=false`
   - กด **`Deploy`** อีก 1 ครั้ง — ทั้ง 4 โดเมนพร้อมใช้งานสมบูรณ์ และทุกครั้งที่ `git push` รอบถัดไป Coolify จะอัปเดตให้อัตโนมัติทันที!
