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
3. รอสักครู่ (ระบบกำลังติดตั้ง package, ทำ Database Migration อัตโนมัติ, และรันเซิร์ฟเวอร์)
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
5. จะเห็น "Usability Testing MVP" ปรากฏขึ้นในหน้ารายการ Extension คัดลอก Extension ID ของคุณ (เช่น `abc123xyz...`) ไปใส่แทนที่ใน `apps/web/src/app/tester/page.tsx` ที่บรรทัด `const extensionId = '...';` หากยังไม่ได้ทำ

---

## 🎮 คู่มือการทดสอบระบบ (End-to-End Manual Test)

เพื่อให้แน่ใจว่าทั้ง Flow ทำงานได้จริง โปรดทำตามขั้นตอนนี้:

### 1. สมัครสมาชิก Owner (ผู้สร้างงาน)
1. เปิดหน้าจอเบราว์เซอร์โหมดไม่ระบุตัวตน (Incognito) ใหม่ ไปที่ [http://localhost:3000](http://localhost:3000)
2. กรอก Email: `owner@example.com`, Password: `password123`, เลือกระบบ Role: **Owner** และกด **Register**
3. ระบบจะพาไปที่ **Owner Dashboard**
4. ในช่อง "Create New Campaign" ใส่ **Target URL** เป็น `https://example.com`
5. ใส่ **Tasks** ข้อที่ 1 เป็น "หาหน้า About", ข้อ 2 (กด + Add another task) เป็น "เลื่อนลงมาด้านล่าง"
6. กด **Create Campaign** คุณจะเห็นงานใหม่โผล่ขึ้นใน "My Campaigns" สถานะคือ "AVAILABLE"

### 2. สมัครสมาชิก Tester (ผู้ทดสอบ)
1. เปิดเบราว์เซอร์ **Google Chrome (หน้าต่างปกติที่ติดตั้ง Extension ไว้แล้ว)** ไปที่ [http://localhost:3000](http://localhost:3000)
2. กรอก Email: `tester@example.com`, Password: `password123`, เลือกระบบ Role: **Tester** และกด **Register**
3. ระบบจะพาไปที่ **Tester Dashboard**
4. **Auth Sync:** กดปุ่ม **"Sync Auth to Chrome Extension"** ให้สังเกตข้อความแจ้งเตือนว่าทำสำเร็จ และเมื่อคลิกไอคอน Extension ขวาบน จะต้องขึ้นว่า Token length: ...
5. เลื่อนลงมาที่ "Available Jobs" คุณจะเห็นงานของ Owner เมื่อครู่นี้ ให้กดปุ่ม **"Claim Job"** งานจะย้ายไปที่ My Claimed Jobs ทันที

### 3. ทำงานผ่าน Extension
1. เมื่อรับงานแล้ว ให้เปิดแท็บใหม่และเข้าไปที่ Target URL นั้น (เช่น `https://example.com`)
2. รอ 1 วินาที **กล่องภารกิจ (Overlay UI) จะปรากฏขึ้นมุมขวาล่าง**
3. กล่องจะแสดงคำสั่ง `Task 1: หาหน้า About`
4. ให้คุณทดลองใช้งานเว็บไซต์ จากนั้นพิมพ์ข้อมูลลงในกล่อง เช่น "หาง่ายมาก อยู่บนสุด" แล้วกด **Next Task**
5. กล่องจะแสดงคำสั่ง Task 2 ให้พิมพ์ข้อมูลทดสอบลงไปแล้วกด **Submit Test**
6. กล่องจะเปลี่ยนเป็นสีเขียวแจ้งเตือนว่า **Test Submitted Successfully!**

### 4. Owner ตรวจงานและอนุมัติ
1. กลับไปที่เบราว์เซอร์ของ Owner
2. กด Refresh (หรือหากหน้า Dashboard ดึงข้อมูลใหม่) คุณจะเห็นใน "My Campaigns" ว่าสถานะเปลี่ยนจาก CLAIMED เป็น **SUBMITTED** แล้ว
3. จะมีปุ่ม **Approve** และ **Reject** ปรากฏขึ้น ให้ลองกด **Approve** เพื่อจบกระบวนการการทำงาน!