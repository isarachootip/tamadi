# คู่มือติดตั้งและเอาขึ้นเซิร์ฟเวอร์จริง (VPS Ubuntu 24.04 LTS)

> **หากใช้งานผ่าน Git + Coolify:** ให้ใช้ไฟล์ `/docker-compose.coolify.yaml` และทำตามคู่มือ [COOLIFY.md](./COOLIFY.md) แทน (เพื่อไม่ให้ Caddy ชนพอร์ต 80/443 กับ Coolify Proxy)

เอกสารนี้อธิบายขั้นตอนนำระบบ **Tamadee ("ทำมาดี ทำมาขาย")** ขึ้นเซิร์ฟเวอร์จริงครบทั้ง 4 โดเมนหลัก (`bwebtamdi`, `m`, `tamdi`, `webtamdi`) ด้วย Docker Compose และออกใบรับรอง HTTPS อัตโนมัติผ่าน Caddy 2

---

## 1. สเปกเครื่องและข้อกำหนดเบื้องต้น
- **ระบบปฏิบัติการ:** Ubuntu 24.04 LTS (64-bit)
- **หน่วยความจำ (RAM):** ขั้นต่ำ **4 GB + Swap 4 GB** (แนะนำ **8 GB** เพื่อให้จังหวะคอมไพล์ Docker Build ของ Backend, Next.js และ Flutter ลื่นไหลไม่ติดหน่วยความจำเต็ม)
- **พื้นที่ดิสก์:** อย่างน้อย 40 GB SSD
- **พอร์ตที่ต้องว่าง:** `80/tcp`, `443/tcp`, `443/udp` (ห้ามมี Nginx หรือ Apache รันทับพอร์ตเหล่านี้)

---

## 2. ชี้ DNS ทั้ง 4 โดเมนมายัง IP ของเซิร์ฟเวอร์
ที่ผู้ให้บริการโดเมน `tamadee.online` สร้าง **A Record** ทั้ง 4 รายการชี้มาที่ IP จริงของ VPS:

| Host | Type | Value | บริการปลายทาง |
|---|---|---|---|
| `bwebtamdi` | `A` | `<VPS_PUBLIC_IP>` | Backend API, Admin (`/dashboard`) และ Vendor (`/seller`) |
| `m` | `A` | `<VPS_PUBLIC_IP>` | แอปมือถือ Flutter Web & Deep Links (`m.tamadee.online`) |
| `tamdi` | `A` | `<VPS_PUBLIC_IP>` | เว็บหน้าร้านมือถือ PWA โหลดไว (`tamdi.tamadee.online`) |
| `webtamdi` | `A` | `<VPS_PUBLIC_IP>` | เว็บหน้าร้านหลัก (`webtamdi.tamadee.online`) |

ทดสอบว่า DNS ชี้ถูกต้องแล้ว:
```bash
dig +short bwebtamdi.tamadee.online m.tamadee.online tamdi.tamadee.online webtamdi.tamadee.online
```

---

## 3. เตรียมเครื่อง VPS (Swap, Firewall & Docker)
SSH เข้าเซิร์ฟเวอร์แล้วรันตามลำดับ:

```bash
# 1. อัปเดตแพ็กเกจและสร้าง Swap 4 GB (สำคัญมากสำหรับการ Build บนเครื่อง RAM 4-8 GB)
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg git ufw openssl

if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 2. เปิด Firewall เฉพาะ SSH และ HTTPS/HTTP
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

# 3. ติดตั้ง Docker Engine + Docker Compose Plugin
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

---

## 4. ดึงโค้ด ตั้งค่าความลับ และเปิดระบบครบทุกโดเมน

```bash
# 1. โคลนโปรเจกต์ลงที่ /opt/tamadee
sudo mkdir -p /opt/tamadee && sudo chown "$USER:$USER" /opt/tamadee
git clone https://github.com/isarachootip/tamadi.git /opt/tamadee
cd /opt/tamadee/infra

# 2. สร้างไฟล์ .env และสุ่มรหัสผ่านความปลอดภัยสูงอัตโนมัติ
cp .env.example .env
chmod 600 .env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
sed -i "s|COOKIE_SECRET=.*|COOKIE_SECRET=$(openssl rand -hex 32)|" .env
sed -i "s|STOREFRONT_REVALIDATE_SECRET=.*|STOREFRONT_REVALIDATE_SECRET=$(openssl rand -hex 24)|" .env

# เปิดแก้ไข TAMADEE_SEED_ADMIN_PASSWORD และ TAMADEE_SEED_SELLER_PASSWORD เป็นรหัสที่คุณต้องการใช้ล็อกอิน
nano .env
```

### ขั้นตอนเปิดระบบครั้งแรก (2 จังหวะเพื่อให้ได้ `Publishable API Key` จริง)

```bash
# จังหวะที่ 1: รันฐานข้อมูลและ Backend ก่อน แล้วสั่ง Seed ข้อมูลเริ่มต้น (THB + VAT 7% + 5 หมวด + 30 สินค้า)
docker compose up -d --build postgres redis backend worker
docker compose ps   # รอประมาณ 20-30 วินาทีจน backend ขึ้นสถานะ (healthy)

docker compose exec backend pnpm exec medusa exec ./src/scripts/seed.js
```

คำสั่ง Seed ด้านบนจะพิมพ์บรรทัด **`Publishable API Key: pk_...`** ออกมาบนหน้าจอ ให้นำค่านั้นไปใส่ใน `.env`:

```bash
# วางค่า pk_... ที่ได้ลงใน TAMADEE_PUBLISHABLE_KEY ในไฟล์ .env
nano .env

# จังหวะที่ 2: Build และรันหน้าร้านทั้งหมดพร้อม Caddy (ออก SSL HTTPS ทั้ง 4 โดเมนอัตโนมัติ!)
docker compose up -d --build
```

---

## 5. วิธีอัปเดตโค้ดเวอร์ชันใหม่ในอนาคต (เมื่อเราทำระยะ 3–6 เสร็จ)

```bash
cd /opt/tamadee
git pull origin main
cd infra
docker compose up -d --build
docker image prune -f
```
