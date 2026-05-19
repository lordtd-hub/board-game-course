# Board Game Course

เว็บแอป MVP สำหรับรายวิชา SMA2106 กลยุทธ์และการคิดเชิงวิเคราะห์ผ่านบอร์ดเกม

## Stack

- Next.js App Router
- Google OAuth domain guard สำหรับอีเมล SRU
- Google Sheet เป็นฐานข้อมูลรายเทอม
- Google Drive เป็น storage สำหรับไฟล์ส่งงาน

## Quick Start

```bash
npm install
cp .env.example .env
npm run sheets:init
npm run dev
```

อ่านขั้นตอนตั้งค่า Google ที่ [docs/setup.md](docs/setup.md)

## Roles

- `super_admin`: เห็นทุก section และจัดการ role/section/enrollment
- `instructor`: เห็น section ที่รับผิดชอบ สร้างงาน ตรวจงาน ให้ feedback
- `student`: เข้า section ส่งงาน และดูคะแนนของตัวเอง

## Notes

โฟลเดอร์ `learning-materials` เป็นพื้นที่แยกสำหรับหนังสือ อ้างอิง และสื่อการเรียน ระบบ MVP รอบนี้ยังไม่ใส่เนื้อหารายสัปดาห์จริงตามแผน
