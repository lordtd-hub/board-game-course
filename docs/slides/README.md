# SMA2106 Interactive Slide Template

ไฟล์ต้นแบบสำหรับทำสไลด์ interactive ของทั้งรายวิชาอยู่ที่:

- `docs/slides/course-slide-template.html`

แนวทางใช้งาน:

1. คัดลอกไฟล์ template ไปเป็น `docs/slides/weekN/index.html`
2. ปรับ `slides` ในส่วน JavaScript ให้เป็นเนื้อหาของสัปดาห์นั้น
3. คงโครงหลักไว้ ได้แก่ progress bar, slide meta, fullscreen, speaker notes, keyboard navigation, และ interaction pattern
4. สไลด์ทุกสัปดาห์ควรจบภายใน 4 ชั่วโมง โดยมีช่วงเล่นบอร์ดเกมจริงเป็นแกนกลาง
5. ก่อนนำไปใช้ ให้เปิดดูที่ viewport 1920x1080 และมือถือ เพื่อตรวจว่าไม่มีข้อความล้นหรือทับกัน

หลักการออกแบบ:

- หน้าจอต้องรู้สึกเป็นสไลด์นำเสนอ ไม่ใช่หน้าเว็บในกรอบ
- ใช้ข้อความน้อย แต่มี speaker notes ช่วยอาจารย์พูด
- Interaction ต้องช่วยให้ผู้เรียนตัดสินใจ เล่น ทดลอง หรือสะท้อนคิด
- เนื้อหาทฤษฎีต้องตามหลังประสบการณ์เล่นจริงเท่าที่ทำได้
