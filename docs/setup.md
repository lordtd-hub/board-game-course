# Board Game Course MVP Setup

ระบบนี้ใช้ Google เป็น backend หลัก:

- Google OAuth สำหรับ login ผู้ใช้
- Google Sheet เป็นฐานข้อมูลรายเทอม
- Google Drive เป็นที่เก็บไฟล์งาน

## 1. เตรียมบัญชี Google

ใช้บัญชี `sittichoke.son@sru.ac.th` เป็นเจ้าของ Google Sheet, Drive folder และ Google Cloud project ถ้านโยบาย SRU อนุญาต

ถ้า SRU จำกัดการสร้าง project/API ให้ใช้ `lordtd@gmail.com` ถือ Google Cloud project แทน แต่ยังตั้งค่าให้ผู้ใช้ login ด้วยอีเมล SRU เท่านั้น

## 2. สร้าง Google Sheet และ Drive Folder

1. สร้าง Google Sheet ว่างสำหรับรายวิชา เช่น `SMA2106 Board Game Course 2569-1`
2. copy `spreadsheetId` จาก URL
3. สร้าง Drive folder หลัก เช่น `SMA2106 Submissions 2569-1`
4. copy `folderId` จาก URL

## 3. สร้าง Service Account

1. ไปที่ Google Cloud Console
2. เปิด Google Sheets API และ Google Drive API
3. สร้าง Service Account
4. สร้าง JSON key แล้วนำ `client_email` และ `private_key` มาใส่ใน `.env`
5. Share Google Sheet และ Drive folder ให้ service account email เป็น Editor

## 4. ตั้งค่า OAuth Client

1. สร้าง OAuth consent screen แบบ Internal ถ้าใช้ได้ในองค์กร หรือ External ถ้าจำเป็น
2. สร้าง OAuth Client ID ชนิด Web application
3. เพิ่ม Authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

สำหรับ production ให้เพิ่ม:

```text
https://your-domain.example/api/auth/callback/google
```

## 5. ตั้งค่า Environment

สร้าง `.env` จาก `.env.example`

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=สุ่มข้อความยาวๆ
ALLOWED_EMAIL_DOMAINS=sru.ac.th,student.sru.ac.th
BOOTSTRAP_SUPER_ADMIN_EMAIL=sittichoke.son@sru.ac.th
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...
GOOGLE_DRIVE_ROOT_FOLDER_ID=...
```

## 6. ติดตั้งและ init Sheet

```bash
npm install
npm run sheets:init
npm run dev
```

เปิด `http://localhost:3000`

## 7. วิธีเริ่มใช้งานครั้งแรก

1. login ด้วย `sittichoke.son@sru.ac.th`
2. ระบบจะสร้าง user แรกเป็น `super_admin` ตาม `BOOTSTRAP_SUPER_ADMIN_EMAIL`
3. ไปหน้า Admin
4. เพิ่ม 3 section
5. เพิ่ม/เปลี่ยน role อาจารย์เป็น `instructor`
6. ผูก instructor email กับ section
7. ให้นักศึกษา join ด้วย enrollment code หรือให้อาจารย์เพิ่มรายชื่อเอง

## 8. การจบเทอม

1. Export Google Sheet เป็น Excel/CSV เก็บไว้
2. ย้าย Drive folder ของเทอมนั้นไปโฟลเดอร์ archive
3. สร้าง Sheet/Drive folder ใหม่สำหรับเทอมถัดไป
4. เปลี่ยน `GOOGLE_SHEET_ID` และ `GOOGLE_DRIVE_ROOT_FOLDER_ID`
5. รัน `npm run sheets:init` อีกครั้ง

## 9. Interactive Materials

ระบบมีสื่อการสอนในเว็บที่ `/materials` และหน้า preview สำหรับอาจารย์ที่ `/instructor/materials`

- เนื้อหาที่เว็บ import ใช้อยู่ใน `lib/materials/course-map.ts`
- ไฟล์ใน `learning-materials/weekly-modules/course-map.json` ยังเป็น source/reference สำหรับวางแผนรายสัปดาห์
- Week 1 ทำเป็น interactive lesson เต็มระบบ ส่วน Week 2-12 เป็น outline พร้อม activity ideas
- การส่ง exit ticket จะบันทึกในแท็บ `material_progress`

ถ้า Sheet เดิมถูกสร้างก่อนมีระบบ materials ให้รัน:

```bash
npm run sheets:init
```

คำสั่งนี้จะเพิ่มแท็บ `material_progress` และหัวคอลัมน์โดยไม่ลบข้อมูลแท็บเดิม
