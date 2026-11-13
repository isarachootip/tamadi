# คู่มือติดตั้งและตั้งค่า VPS (Ubuntu 24.04 LTS / RAM 4–8 GB)

เอกสารนี้อธิบายขั้นตอนเตรียมเครื่องแม่ข่าย (VPS) สำหรับรันระบบ **Tamadee ("ทำมาดี ทำมาขาย")** ตั้งแต่เครื่องเปล่าจนถึงรันบริการพื้นฐานด้วย Docker Compose และออกใบรับรอง HTTPS อัตโนมัติ

---

## 1. สเปกเครื่องและข้อกำหนดเบื้องต้น
- **ระบบปฏิบัติการ:** Ubuntu 24.04 LTS (64-bit)
- **หน่วยความจำ (RAM):** ขั้นต่ำ 4 GB (แนะนำ 8 GB เมื่อรันครบทั้ง Backend, Worker, Vendor Panel และ Storefront)
- **พื้นที่ดิสก์:** อย่างน้อย 40 GB SSD
- **พอร์ตที่ต้องว่าง:** `80/tcp`, `443/tcp`, `443/udp` (ห้ามมี Nginx หรือ Apache รันทับพอร์ตเหล่านี้)

---

## 2. ตั้งค่า DNS ทั้ง 4 โดเมนหลัก
ไปที่ผู้ให้บริการจัดการโดเมน `tamadee.online` แล้วสร้าง **A Record** ทั้ง 4 รายการชี้มายัง IP จริงของ VPS:

| ชื่อระเบียน (Host) | ประเภท | ค่าปลายทาง | หน้าที่ |
|---|---|---|---|
| `m` | `A` | `<VPS_PUBLIC_IP>` | แอป Flutter Web Build & Deep Link (`m.tamadee.online`) |
| `tamdi` | `A` | `<VPS_PUBLIC_IP>` | หน้าร้านเว็บมือถือ PWA (`tamdi.tamadee.online`) |
| `webtamdi` | `A` | `<VPS_PUBLIC_IP>` | หน้าร้านจอใหญ่ & SEO (`webtamdi.tamadee.online`) |
| `bwebtamdi` | `A` | `<VPS_PUBLIC_IP>` | Backend API, Admin (`/dashboard`) และ Vendor (`/seller`) |

ตรวจสอบว่า DNS กระจายตัวแล้วก่อนเริ่มเปิด Caddy:
```bash
dig +short m.tamadee.online tamdi.tamadee.online webtamdi.tamadee.online bwebtamdi.tamadee.online
```

---

## 3. อัปเดตระบบ ตั้งค่า Swap และ Firewall (UFW)
SSH เข้าสู่เครื่อง VPS แล้วรันคำสั่งต่อไปนี้:

```bash
# 1. อัปเดตแพ็กเกจระบบให้เป็นปัจจุบัน
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg git ufw

# 2. สร้าง Swap 4 GB (จำเป็นมากสำหรับ VPS ที่มี RAM 4 GB เพื่อกัน OOM)
if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. เปิด Firewall อนุญาตเฉพาะ SSH, HTTP, HTTPS และ HTTP/3
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable
sudo ufw status verbose
```

---

## 4. ติดตั้ง Docker Engine และ Docker Compose Plugin (Official Repo)
ติดตั้งจากคลังทางการของ Docker สำหรับ Ubuntu 24.04 (`noble`):

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# เพิ่มผู้ใช้ปัจจุบันเข้ากลุ่ม docker (ต้อง logout/login ใหม่ 1 ครั้งจึงจะมีผล)
sudo usermod -aG docker "$USER"
docker --version && docker compose version
```

---

## 5. ดึงโค้ด ตั้งค่า `.env` และรัน Docker Compose

```bash
# 1. เตรียมโฟลเดอร์โปรเจกต์
sudo mkdir -p /opt/tamadee && sudo chown "$USER:$USER" /opt/tamadee
git clone https://github.com/isarachootip/tamadi.git /opt/tamadee
cd /opt/tamadee/infra

# 2. สร้างไฟล์ .env จากต้นแบบและสุ่มรหัสผ่านที่ปลอดภัย
cp .env.example .env
chmod 600 .env
nano .env
# แก้ไข POSTGRES_PASSWORD เป็นรหัสผ่านสุ่มยาวอย่างน้อย 32 ตัวอักษร (เช่น openssl rand -hex 24)

# 3. ตรวจสอบไวยากรณ์ Compose และเริ่มบริการทั้งหมดในพื้นหลัง
docker compose config --quiet
docker compose up -d
```

---

## 6. การตรวจสอบสถานะหลังรันระบบ

```bash
# ตรวจว่าทุก Container อยู่ในสถานะ Up / healthy
docker compose ps

# ทดสอบ PostgreSQL และ Redis จากภายใน Container (พอร์ตไม่ถูกเปิดออกสู่ภายนอก)
docker compose exec postgres pg_isready -U tamadee -d tamadee
docker compose exec redis redis-cli ping

# ดูบันทึกการออกใบรับรอง SSL ของ Caddy
docker compose logs -f caddy
```
เมื่อทั้ง 3 โดเมนชี้ DNS ถูกต้องแล้ว Caddy จะออกใบรับรอง Let's Encrypt ให้อัตโนมัติโดยไม่ต้องตั้งค่า Certbot เพิ่มเติม
