# Weekly Modules Reference

โฟลเดอร์นี้เป็นแผนคัดแยกสื่อรายสัปดาห์จาก LaTeX source ตัวจริงของหนังสือ เพื่อใช้เป็นฐานสร้าง interactive HTML ในระบบรายวิชา

## Source หลัก

- `../bookref/เอกสารประกอบวิชาบอร์ดเกม/latex_source/main.tex`
- `../bookref/เอกสารประกอบวิชาบอร์ดเกม/latex_source/chapters/ch01.tex` ถึง `ch12.tex`
- `../bookref/เอกสารประกอบวิชาบอร์ดเกม/latex_source/chapters/appendix_a.tex`
- `../bookref/เอกสารประกอบวิชาบอร์ดเกม/latex_source/chapters/appendix_b.tex`
- `../bookref/เอกสารประกอบวิชาบอร์ดเกม/latex_source/backmatter/solutions.tex`

## ไฟล์ที่ใช้ต่อยอด

- `course-map.json` เป็นข้อมูลรายสัปดาห์แบบ structured data
- ออกแบบมาให้ import เข้าเว็บแล้ว generate หน้า interactive HTML ได้

## แนวคิดการใช้กับ interactive HTML

แต่ละ week มี fields สำคัญ:

- `chapter` และ `sourceFiles`: ชี้กลับไปยังต้นฉบับ
- `learningOutcomes`: ใช้ทำหน้า objectives
- `coreConcepts`: ใช้ทำ concept cards หรือ interactive glossary
- `games`: ใช้ทำ play session plan
- `playFirstFlow`: ใช้ทำ activity timeline
- `interactiveHtmlIdeas`: ใช้เป็น backlog สำหรับ component interactive
- `worksheet`: ใช้สร้าง assignment/form ในระบบ
- `submission`: ใช้ตั้งค่างานส่ง

หลักการออกแบบ: ให้ผู้เรียนเล่นจริงก่อน แล้วใช้ interactive HTML เป็นตัวช่วยสังเกต คิด วิเคราะห์ และสะท้อนผล ไม่ใช่แทนการเล่นเกมบนโต๊ะ
