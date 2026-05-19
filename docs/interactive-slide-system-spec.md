# Interactive Slide Lesson System Spec

เป้าหมายคือสร้างสื่อสอนแบบ interactive HTML slide สำหรับรายวิชา SMA2106 โดยอิงหนังสือ/แผน 12 สัปดาห์ แต่ใช้จุดเด่นของเว็บให้เต็มกว่า slide ปกติ

หลักสำคัญ: **ขาดได้ แต่อย่าเกิน 4 ชั่วโมง**  
ดังนั้นแต่ละคาบควรออกแบบไว้ประมาณ 220-230 นาที และเหลือ buffer 10-20 นาทีเสมอ

## รูปแบบสื่อที่ต้องการ

ไม่ใช่หน้าอ่านเนื้อหายาว แต่เป็น slide lesson ที่อาจารย์ใช้เปิดสอนในห้องได้จริง:

- มี slide-by-slide flow
- มีเวลาแนะนำต่อ slide/กิจกรรม
- มีปุ่ม Next/Back และแถบ progress
- มีโหมด Projector สำหรับเปิดหน้าห้อง
- มี interaction ที่นักศึกษาทำร่วมกันได้
- มีช่วงเล่นบอร์ดเกมจริงเป็นแกนกลาง
- มี debrief หลังเล่นเพื่อโยงกลับทฤษฎีจากหนังสือ
- มี activity/worksheet/exit ticket พร้อมใช้

## Timebox มาตรฐาน 4 ชั่วโมง

ใช้โครงนี้เป็น default สำหรับทุกสัปดาห์:

| ช่วง | เวลา | เป้าหมาย |
|---|---:|---|
| Opening hook | 10 นาที | โยนสถานการณ์/คำถามให้คิดก่อนสอน |
| Learn-to-play quick guide | 20 นาที | สอนเล่นเกมแบบเร็ว ไม่อ่าน rulebook |
| Guided first round | 25 นาที | เล่นรอบแรกแบบอาจารย์ช่วยชี้ decision |
| Concept mini lesson | 25 นาที | สรุปทฤษฎีจากหนังสือเฉพาะที่จำเป็น |
| Interactive concept activity | 25 นาที | ใช้เว็บให้ผู้เรียนจัดกลุ่ม ลาก วาง จำลอง หรือเลือกคำตอบ |
| Main play session | 90 นาที | เล่นบอร์ดเกมจริง หรือ scenario play |
| Debrief + framework mapping | 35 นาที | ดึงประสบการณ์จากเกมมาเข้ากรอบคิด |
| Worksheet / group output | 15 นาที | สร้าง artifact สั้นๆ จากการเล่น |
| Exit ticket | 5 นาที | สรุปสิ่งที่เข้าใจ/ยังสงสัย |
| Buffer | 10 นาที | กันเวลา setup, เปลี่ยนกลุ่ม, อธิบายซ้ำ |

รวม 260 นาทีถ้านับทุกอย่างเต็ม จึงต้องตั้งระบบให้แต่ละ slide/activity มี `required` หรือ `optional` และมีปุ่ม `Skip optional` เพื่อบีบให้จบไม่เกิน 240 นาที

Target runtime จริงควรอยู่ที่:

```text
Required path: 220-230 นาที
Optional enrichment: 20-30 นาที
Hard stop: 240 นาที
```

## Slide Types

ทุกสัปดาห์ควรประกอบด้วย slide types เหล่านี้:

1. `hook`
   - คำถามเปิดคาบ
   - โหวต/เลือก stance ได้
   - ใช้เวลาสั้น ไม่เกิน 10 นาที

2. `learn_to_play`
   - Goal
   - Turn loop
   - First 3 decisions
   - Do not worry yet
   - Play now prompt

3. `guided_play`
   - อธิบายรอบแรกเป็น step
   - มี prompt ให้หยุดถามก่อนตัดสินใจ
   - ใช้กับ projector ได้

4. `concept`
   - เนื้อหาจากหนังสือแบบย่อย
   - ไม่เกิน 3-5 bullets ต่อ slide
   - ต้องโยงกับเกมที่กำลังเล่น

5. `interactive_activity`
   - sorter, simulator, timeline, map, matrix, graph, slider, voting, canvas
   - ต้องมี feedback ทันที
   - ไม่ใช่ quiz อย่างเดียว

6. `play_lab`
   - ช่วงเล่นเกมจริง
   - มี timer
   - มี observation prompts
   - มี pause cards สำหรับอาจารย์แทรกคำถาม

7. `debrief`
   - ให้ผู้เรียนเล่าการตัดสินใจจริงจากเกม
   - map เข้ากรอบคิดในหนังสือ
   - เทียบหลายกลุ่มได้

8. `worksheet`
   - output ที่ใช้ส่ง/อภิปรายได้
   - ควรสั้นและเกิดจากการเล่นจริง

9. `exit_ticket`
   - 1 คำถามสำคัญ
   - ใช้ปิดคาบภายใน 5 นาที

## Interaction Patterns ที่ควรใช้ให้เต็ม

ให้ใช้ interaction เพื่อทำสิ่งที่ slide ธรรมดาทำไม่ได้:

- Drag/drop card sorter
- Build-your-own decision canvas
- Timeline ที่สะสม consequence ให้เห็น
- Probability simulator
- Payoff matrix builder
- Network/coalition map
- Territory/board heatmap
- Timer + checkpoint prompts ระหว่าง play session
- Reveal step-by-step สำหรับ learn-to-play
- Projector mode ที่ซ่อนคำตอบก่อนเฉลย
- Instructor controls: reset, reveal, skip optional, hard-stop timer

## Week 1 Slide Lesson Target

Week 1 ต้องเป็นแม่แบบของทั้งระบบ:

หัวข้อ: บทนำสู่การคิดเชิงกลยุทธ์  
เกม: Splendor + Chess puzzle  
แกนทฤษฎี: strategy, tactics, decision structure, compound advantage

Required slide flow:

1. Hook: ถามว่า move ที่ดีคือ move ที่ชนะตอนนี้ หรือ move ที่ทำให้ตาถัดไปดีขึ้น
2. Learn-to-play: Splendor in 12 minutes
3. Guided first round: อาจารย์พาเล่น 4-6 รอบแรก
4. Concept: Strategy vs Tactics
5. Interactive: Strategy vs Tactics sorter
6. Concept: Decision structure
7. Interactive: Decision canvas
8. Play lab: Splendor short game / table demo
9. Interactive: Engine-building timeline
10. Chess puzzle prompt: tactic หรือ strategy
11. Debrief: decision ไหนทำให้เกิด compound advantage
12. Worksheet: Game Observation Worksheet แบบย่อ
13. Exit ticket: Strategic Move Reflection

## Data Model ที่ควรใช้บน Mac

แนะนำให้ใช้ static TypeScript data ก่อน ไม่ต้องมี backend:

```ts
type Slide = {
  id: string;
  week: number;
  type:
    | "hook"
    | "learn_to_play"
    | "guided_play"
    | "concept"
    | "interactive_activity"
    | "play_lab"
    | "debrief"
    | "worksheet"
    | "exit_ticket";
  title: string;
  minutes: number;
  required: boolean;
  content: unknown;
};
```

ระบบควรคำนวณ:

- เวลารวมของ required slides
- เวลารวมถ้ารวม optional
- warning ถ้า required path เกิน 230 นาที
- hard warning ถ้า total path เกิน 240 นาที

## Acceptance Criteria

Week 1 จะถือว่าใช้ได้เมื่อ:

- เปิด `/materials/week/1` แล้วเข้า slide mode ได้ทันทีโดยไม่ต้อง login
- มีปุ่ม Next/Back
- มี progress และเวลารวมที่เหลือ
- มีอย่างน้อย 4 interactive moments
- มี play lab timer 90 นาที
- มี optional slides ที่ skip ได้
- required path ไม่เกิน 230 นาที
- total path ไม่เกิน 240 นาที
- ใช้บน projector 1366x768 ได้โดยข้อความไม่ล้น
- ใช้บน mobile ได้อย่างน้อยสำหรับนักศึกษาอ่านตาม/ทำ activity
- `npm run lint` และ `npm run build` ผ่าน

