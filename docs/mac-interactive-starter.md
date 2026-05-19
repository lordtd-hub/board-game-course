# Mac Interactive Materials Starter

เอกสารนี้ใช้สำหรับย้ายงานไปทำบน Mac โดยโฟกัสเฉพาะ interactive HTML / teaching materials ไม่ต้องขนระบบ LMS เต็ม, Google OAuth, Google Sheet และ Google Drive ไปด้วย

## แนวทางที่แนะนำ

ให้สร้าง repo ใหม่บน Mac ชื่อประมาณ `boardgame-interactive` แล้วคัดเฉพาะส่วนที่จำเป็นจากโปรเจกต์นี้ไปใช้

### ไฟล์/โฟลเดอร์ที่ควรเอาไป

```text
app/layout.tsx
app/page.tsx
app/globals.css
app/materials/
components/materials/
components/app-shell.tsx
components/metric-card.tsx
components/table.tsx
lib/materials/
lib/types.ts
lib/utils.ts
package.json
package-lock.json
tsconfig.json
next.config.ts
next-env.d.ts
eslint.config.mjs
docs/mac-interactive-starter.md
```

ถ้าต้องการอ้างอิง course map เดิม ให้เอาไปด้วย:

```text
learning-materials/weekly-modules/
```

### ไฟล์/โฟลเดอร์ที่ไม่ควรเอาไป

```text
node_modules/
.next/
.env
app/api/auth/
app/admin/
app/instructor/
app/student/
app/assignments/
app/grades/
lib/google.ts
lib/oauth.ts
lib/sheets.ts
lib/drive.ts
lib/repository.ts
lib/actions.ts
scripts/init-google-sheet.ts
learning-materials/bookref/
```

เหตุผล: ชุดนี้เป็นระบบ LMS/Google backend หรือไฟล์หนังสือต้นฉบับ ซึ่งไม่จำเป็นสำหรับการทำ interactive HTML บน Mac

## คำสั่งเริ่มบน Mac

```bash
mkdir boardgame-interactive
cd boardgame-interactive
git init
```

หลังคัดไฟล์เข้า repo แล้ว:

```bash
npm install
npm run dev
```

เปิด:

```text
http://localhost:3000/materials/week/1
```

ถ้าจะ deploy เป็นเว็บ static/preview ค่อยปรับทีหลัง หลังจากตัด dependency ฝั่ง auth/backend ออกหมดแล้ว

## Git Checklist

ก่อน commit:

```bash
npm run lint
npm run build
git status
git add .
git commit -m "Set up board game interactive materials"
```

ไม่ควร commit:

- `node_modules`
- `.next`
- `.env`
- ไฟล์ PDF/LaTeX build ขนาดใหญ่
- archive หรือ backup ของหนังสือทั้งชุด

## Prompt สำหรับ Codex บน Mac

ใช้ prompt นี้ตอนเปิดโปรเจกต์บน Mac:

```text
เรากำลังทำโปรเจกต์ boardgame-interactive เป็น Next.js app สำหรับสื่อการสอน interactive HTML รายวิชา SMA2106 กลยุทธ์และการคิดเชิงวิเคราะห์ผ่านบอร์ดเกม

เป้าหมายตอนนี้:
- ทำเฉพาะระบบ interactive slide lessons ไม่ทำ LMS เต็ม
- ไม่มี Google OAuth, Google Sheet, Google Drive, assignment submission หรือ grading
- เริ่มจาก Week 1 ให้สมบูรณ์ แล้วค่อยขยาย Week 2-12
- สื่อควรเป็นภาษาไทย เล่นก่อน ทฤษฎีตามหลัง และใช้ในห้องเรียนได้จริงบน projector/mobile
- รูปแบบต้องเป็นสไลด์สอน ไม่ใช่หน้าอ่านยาว
- ทุกคาบต้องคุมเวลาไม่เกิน 4 ชั่วโมง ขาดได้แต่อย่าเกิน

โครงที่มี:
- app/materials/page.tsx แสดงรายการ 12 สัปดาห์
- app/materials/week/[week]/page.tsx แสดง lesson รายสัปดาห์
- components/materials/ มี lesson components
- lib/materials/course-map.ts เก็บข้อมูล 12 สัปดาห์
- Week 1 มี interactive activities: Strategy vs Tactics sorter, Decision structure canvas, Splendor engine-building timeline, Chess prompt
- docs/interactive-slide-system-spec.md คือ spec หลักของระบบสไลด์

สิ่งที่อยากให้ทำก่อน:
1. ตรวจว่าโปรเจกต์รันบน Mac ได้ด้วย npm install และ npm run dev
2. ตัด dependency หรือ import ที่ยังผูกกับระบบ LMS/Google backend ออก
3. ทำให้ /materials/week/1 เปิดได้ทันทีโดยไม่ต้อง login
4. เปลี่ยน Week 1 ให้เป็น interactive slide lesson ตาม docs/interactive-slide-system-spec.md
5. เพิ่ม slide controls: Next, Back, progress, elapsed/remaining time, skip optional
6. Week 1 ต้องมีอย่างน้อย 4 interactive moments และ play lab timer
7. รัน npm run lint และ npm run build ให้ผ่าน

ข้อจำกัด:
- อย่าเพิ่ม backend ถ้าไม่จำเป็น
- อย่าเพิ่ม dependency หนัก
- อย่า commit node_modules, .next, .env หรือไฟล์หนังสือ/LaTeX archive ขนาดใหญ่
- ถ้าต้องเพิ่มข้อมูลเนื้อหา ให้เพิ่มใน lib/materials/course-map.ts ก่อน
- เวลารวม required path ควรอยู่ 220-230 นาที และ total path ห้ามเกิน 240 นาที
```

## Prompt สำหรับขยาย Week 2

```text
ต่อจาก Week 1 ให้สร้าง interactive lesson สำหรับ Week 2: Information Structure in Games โดยยังคงแนวทาง play-first

ต้องมี:
- Teach-to-play card สำหรับ Love Letter และ Avalon
- Information map: ใครรู้อะไร / ใครไม่รู้อะไร
- Love Letter belief tracker แบบง่าย
- Avalon screening simulator แบบ classroom-safe ไม่ต้อง implement rules ทั้งเกม
- Exit/reflection prompt ภาษาไทย

ให้ใช้ component pattern เดิมจาก Week 1 และอย่าเพิ่ม backend
```
