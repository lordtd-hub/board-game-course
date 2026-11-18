import type { MaterialWeek } from "@/lib/materials/types";

const defaultClassFlow = [
  "โจทย์เปิดคาบ 10-15 นาที",
  "อธิบายแนวคิด 25-35 นาที",
  "เล่นบอร์ดเกม 90-120 นาที",
  "อภิปรายหลังเล่น 30-40 นาที",
  "สะท้อนผลท้ายคาบ 5-10 นาที"
];

export const materialWeeks: MaterialWeek[] = [
  {
    week: 1,
    title: "บทนำสู่การคิดเชิงกลยุทธ์",
    englishTitle: "Introduction to Strategic Thinking",
    chapterSource: "chapters/ch01.tex",
    games: ["Chess", "Splendor"],
    learningOutcomes: [
      "แยกกลยุทธ์ออกจากยุทธวิธีได้",
      "ระบุผู้ตัดสินใจ ชุดการกระทำ สภาพแวดล้อม และวัตถุประสงค์ได้",
      "อธิบายข้อมูล ความไม่แน่นอน และปฏิสัมพันธ์ในสถานการณ์เชิงกลยุทธ์ได้",
      "วิเคราะห์ Chess และ Splendor ด้วยกรอบกลยุทธ์พื้นฐานได้"
    ],
    concepts: ["strategy", "tactics", "decision maker", "action set", "environment", "objectives", "compound advantage", "engine building"],
    classFlow: defaultClassFlow,
    teachToPlay: [
      {
        game: "Splendor",
        goal: "สะสมแต้มให้ถึง 15 คะแนนด้วยการซื้อการ์ดและสร้างระบบส่วนลดอัญมณีสะสม",
        turnLoop: ["เลือกเก็บโทเคน", "หรือจองการ์ด", "หรือซื้อการ์ด", "ตรวจเงื่อนไขรับขุนนาง และคะแนนรวม"],
        firstDecisions: ["เก็บโทเคนเพื่อซื้อการ์ดใบไหน", "จะเน้นการ์ดราคาถูกเพื่อสร้างส่วนลดสะสม หรือรีบเก็บแต้ม", "ควรจองการ์ดเพื่อกันคู่แข่งหรือไม่"],
        doNotWorryYet: ["สูตรเปิดเกมตายตัว", "การนับทุกคะแนนล่วงหน้าหลายตา", "การจำการ์ดทุกใบในกอง"],
        playNowPrompt: "เริ่ม 4-6 รอบแรกโดยให้ทุกคนพูดเหตุผลของการกระทำ หนึ่งครั้ง",
        debriefPrompt: "การกระทำใดดูเล็กน้อยตอนทำ แต่เริ่มสร้างความได้เปรียบสะสมในรอบถัดไป"
      },
      {
        game: "Chess puzzle",
        goal: "หาจังหวะเดินที่แก้ปัญหาเฉพาะหน้าและดูว่าแผนระยะยาวคืออะไร",
        turnLoop: ["ดูตำแหน่งชิ้นสำคัญ", "หา threat ทันที", "เลือก candidate move", "อธิบายแผนหลังเดินตานั้น"],
        firstDecisions: ["กำลังป้องกันหรือโจมตี", "move นี้เป็น tactic หรือเป็นส่วนหนึ่งของ strategy", "ถ้าคู่แข่งตอบโต้ดีที่สุด แผนยังอยู่ไหม"],
        doNotWorryYet: ["opening theory", "ชื่อ tactical pattern ทั้งหมด", "การเล่นทั้งกระดานจนจบเกม"],
        playNowPrompt: "ดู puzzle เดียวและให้แต่ละกลุ่มเสนอ move พร้อมเหตุผล 30 วินาที",
        debriefPrompt: "move ที่ดีเพราะแก้ปัญหาตอนนี้ หรือเพราะเปิดทางให้แผนระยะยาว"
      }
    ],
    conceptBlocks: [
      {
        title: "Strategy vs Tactics",
        body: "Strategy คือทิศทางและเหตุผลระยะยาว ส่วน tactics คือ การกระทำเฉพาะหน้าที่ทำให้แผนนั้นเดินต่อได้"
      },
      {
        title: "Decision Structure",
        body: "ทุกเกมมีผู้ตัดสินใจ ตัวเลือก สภาพแวดล้อม ข้อมูล และเป้าหมาย การมองครบชุดนี้ทำให้คุยเรื่องกลยุทธ์ได้ชัดขึ้น"
      },
      {
        title: "Compound Advantage",
        body: "การกระทำบางอย่างไม่ให้คะแนนทันที แต่ทำให้ตาถัดไปมีตัวเลือกมากขึ้น ถูกลง หรือเร็วขึ้น นี่คือหัวใจของ engine building"
      }
    ],
    activities: [
      { id: "strategy-tactics-sorter", title: "จัดกลุ่มกลยุทธ์กับยุทธวิธี", purpose: "ฝึกแยก การกระทำเฉพาะหน้ากับแผนระยะยาว", kind: "sorter" },
      { id: "decision-canvas", title: "แผนผังโครงสร้างการตัดสินใจ", purpose: "จับสถานการณ์เกมให้เห็นผู้เล่น ตัวเลือก สิ่งแวดล้อม และเป้าหมาย", kind: "canvas" },
      { id: "splendor-timeline", title: "ลำดับการสร้างส่วนลดสะสมใน Splendor", purpose: "เห็นความได้เปรียบสะสมจากการกระทำหลายรอบ", kind: "timeline" },
      { id: "chess-prompt", title: "Chess puzzle prompt", purpose: "เทียบ tactical move กับ strategic plan โดยไม่ต้องสอนหมากรุกทั้งเกม", kind: "prompt" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Strategic Move Reflection",
    submissionPrompt: "เลือกการตัดสินใจสำคัญจากเกมวันนี้ แล้วอธิบายว่าเป็นกลยุทธ์หรือยุทธวิธี พร้อมเหตุผล",
    exitTicket: {
      title: "Strategic Move Reflection",
      prompt: "เลือกการตัดสินใจสำคัญจากเกมวันนี้ แล้วอธิบายว่าเป็นกลยุทธ์หรือยุทธวิธี เพราะอะไร",
      minWords: 50
    },
    status: "complete"
  },
  {
    week: 2,
    title: "โครงสร้างข้อมูลในเกม",
    englishTitle: "Information Structure in Games",
    chapterSource: "chapters/ch02.tex",
    games: ["Chess", "One Night Werewolf", "Love Letter", "Avalon"],
    learningOutcomes: ["แยก perfect, hidden และ asymmetric information ได้", "อธิบาย information sets และ common knowledge ได้", "วิเคราะห์ว่าใครรู้อะไรและข้อมูลเปลี่ยนตอนไหนใน One Night Werewolf ได้"],
    concepts: ["information structure", "hidden information", "asymmetric information", "common knowledge", "deduction", "screening"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "werewolf-wake-order", title: "One Night Werewolf wake-order strip", purpose: "เห็นว่าแต่ละบทบาทได้ข้อมูลหรือเปลี่ยนข้อมูลตอนไหน", kind: "placeholder" },
      { id: "night-action-simulator", title: "Night action simulator", purpose: "จำลองการสลับการ์ดและผลต่อข้อมูลของผู้เล่น", kind: "placeholder" },
      { id: "information-map", title: "Information map", purpose: "แสดงว่าใครรู้อะไร ใครต้องเดา และ คำอ้างใดมีหลักฐาน", kind: "placeholder" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Information Structure Log",
    submissionPrompt: "บันทึกการตัดสินใจสำคัญ 2 ครั้ง และระบุว่าข้อมูลใดเปิดเผย ซ่อนอยู่ หรือไม่สมมาตร",
    exitTicket: { title: "Information Structure Log", prompt: "วันนี้มีข้อมูลอะไรที่เปลี่ยนการตัดสินใจของคุณมากที่สุด" },
    status: "complete"
  },
  {
    week: 3,
    title: "การตัดสินใจภายใต้ความไม่แน่นอน",
    englishTitle: "Decision Making under Uncertainty",
    chapterSource: "chapters/ch03.tex",
    games: ["Love Letter"],
    learningOutcomes: ["แยก social uncertainty จาก risk และ ambiguity ได้", "อธิบาย bluffing, cheap talk และ credible communication ผ่าน Love Letter ได้"],
    concepts: ["social uncertainty", "mixed strategy", "bluffing", "cheap talk", "credible communication", "herding"],
    classFlow: defaultClassFlow,
    teachToPlay: [
      {
        game: "Love Letter",
        goal: "ชนะรอบด้วยการเหลือรอด หรือถือไพ่เลขสูงสุดเมื่อกองจั่วหมด",
        turnLoop: ["จั่ว 1 ใบ", "เลือกเล่น 1 ใบจาก 2 ใบในมือ", "ทำความสามารถของไพ่", "วางไพ่ที่เล่นแล้วหงายไว้เป็นข้อมูลบนโต๊ะ"],
        firstDecisions: ["จะใช้ข้อมูลจากไพ่ที่ออกแล้วอย่างไร", "คำพูดไหนน่าเชื่อหรือเป็นแค่การหลอก", "ควรป้องกันตัวเองหรือกดดันคนอื่น", "ควรเปลี่ยนรูปแบบการเล่นไม่ให้คนอื่นจับทางได้อย่างไร"],
        doNotWorryYet: ["การจำการ์ดทั้งหมดตั้งแต่รอบแรก", "การลวงที่ซับซ้อน", "การคำนวณโอกาสแบบละเอียด"],
        playNowPrompt: "เล่นรอบแรกแบบเปิดเหตุผล แล้วเล่นจริงอีก 2-4 รอบตามเวลา",
        debriefPrompt: "เลือกจังหวะหนึ่งที่ต้องตัดสินใจทั้งที่ข้อมูลไม่ครบ แล้วแยกว่ามีหลักฐานอะไรและมีคำพูดอะไรเข้ามาเกี่ยว"
      }
    ],
    conceptBlocks: [],
    activities: [
      { id: "credibility-meter", title: "Credibility meter", purpose: "จัดอันดับคำพูดและหลักฐาน", kind: "placeholder" },
      { id: "love-letter-card-checkpoint", title: "Love Letter card checkpoint", purpose: "เช็กความสามารถการ์ดสำคัญก่อนเล่นจริง", kind: "placeholder" },
      { id: "bluff-mixer", title: "Bluff pattern mixer", purpose: "ทดลองเปลี่ยนรูปแบบการเล่นไม่ให้ถูกจับทางง่าย", kind: "placeholder" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Credible or Cheap Talk",
    submissionPrompt: "เลือกจังหวะหนึ่งจาก Love Letter แล้ววิเคราะห์ว่าตัดสินใจจากหลักฐาน คำพูด หรือการเดาเพราะข้อมูลไม่ครบ",
    exitTicket: { title: "Credible or Cheap Talk", prompt: "หลักฐานแบบไหนทำให้คุณเชื่อหรือไม่เชื่อผู้เล่นคนหนึ่ง" },
    status: "complete"
  },
  {
    week: 4,
    title: "ความน่าจะเป็นและความเสี่ยง",
    englishTitle: "Probability and Risk",
    chapterSource: "chapters/ch04.tex",
    games: ["Catan", "Stone Age"],
    learningOutcomes: ["คำนวณค่าคาดหวัง (expected value) เบื้องต้นได้", "อธิบาย risk attitude, variance และ diversification ได้"],
    concepts: ["risk", "probability distribution", "expected value", "expected utility", "variance", "diversification"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "2d6-visualizer", title: "2d6 probability visualizer", purpose: "เห็นการแจกแจงของลูกเต๋า 2 ลูก", kind: "placeholder" },
      { id: "catan-ev", title: "Catan settlement EV calculator", purpose: "เทียบตำแหน่งตั้งบ้านจาก EV และ variance", kind: "placeholder" },
      { id: "stone-age-variance", title: "Stone Age worker variance simulator", purpose: "ทดลองความผันผวนจากการกระจายคนงาน", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Risk Decision Note",
    submissionPrompt: "เลือกตำแหน่งหรือการกระจายคนงาน แล้วอธิบายด้วย EV, variance และ risk attitude",
    exitTicket: { title: "Risk Decision Note", prompt: "EV สูงสุดใช่คำตอบที่ดีที่สุดเสมอไหม เพราะอะไร" },
    status: "placeholder"
  },
  {
    week: 5,
    title: "ข้อมูล หลักฐาน และการอนุมาน",
    englishTitle: "Evidence, Credibility, and Limited Inference",
    chapterSource: "chapters/ch02.tex, chapters/ch03.tex, chapters/ch05.tex",
    games: ["C.S. Files / Deception: Murder in Hong Kong"],
    learningOutcomes: ["แยกหลักฐาน คำอ้าง และการตีความได้", "วิเคราะห์ hidden/asymmetric information และ cheap talk ได้", "เชื่อมสิทธิ์เดา เวลา clue และความน่าเชื่อถือกับทรัพยากรจำกัดได้"],
    concepts: ["hidden information", "asymmetric information", "evidence", "cheap talk", "credibility", "deduction", "opportunity cost", "information resource"],
    classFlow: defaultClassFlow,
    teachToPlay: [
      {
        game: "C.S. Files / Deception",
        goal: "หาทั้ง Means of Murder และ Key Evidence ให้ถูก ก่อนที่โอกาสเดาและเวลา discussion จะหมด",
        turnLoop: ["Forensic Scientist วาง marker บน Scene tile", "ผู้เล่นคุยและตั้งสมมติฐาน", "presentation สั้น", "ใช้ Badge เพื่อ solve ได้ครั้งเดียว"],
        firstDecisions: ["ควรเชื่อ Scene tile หรือคำพูดของผู้เล่นคนใด", "ควรใช้ Badge ตอนนี้หรือรอข้อมูลเพิ่ม", "คำอ้างไหนมีหลักฐานรองรับจริง"],
        doNotWorryYet: ["การใช้ role เสริมทุกตัว", "meta reading ขั้นสูง", "การจำการ์ดทุกใบ"],
        playNowPrompt: "เล่นรอบแรกโดยให้ทุกคนจดจังหวะที่อยากใช้ Badge หรือเปลี่ยนใจจาก clue ใหม่",
        debriefPrompt: "ข้อมูลชิ้นใดเป็นหลักฐาน ข้อมูลชิ้นใดเป็นคำอ้าง และสิทธิ์เดา 1 ครั้งมีต้นทุนอะไร"
      }
    ],
    conceptBlocks: [
      { title: "Evidence vs Claim", body: "หลักฐานคือสิ่งที่คนอื่นตรวจตามได้ ส่วนคำอ้างคือสิ่งที่ผู้เล่นอยากให้โต๊ะเชื่อ" },
      { title: "Information Resource", body: "เวลา เบาะแส ความสนใจ ความน่าเชื่อถือ และ Badge เป็นทรัพยากรจำกัดที่ต้องใช้ให้คุ้ม" },
      { title: "Opportunity Cost of Guessing", body: "การเดาตอนนี้แลกกับโอกาสรอข้อมูลเพิ่ม และถ้าเดาผิดจะเสีย Badge ไปถาวร" }
    ],
    activities: [
      { id: "cs-files-teach", title: "C.S. Files teach-to-play deck", purpose: "ให้ผู้เล่นใหม่เริ่มเล่นได้เร็ว", kind: "slides" },
      { id: "evidence-claim-map", title: "Evidence vs claim map", purpose: "แยกหลักฐานออกจากคำพูดและการตีความ", kind: "prompt" },
      { id: "badge-cost", title: "Badge opportunity-cost checkpoint", purpose: "เห็นต้นทุนของการใช้สิทธิ์เดา 1 ครั้ง", kind: "checkpoint" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Evidence and Information Resource Reflection",
    submissionPrompt: "เลือกจังหวะหนึ่งจาก C.S. Files แล้วอธิบายว่าคุณใช้หลักฐาน คำอ้าง หรือทรัพยากรข้อมูลใดในการตัดสินใจ",
    exitTicket: { title: "Evidence and Information Resource Reflection", prompt: "ข้อมูลชิ้นไหนทำให้คุณเปลี่ยนใจ และคุณเสียโอกาสอะไรจากการตัดสินใจนั้น" },
    status: "complete"
  },
  {
    week: 6,
    title: "ข้อมูลลับ ความน่าเชื่อถือ และการตัดสินใจเป็นกลุ่ม",
    englishTitle: "Hidden Roles, Credible Communication, and Group Decision",
    chapterSource: "chapters/ch02.tex, chapters/ch03.tex, chapters/ch08.tex",
    games: ["The Resistance: Avalon"],
    learningOutcomes: ["แยกข้อมูลที่รู้จริง คำอ้าง และหลักฐานจากพฤติกรรมบนโต๊ะได้", "อธิบาย hidden roles, asymmetric information, cheap talk และ credible communication ผ่าน Avalon ได้", "วิเคราะห์ vote pattern และผล Quest เพื่อประเมินความน่าเชื่อถือของผู้เล่นได้"],
    concepts: ["hidden roles", "asymmetric information", "cheap talk", "credible communication", "vote pattern", "collective decision", "strategic ambiguity"],
    classFlow: defaultClassFlow,
    teachToPlay: [
      {
        game: "Avalon",
        goal: "ฝ่ายดีต้องทำ Quest สำเร็จ 3 ครั้งและปกป้อง Merlin ส่วนฝ่ายร้ายต้องทำ Quest fail หรือให้ Assassin ทาย Merlin ถูก",
        turnLoop: ["Leader เสนอทีม", "ทุกคนโหวต Approve/Reject", "ทีมที่ผ่านโหวตส่ง Success/Fail", "เปิดผล Quest แล้วคุยจากหลักฐานใหม่"],
        firstDecisions: ["ควร Approve ทีมนี้หรือไม่", "คำพูดไหนมีหลักฐานรองรับ", "ผล Quest เปลี่ยนความเชื่อใจอย่างไร", "ถ้ารู้ข้อมูลมากควรพูดแค่ไหนไม่ให้เปิดตัว"],
        doNotWorryYet: ["บทบาทเสริมทุกตัว", "meta reading ขั้นสูง", "การจับผิดจากน้ำเสียงล้วน ๆ"],
        playNowPrompt: "เริ่มด้วย Merlin, Assassin, Loyal Servant และ Minion เท่านั้น แล้วเล่น 1-2 รอบพร้อมจด vote pattern สำคัญ",
        debriefPrompt: "จังหวะไหนที่คำพูด หลักฐาน หรือเสียงโหวตทำให้คุณเปลี่ยนความเชื่อใจ"
      }
    ],
    conceptBlocks: [
      { title: "Hidden Roles", body: "ผู้เล่นบางคนรู้ข้อมูลที่คนอื่นไม่รู้ตั้งแต่เริ่ม เกมจึงไม่ได้เริ่มจากข้อมูลเท่ากัน" },
      { title: "Credible Communication", body: "คำพูดน่าเชื่อขึ้นเมื่อผูกกับหลักฐานบนโต๊ะ เสียงโหวต หรือความเสี่ยงที่ผู้พูดยอมรับ" },
      { title: "Strategic Ambiguity", body: "บางครั้งคนที่รู้ความจริงต้องพูดไม่หมด เพื่อช่วยทีมโดยไม่เปิดเผยตัวเอง" }
    ],
    activities: [
      { id: "avalon-teach", title: "Avalon teach-to-play deck", purpose: "ให้ผู้เล่นใหม่เริ่มเล่นรอบแรกได้มั่นใจ", kind: "slides" },
      { id: "vote-pattern", title: "Vote pattern prompt", purpose: "อ่านเสียงโหวตเป็นข้อมูลเปิดที่ใช้คุยต่อได้", kind: "checkpoint" },
      { id: "claim-evidence", title: "Claim vs evidence board", purpose: "แยกคำอ้างออกจากหลักฐานที่ตรวจตามได้", kind: "prompt" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Avalon Trust and Evidence Reflection",
    submissionPrompt: "เลือกจังหวะหนึ่งจาก Avalon แล้วอธิบายว่าคุณใช้ข้อมูลลับ คำอ้าง หลักฐาน หรือเสียงโหวตอย่างไรในการตัดสินใจ",
    exitTicket: { title: "Avalon Trust and Evidence Reflection", prompt: "จังหวะใดทำให้คุณเปลี่ยนความเชื่อใจผู้เล่นคนหนึ่ง และเพราะอะไร" },
    status: "complete"
  },
  {
    week: 7,
    title: "การบริหารทรัพยากร",
    englishTitle: "Resource Management",
    chapterSource: "chapters/ch05.tex",
    games: ["Splendor", "7 Wonders"],
    learningOutcomes: ["อธิบายความขาดแคลน (scarcity) และต้นทุนค่าเสียโอกาส (opportunity cost) ได้", "วิเคราะห์การพึ่งพากันเป็นทอด ๆ (chain dependency) และความได้เปรียบโดยเปรียบเทียบ (comparative advantage) ได้"],
    concepts: ["scarcity", "opportunity cost", "diminishing marginal utility", "allocative efficiency", "externality", "chain dependency"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "opportunity-cost", title: "เปรียบเทียบต้นทุนค่าเสียโอกาส", purpose: "เห็นต้นทุนของการกระทำที่ไม่ได้เลือก", kind: "placeholder" },
      { id: "resource-flow", title: "แผนผังการไหลของทรัพยากร", purpose: "วาดเส้นทางทรัพยากรจากต้นเกมถึงคะแนน", kind: "placeholder" },
      { id: "7w-chain", title: "วางแผนการสร้างต่อเนื่องใน 7 Wonders", purpose: "ทดลองการพึ่งพากันของการ์ด", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Resource Choice Memo",
    submissionPrompt: "อธิบายการตัดสินใจใช้ทรัพยากรหนึ่งครั้งด้วยต้นทุนค่าเสียโอกาส และผลต่อแผนระยะยาว",
    exitTicket: { title: "Resource Choice Memo", prompt: "ทรัพยากรใดที่ดูสำคัญน้อยตอนแรก แต่ส่งผลต่อเกมภายหลัง" },
    status: "placeholder"
  },
  {
    week: 8,
    title: "กลยุทธ์การวางคนงาน",
    englishTitle: "Worker Placement and Scheduling Strategy",
    chapterSource: "chapters/ch06.tex",
    games: ["Stone Age", "Agricola", "Architects of the West Kingdom"],
    learningOutcomes: ["วิเคราะห์พื้นที่สำหรับทำแอ็กชัน (action space) และจังหวะเวลา (timing) ได้", "อธิบาย blocking, scarcity และ deterrence ใน worker placement ได้"],
    concepts: ["worker placement", "action space", "blocking", "timing", "scheduling", "deterrence"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "worker-priority", title: "จัดลำดับความสำคัญของคนงาน", purpose: "เรียงลำดับพื้นที่ทำแอ็กชันตามความเร่งด่วน", kind: "placeholder" },
      { id: "blocking-map", title: "แผนผังการแย่งพื้นที่", purpose: "เห็นผลของการแย่งพื้นที่", kind: "placeholder" },
      { id: "schedule-planner", title: "วางแผนลำดับการเล่นแต่ละรอบ", purpose: "วางแผนหลายรอบล่วงหน้า", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Worker Placement Plan",
    submissionPrompt: "วิเคราะห์พื้นที่ทำแอ็กชันที่สำคัญและอธิบายเหตุผลที่เลือกจังหวะเวลานั้น",
    exitTicket: { title: "Worker Placement Plan", prompt: "วันนี้คุณเลือกแอ็กชันเพราะคุ้มที่สุด หรือเพราะกลัวคู่แข่งแย่งพื้นที่" },
    status: "placeholder"
  },
  {
    week: 9,
    title: "กลยุทธ์เศรษฐกิจและการแข่งขัน",
    englishTitle: "Economic Strategy and Competition",
    chapterSource: "chapters/ch07.tex",
    games: ["Stockpile", "Catan", "7 Wonders"],
    learningOutcomes: ["อธิบาย price discovery และ bargaining power ได้", "วิเคราะห์ BATNA, coalition และ market power ได้"],
    concepts: ["oligopoly", "price discovery", "information mechanism", "bargaining power", "BATNA", "coalition"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "batna-canvas", title: "แผนผังการเจรจาและ BATNA", purpose: "เห็นทางเลือกสำรองของแต่ละฝ่าย", kind: "placeholder" },
      { id: "price-signal", title: "อ่านสัญญาณราคาจาก Stockpile", purpose: "มองราคาว่าเป็นข้อมูล", kind: "placeholder" },
      { id: "trade-network", title: "กราฟเครือข่ายการแลกเปลี่ยนใน Catan", purpose: "เห็นเครือข่ายการแลกเปลี่ยนและการรวมกลุ่ม", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Bargaining and BATNA Memo",
    submissionPrompt: "เลือกดีลหนึ่งครั้ง วิเคราะห์ BATNA อำนาจต่อรอง และผลต่อผู้นำเกม",
    exitTicket: { title: "Bargaining and BATNA Memo", prompt: "ดีลไหนดูยุติธรรมแต่จริง ๆ เปลี่ยนอำนาจในเกม" },
    status: "placeholder"
  },
  {
    week: 10,
    title: "แนวคิดทฤษฎีเกม",
    englishTitle: "Game Theory Concepts",
    chapterSource: "chapters/ch08.tex",
    games: ["7 Wonders Duel", "Catan"],
    learningOutcomes: ["นิยาม normal form game ได้", "อธิบาย dominant strategy และ Nash equilibrium ได้"],
    concepts: ["normal form", "payoff matrix", "dominant strategy", "Nash equilibrium", "Prisoner's Dilemma", "repeated game"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "payoff-builder", title: "สร้างเมทริกซ์ผลตอบแทน", purpose: "สร้างเมทริกซ์จากสถานการณ์ในเกม", kind: "placeholder" },
      { id: "dominant-highlighter", title: "ค้นหากลยุทธ์เด่น", purpose: "หากลยุทธ์ที่ให้ผลดีกว่าเสมอ", kind: "placeholder" },
      { id: "nash-checker", title: "ตรวจดุลยภาพแนช", purpose: "ตรวจดุลยภาพแบบง่าย", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Payoff Matrix from Play",
    submissionPrompt: "สร้าง payoff matrix จากสถานการณ์ในเกม แล้วระบุ dominant strategy หรือ Nash equilibrium ถ้ามี",
    exitTicket: { title: "Payoff Matrix from Play", prompt: "สถานการณ์ใดในเกมวันนี้เปลี่ยนเป็น payoff matrix ได้ชัดที่สุด" },
    status: "placeholder"
  },
  {
    week: 11,
    title: "กลยุทธ์เชิงพื้นที่",
    englishTitle: "Spatial Strategy",
    chapterSource: "chapters/ch09.tex",
    games: ["Taluva", "Chess"],
    learningOutcomes: ["อธิบาย spatial strategy ได้", "ใช้ graph theory วิเคราะห์ connectivity และ blocking ได้"],
    concepts: ["spatial strategy", "graph theory", "connectivity", "territory control", "blocking", "center control"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "connectivity-tool", title: "กราฟการเชื่อมต่อพื้นที่ใน Taluva", purpose: "แทนพื้นที่ด้วยจุดยอดและเส้นเชื่อม", kind: "placeholder" },
      { id: "cut-vertex", title: "ค้นหาจุดยอดตัด (Cut vertex)", purpose: "หาจุดเปราะบางของเครือข่าย", kind: "placeholder" },
      { id: "heatmap", title: "แผนที่แสดงอิทธิพลเหนือพื้นที่", purpose: "เห็นพื้นที่คุมเกม", kind: "placeholder" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "Spatial Map and Weak Point",
    submissionPrompt: "วาดแผนที่หรือกราฟของสถานการณ์ในเกม ระบุจุดแข็ง จุดอ่อน และตำแหน่งที่ควรขัดขวางคู่แข่ง",
    exitTicket: { title: "Spatial Map and Weak Point", prompt: "จุดใดบนกระดานสำคัญที่สุด และสำคัญเพราะอะไร" },
    status: "placeholder"
  },
  {
    week: 12,
    title: "กลยุทธ์เชิงปรับตัว",
    englishTitle: "Adaptive Strategy",
    chapterSource: "chapters/ch10.tex",
    games: ["Evolution", "7 Wonders Duel", "Catan", "Stone Age"],
    learningOutcomes: ["อธิบาย adaptive strategy ได้", "วิเคราะห์ exploration vs exploitation และ Red Queen effect ได้"],
    concepts: ["adaptive strategy", "fitness landscape", "local optimum", "exploration", "exploitation", "ESS", "Red Queen effect"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "fitness-landscape", title: "สำรวจภูมิทัศน์ความเหมาะสม", purpose: "เห็นทางเลือกที่ดีในสภาพแวดล้อมต่างกัน", kind: "placeholder" },
      { id: "adaptation-tracker", title: "ติดตามการปรับตัวของสปีชีส์", purpose: "ติดตามการปรับตัวใน Evolution", kind: "placeholder" },
      { id: "red-queen", title: "ลำดับการแข่งขันปรับตัวตามแนวคิด Red Queen", purpose: "เห็นการไล่ตามกันของกลยุทธ์", kind: "placeholder" }
    ],
    worksheet: "ใบงานสังเกตการเล่นเกม",
    submissionTitle: "When Good Strategy Expired",
    submissionPrompt: "อธิบายกลยุทธ์ที่เคยได้ผลแต่ต้องเปลี่ยน เพราะสภาพแวดล้อมหรือคู่แข่งเปลี่ยนไป",
    exitTicket: { title: "When Good Strategy Expired", prompt: "กลยุทธ์ใดที่หมดอายุระหว่างเกมวันนี้" },
    status: "placeholder"
  },
  {
    week: 13,
    title: "ระบบกลยุทธ์ซับซ้อน",
    englishTitle: "Complex Adaptive Systems",
    chapterSource: "chapters/ch11.tex",
    games: ["Terraforming Mars"],
    learningOutcomes: ["แยก individual adaptation จาก emergence ได้", "ระบุ feedback loop, path dependence และ tipping point ได้"],
    concepts: ["complex adaptive system", "emergence", "self-organization", "positive feedback", "path dependence", "tipping point"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "terraforming-dashboard", title: "ติดตามตัวแปรของ Terraforming Mars", purpose: "ติดตามค่าตัวแปรระดับระบบ", kind: "placeholder" },
      { id: "feedback-loop", title: "วาดวงจรป้อนกลับ", purpose: "วาดวงจรป้อนกลับ", kind: "placeholder" },
      { id: "tipping-signal", title: "ติดตามสัญญาณก่อนถึงจุดเปลี่ยน", purpose: "มองสัญญาณก่อนระบบเปลี่ยน", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Emergence and Feedback Map",
    submissionPrompt: "สร้างแผนภาพระบบ แสดงว่าการกระทำของหลายฝ่ายทำให้เกิดผลระดับระบบอย่างไร",
    exitTicket: { title: "Emergence and Feedback Map", prompt: "ผลลัพธ์ใดเกิดจากระบบรวม ไม่ใช่จากผู้เล่นคนเดียว" },
    status: "placeholder"
  },
  {
    week: 14,
    title: "การวิเคราะห์และประยุกต์ใช้กลยุทธ์",
    englishTitle: "Strategic Analysis and Application",
    chapterSource: "chapters/ch12.tex",
    games: ["Catan", "student-selected game"],
    learningOutcomes: ["ใช้กรอบการคิดเชิงกลยุทธ์ 4 ชั้นเพื่อวิเคราะห์สถานการณ์ได้", "สังเคราะห์ข้อเสนอแนะจากหลายกรอบคิดได้"],
    concepts: ["4 layers", "decision diagnostic", "multi-framework analysis", "framework tension", "cognitive bias", "strategic toolkit"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "diagnostic-wizard", title: "วิเคราะห์สถานการณ์การตัดสินใจ", purpose: "เลือกกรอบคิดให้เหมาะกับสถานการณ์", kind: "placeholder" },
      { id: "framework-selector", title: "เลือกกรอบคิด", purpose: "เลือกกรอบคิดอย่างน้อย 3 ชุด", kind: "placeholder" },
      { id: "presentation-builder", title: "วางโครงนำเสนอโครงงานท้ายรายวิชา", purpose: "จัดโครงนำเสนอโครงงานย่อยท้ายรายวิชา", kind: "placeholder" }
    ],
    worksheet: "ใบงานวิเคราะห์กลยุทธ์",
    submissionTitle: "Multi-Framework Strategy Analysis",
    submissionPrompt: "เลือกเกมหรือสถานการณ์หนึ่ง วิเคราะห์ด้วยกรอบคิดอย่างน้อย 3 กรอบ และเสนอคำแนะนำเชิงกลยุทธ์",
    exitTicket: { title: "Multi-Framework Strategy Analysis", prompt: "กรอบคิดใดช่วยให้มองเกมต่างจากเดิมมากที่สุด" },
    status: "placeholder"
  }
];

export function getMaterialWeek(week: number) {
  return materialWeeks.find((item) => item.week === week);
}
