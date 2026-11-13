# ระยะ 0: เตรียมระบบ

## 1. DNS (ทำที่ผู้ให้บริการโดเมน tamadee.online)
สร้าง A record 4 ตัว ชี้ไปที่ IP ของ VPS:
- `m` (แอป Flutter Web Build + Deep Link เข้าแอปมือถือ)
- `tamdi` (เว็บมือถือ PWA โหลดไว)
- `webtamdi` (เว็บจอใหญ่ & SEO)
- `bwebtamdi` (Backend API, Admin, Vendor)

## 2. VPS
- ต้องทราบ: ระบบปฏิบัติการ, RAM, พื้นที่ดิสก์, มีบริการอื่นใช้พอร์ต 80/443 อยู่หรือไม่
- ค่าประมาณขั้นต่ำสำหรับ backend + ฐานข้อมูล + หน้าร้านบนเครื่องเดียว: RAM 4 GB (ต้องยืนยันหลังติดตั้งจริง)
- ติดตั้ง Docker และ Docker Compose
- เปิดพอร์ต 80 และ 443

## 3. เริ่มบริการพื้นฐาน
```
cd infra
cp .env.example .env    # แก้รหัสผ่าน
docker compose up -d
```
ไฟล์ docker-compose.yml ยังเป็นฉบับร่าง ยังไม่ได้ทดสอบบน VPS จริง

## 4. Repo
- git init แล้วเก็บโค้ดขึ้น GitHub (private)

## เสร็จระยะ 0 เมื่อ
- [ ] โดเมนทั้ง 3 ชี้มาที่ VPS
- [ ] Postgres, Redis, Caddy รันอยู่
- [ ] มี repo และสำรองข้อมูลฐานข้อมูลอัตโนมัติ
