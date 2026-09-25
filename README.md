# แพลตฟอร์มทดสอบการใช้งานเว็บไซต์ (Usability Testing Platform MVP)

ยินดีต้อนรับสู่ MVP ของแพลตฟอร์มทดสอบการใช้งานเว็บไซต์! โปรเจกต์นี้ทำงานในรูปแบบ Monorepo โดยประกอบไปด้วย Web Application, Backend API, และ Chrome Extension

---

## 🚀 การเริ่มต้นระบบด้วย Docker (วิธีที่แนะนำ)

คุณสามารถเปิดใช้งานระบบทั้งหมด (Database, API, Web) ได้ง่ายๆ ในคำสั่งเดียวผ่าน Docker Compose

### สิ่งที่ต้องมีเบื้องต้น
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) ติดตั้งและเปิดใช้งานบนเครื่องของคุณ
2. [Node.js](https://nodejs.org/) & [pnpm](https://pnpm.io/) (จำเป็นสำหรับการ Build Chrome Extension ออกมาใช้งาน)

### ขั้นตอนการรันระบบ (รัน Web, API, Database)

1. เปิด Terminal ในโฟลเดอร์หลักของโปรเจกต์
2. รันคำสั่งต่อไปนี้เพื่อ Build และ Start containers ทั้งหมด:
   ```bash
   docker compose up -d --build
   ```
3. รอสักครู่ (ระบบกำลังติดตั้ง package, สร้างฐานข้อมูล Prisma อัตโนมัติ, และรันเซิร์ฟเวอร์)
4. เมื่อเสร็จสิ้น คุณสามารถเข้าถึง:
   - **Web Application:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:4000](http://localhost:4000)

*หากต้องการหยุดระบบ ให้ใช้คำสั่ง `docker compose down`*

---

## 🧩 วิธีติดตั้งและใช้งาน Chrome Extension

Chrome Extension จำเป็นสำหรับการให้ฝั่ง Tester เข้าไปทำภารกิจบนเว็บไซต์เป้าหมาย โดยต้อง Build จาก Source code ไปใส่ในเบราว์เซอร์

### ขั้นตอนที่ 1: Build Extension
รันคำสั่งเหล่านี้ใน Terminal เพื่อสร้างไฟล์ Extension:
```bash
pnpm install
cd apps/extension
pnpm run build
```
*(เมื่อรันเสร็จ คุณจะได้โฟลเดอร์ `apps/extension/dist`)*

### ขั้นตอนที่ 2: ติดตั้งเข้า Google Chrome
1. เปิด Google Chrome แล้วพิมพ์ในช่อง URL ว่า `chrome://extensions/` แล้วกด Enter
2. ที่มุมขวาบนของหน้าจอ ให้เปิดสวิตช์ **Developer mode (โหมดนักพัฒนาซอฟต์แวร์)**
3. จะมีเมนูใหม่โผล่ขึ้นมาด้านซ้ายบน ให้คลิกที่ **"Load unpacked" (โหลดส่วนขยายที่แยกไฟล์แล้ว)**
4. เลือกโฟลเดอร์ `apps/extension/dist` ที่เราเพิ่ง Build ออกมา
5. จะเห็น "Usability Testing MVP" ปรากฏขึ้นในหน้ารายการ Extension แสดงว่าติดตั้งสำเร็จ!

---

## 🎮 คู่มือการใช้งานจริง (End-to-End Flow)

เมื่อรัน Docker เสร็จและติดตั้ง Chrome Extension เรียบร้อยแล้ว เรามาลองใช้งานระบบกันเลย!

### 🧑‍💼 บทบาท Owner (เจ้าของเว็บไซต์ / ผู้จ้าง)
1. เปิด **Web App** ไปที่ [http://localhost:3000](http://localhost:3000)
2. (จำลอง) ทำการสร้างแคมเปญทดสอบใหม่ (Test Campaign) โดยระบุ:
   - **Target URL:** เว็บที่ต้องการให้คนเข้าไปทดสอบ (เช่น `https://example.com`)
   - **Tasks:** คำสั่งทีละขั้นตอน เช่น "1. หาสินค้า A", "2. กดใส่ตะกร้า"
   - **Reward:** ค่าตอบแทน
3. ระบบจะบันทึกงานนี้เข้าสู่ Job Board ของระบบ

### 🕵️ บทบาท Tester (ผู้ทดสอบ)
1. Tester เปิดเข้า **Web App** [http://localhost:3000](http://localhost:3000) และเข้าสู่ระบบ (ระบบจำลอง)
2. **การซิงค์รหัส (Auth Sync):**
   - ในหน้า Dashboard จะมีปุ่ม **"Sync Auth to Chrome Extension"** ให้คลิกที่ปุ่มนี้
   - Web App จะทำการส่ง Token (รหัสยืนยันตัวตน) ทะลุเข้าไปยัง Chrome Extension ของคุณโดยตรง!
   - คุณสามารถกดเปิดไอคอน Extension ที่แถบขวาบนของ Chrome เพื่อดูสถานะ "Authenticated (Ready to test)" ได้
3. **การรับงานและเริ่มทดสอบ:**
   - Tester กดรับงานจาก Job Board
   - Tester เปิดแท็บใหม่แล้วพิมพ์เข้าเว็บเป้าหมาย (Target URL) ที่ Owner สั่งไว้ (เช่น `https://example.com`)
4. **ทำภารกิจผ่าน Overlay:**
   - ทันทีที่เข้าเว็บเป้าหมาย **Chrome Extension จะทำงานอัตโนมัติ!**
   - Extension จะหลบหลีกระบบป้องกันของเว็บ (ปลด Security Headers ด้วย `declarativeNetRequest`)
   - จะมี **กล่องข้อความภารกิจ (Overlay UI)** โผล่ขึ้นมาที่มุมขวาล่างของหน้าจอ
   - Tester อ่านคำสั่งในกล่องนั้น (เช่น "หาสินค้า A"), ทดลองใช้งานจริงบนเว็บนั้น และเมื่อสำเร็จก็กดปุ่ม **"Complete Task"** บนกล่องนั้น
5. **จบงาน:**
   - Extension จะส่งผลลัพธ์ผ่าน API กลับเข้าเซิร์ฟเวอร์ (Docker container ของคุณ) และเงินจะถูกส่งให้ Tester!
