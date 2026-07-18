# SMA2106 Week 1–2 Mobile Exam — คู่มือวันสอบ

หน้าสอบไม่มีลิงก์จาก Hub หรือเมนูนักศึกษา อาจารย์เป็นผู้แจก URL และรหัสห้องเอง

## ตั้งค่าครั้งเดียว

1. กำหนด `EXAM_SECRET` และการเชื่อมต่อ Google Sheet/Service Account บนระบบ deploy
2. เลือก PIN ผู้ควบคุม 8–12 หลักที่ไม่ซ้ำกับรหัสห้อง แล้วสร้าง hash ด้วยคำสั่งด้านล่าง จากนั้นใส่ผลใน Vercel Environment ชื่อ `EXAM_CONTROL_PIN_HASH`

```powershell
node -e "console.log(require('crypto').createHash('sha256').update('YOUR-CONTROL-PIN').digest('hex'))"
```

3. หลังอัปเดตระบบครั้งแรก ให้รัน `npm.cmd run sheets:init` หนึ่งครั้ง ระบบจะเพิ่มแท็บ `exam_config`, `exam_results` และ `exam_events` โดยไม่ลบข้อมูลเดิม
4. ตรวจว่า Section ที่ต้องใช้มีสถานะ `active` ในแท็บ `sections`

ใช้ Google Sheet เดียวสำหรับทุกห้อง แล้วแยกผลด้วย `sectionId`:

- `SEC-1` — เรียนวันอังคาร ช่วงเช้า
- `SEC-2` — เรียนวันอังคาร ช่วงบ่าย
- `SEC-3` — เรียนวันพุธ ช่วงบ่าย

นักศึกษาจะเห็นเฉพาะชื่อกลุ่มเรียนภาษาไทย ส่วนรหัส `SEC-*` ใช้สำหรับกรองข้อมูลใน Sheet

หลังจากตั้งค่าครั้งแรกแล้ว วันสอบไม่ต้องแก้ environment และไม่ต้อง deploy ใหม่

## ขั้นตอนก่อนสอบ

1. เข้า `/instructor/exam-control` โดยไม่ต้อง Sign in
2. ใส่ PIN ผู้ควบคุม ระบบจะจำเครื่องนี้ไว้ 8 ชั่วโมง
3. กรอกรหัสห้องนักศึกษา 6 หลัก
4. เลือกระยะเปิดรับนักศึกษาใหม่ 30, 60, 90 หรือ 120 นาที แล้วกด **เปิดรับเข้าสอบตอนนี้**
5. กด **คัดลอกลิงก์** เพื่อส่งผ่าน LINE, Google Classroom หรือทำ QR
6. แจ้งรหัสห้องแยกจากลิงก์เมื่อทุกคนอยู่ในห้องสอบแล้ว

ระยะเปิดรับเข้าจะนับจากเวลาที่กดเปิดห้อง และเป็นเพียงช่วงที่นักศึกษาเริ่มสอบใหม่ได้ ผู้ที่เริ่มแล้วจะมีเวลาทำข้อสอบครบ 60 นาทีจากเวลาเริ่มของตนเอง

หากต้องหยุดรับคนใหม่ก่อนเวลา ให้กด **ปิดรับเข้าสอบทันที** การปิดรับเข้าไม่ตัดข้อสอบของผู้ที่เริ่มไปแล้ว

## Checklist ผู้คุมสอบ

- ตรวจบัตรนักศึกษาและ Section ก่อนเริ่ม
- ให้นักศึกษาเปิด Do Not Disturb ปิด auto-lock และปิดแอปอื่น
- ย้ำว่าการออกจากหน้าสอบครั้งแรกเป็นคำเตือน ครั้งที่สองถูกตัดสิทธิ์และได้ 0 โดยไม่มี override
- ตรวจว่าทุกคนเห็นเลขรับผลก่อนออกจากห้อง

## ทดสอบระบบก่อนวันสอบ

```powershell
npm.cmd run build
npx.cmd tsx tools\validate-exam-question-bank.ts
node tools\smoke-test-exam.mjs http://localhost:3000
```

การทดสอบ Production ให้ใช้รหัสห้องทดสอบและข้อมูลที่ขึ้นต้น `TEST-` เท่านั้น โดยแยกรอบเพื่อไม่ให้ชน Google Sheets quota:

```powershell
$env:EXAM_CONTROL_PIN='<PIN ผู้ควบคุม>'
$env:EXAM_TEST_ROOM_CODE='<รหัสห้องทดสอบ 6 หลัก>'
$env:SMOKE_MODE='basic'
node tools\smoke-test-exam.mjs https://board-game-course.vercel.app

$env:SMOKE_MODE='open'
node tools\smoke-test-exam.mjs https://board-game-course.vercel.app
Remove-Item Env:EXAM_CONTROL_PIN

$env:SMOKE_MODE='load'
node tools\smoke-test-exam.mjs https://board-game-course.vercel.app

$env:SMOKE_MODE='events'
node tools\smoke-test-exam.mjs https://board-game-course.vercel.app

$env:EXAM_CONTROL_PIN='<PIN ผู้ควบคุม>'
$env:SMOKE_MODE='close'
node tools\smoke-test-exam.mjs https://board-game-course.vercel.app
```

หลังทดสอบต้องตรวจจำนวนแถวใน `exam_results`/`exam_events`, ลบเฉพาะแถวที่ `studentId` ขึ้นต้น `TEST-` และคง `exam_config` เป็น `closed`

ทดสอบอย่างน้อยหนึ่งเครื่องบน Chrome Android และ Safari iPhone โดยใช้รหัสนักศึกษาทดสอบที่ไม่ซ้ำกับผู้เข้าสอบจริง

## หลังสอบ

- เปิด Google Sheet ที่แท็บ `สรุปผลสอบ` เพื่อดูรหัสนักศึกษา ชื่อ กลุ่มเรียน คะแนน สถานะ จำนวนครั้งที่ออกจากหน้าสอบ เลขรับผล และเวลาส่งในตารางภาษาไทย
- แท็บข้อมูลดิบถูกซ่อนไว้เพื่อลดความสับสน ระบบยังอ่านและเขียนข้อมูลได้ตามปกติ
- `exam_results` เป็นผลหลัก: `submitted` คือส่งปกติ และ `disqualified` คือถูกตัดสิทธิ์
- `exam_events` เก็บเหตุการณ์ออกจากหน้าสอบ
- นักศึกษาไม่เห็นคะแนนหรือเฉลยจากหน้าสอบ
- เอกสารตรวจทานส่วนตัวอยู่ที่ `output/pdf/sma2106-week1-2-exam-review.pdf` และไม่ถูก deploy
