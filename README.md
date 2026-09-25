# แพลตฟอร์มทดสอบการใช้งานเว็บไซต์ (Usability Testing Platform MVP)

ยินดีต้อนรับสู่ MVP ของแพลตฟอร์มทดสอบการใช้งานเว็บไซต์! โปรเจกต์นี้ถูกสร้างขึ้นในรูปแบบ monorepo เพื่ออำนวยความสะดวกในการทดสอบการใช้งานระหว่าง เจ้าของเว็บไซต์ (Website Owners) และ ผู้ทดสอบ (Testers) ผ่าน Web Application และ Chrome Extension

## 🏗️ โครงสร้างระบบ (Architecture)

Repository นี้ใช้ **pnpm workspaces** และ **Turborepo** ในการจัดการโปรเจกต์ย่อย:

- **`apps/web`**: ส่วน Frontend หลักสำหรับผู้ใช้งาน พัฒนาด้วย **Next.js (App Router)** และ **Tailwind CSS** เป็น Dashboard สำหรับทั้ง Owner และ Tester
- **`apps/api`**: ส่วน Backend Server พัฒนาด้วย **Express**, **TypeScript**, และ **Prisma ORM** (PostgreSQL) จัดการระบบ Authentication, ฐานข้อมูล, และ Business logic
- **`apps/extension`**: **Chrome Extension (Manifest V3)** สำหรับ Tester พัฒนาด้วย TypeScript และ Webpack ทำหน้าที่แสดงผล UI ทับซ้อน (Overlay) แนะนำงานบนเว็บไซต์เป้าหมาย และจัดการข้ามข้อจำกัดของ Security Headers
- **`packages/shared`**: Library กลางที่รวบรวม TypeScript types, DTOs, และ enums ที่ใช้งานร่วมกันระหว่าง web, api, และ extension

---

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

### สิ่งที่ต้องมีเบื้องต้น
- [Node.js](https://nodejs.org/) (แนะนำ v18 ขึ้นไป)
- [pnpm](https://pnpm.io/) (v8 ขึ้นไป)
- [PostgreSQL](https://www.postgresql.org/) (รันในเครื่องหรือผ่าน Docker)

### 1. การติดตั้ง (Installation)

Clone repository และติดตั้ง dependencies จากโฟลเดอร์หลัก:

```bash
pnpm install
```

### 2. การตั้งค่าฐานข้อมูล (Database Setup)

1. สร้างไฟล์ `.env` ใน `apps/api` และกำหนด PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/usability_db?schema=public"
   ```
2. ดัน Prisma schema เข้าสู่ฐานข้อมูลเพื่อสร้างตารางต่างๆ:
   ```bash
   cd apps/api
   pnpm run db:push
   ```
3. สร้าง Prisma Client (ปกติจะทำงานอัตโนมัติในขั้นตอน install แต่ทำเผื่อไว้เพื่อความแน่ใจ):
   ```bash
   pnpm run db:generate
   ```

### 3. การรันเซิร์ฟเวอร์สำหรับพัฒนา (Running the Development Servers)

คุณสามารถเริ่มการทำงานของ web และ api servers พร้อมกันจากโฟลเดอร์หลักโดยใช้ Turbo:

```bash
pnpm run dev
```

คำสั่งนี้จะรัน:
- **Web App**: http://localhost:3000
- **API Server**: (รันผ่าน ts-node บนพอร์ตที่กำหนดในโค้ด API หรือ `.env`)

### 4. การ Build และติดตั้ง Chrome Extension

คุณต้อง build Chrome Extension ก่อนที่จะสามารถโหลดเข้าเบราว์เซอร์ได้

1. Build extension ใน watch mode (สำหรับการพัฒนา):
   ```bash
   cd apps/extension
   pnpm run dev
   ```
   *หรือหากต้องการ build สำหรับใช้งานจริงครั้งเดียว ให้รัน `pnpm run build`*

2. โหลดเข้าสู่ Google Chrome:
   - เปิด Chrome และไปที่ URL `chrome://extensions/`
   - เปิดการใช้งาน **Developer mode** ที่มุมขวาบน
   - คลิก **Load unpacked**
   - เลือกโฟลเดอร์ `apps/extension/dist`

3. **ข้อควรระวังเรื่อง Auth Sync**: Extension นี้ใช้ `externally_connectable` เพื่อรับ JWT tokens โดยตรงจาก Web App โปรดตรวจสอบให้แน่ใจว่า Web App ของคุณกำลังรันอยู่ที่ `http://localhost:3000` (หรือโดเมน production ที่ระบุไว้ใน `manifest.json` ของ extension) เพื่อให้ระบบ Sync ทำงานได้

---

## 🎨 ภาพรวมของ UX/UI Flow (MVP Preview)

แพลตฟอร์มนี้ออกแบบมาสำหรับ 2 บทบาทหลัก คือ **OWNER** (เจ้าของงาน) และ **TESTER** (ผู้ทดสอบ)

### โฟลว์สำหรับ Owner (The Owner Flow)
1. **Dashboard & Creation:** Owner เข้าสู่ระบบผ่าน Web App และจะพบกับหน้า Dashboard ที่แสดงแคมเปญทดสอบต่างๆ
2. **Create a Test:** Owner สร้างแคมเปญใหม่ โดยระบุข้อมูลดังนี้:
   - Target URL (เว็บไซต์ที่ต้องการทดสอบ)
   - Reward Amount (จำนวนเงินรางวัลสำหรับ Tester)
   - Step-by-step Task Instructions (คำสั่งทีละขั้นตอน เช่น "หาหน้าดูราคาแพ็กเกจ", "หยิบสินค้าลงตะกร้า")
3. **Review:** เมื่อ Tester ทำงานเสร็จ Owner สามารถดูผลการทดสอบ (และในอนาคตจะสามารถดูวิดีโอ/ข้อมูลหน้าจอที่บันทึกไว้ได้) ผ่าน Dashboard เพื่อทำการกด Approve หรือ Reject งานนั้นๆ

### โฟลว์สำหรับ Tester (The Tester Flow)
1. **Job Board:** Tester เข้าสู่ระบบและค้นหางานทดสอบที่เปิดรับใน Job Board
2. **Auth Sync:** ในหน้า Dashboard จะมีสถานะ UI แจ้งว่า Chrome Extension เชื่อมต่ออยู่หรือไม่ หากเชื่อมต่อแล้ว การคลิกปุ่มจะส่ง Authentication Token (JWT) ไปยัง Extension โดยอัตโนมัติอย่างปลอดภัย
3. **Claim & Test:**
   - Tester กดรับงาน (Claim job)
   - ระบบพานำทางไปยัง Target URL
   - **Chrome Extension** ตรวจพบว่ากำลังทำการทดสอบอยู่ และจะทำการปลดล็อค Security Headers (เช่น `X-Frame-Options`) ด้วย `declarativeNetRequest` พร้อมแสดงหน้าต่าง UI แบบลอย (Overlay) บนหน้าเว็บนั้นๆ
4. **Execution:** Tester อ่านคำสั่งในกรอบ UI ที่ลอยอยู่ ทำตามขั้นตอนบนหน้าเว็บนั้น และเมื่อทำเสร็จ ให้กดปุ่ม "Complete Task" ใน Overlay
5. **Submission:** Extension จะส่งผลลัพธ์และคำตอบต่างๆ กลับมายัง API อย่างปลอดภัย

---

## 🛠️ เหตุผลในการเลือก Tech Stack
- **Prisma:** เลือกใช้ Prisma เพื่อความปลอดภัยของ Type ในการ query ข้อมูล
- **Next.js App Router:** เพื่อสร้าง Web Frontend ที่รวดเร็วทันสมัย
- **Express:** เลือกใช้แทน NestJS สำหรับ MVP เพื่อให้โปรเจกต์มีขนาดเล็ก เร็ว และแยกส่วนกับ Web client อย่างชัดเจน
- **Manifest V3:** Extension ใช้โครงสร้างใหม่ล่าสุดของ Chrome Extension เพื่อความเข้ากันได้กับเบราว์เซอร์ยุคใหม่และมาตรฐานความปลอดภัยที่ดีขึ้น