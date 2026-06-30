import type { MaterialWeek } from "@/lib/materials/types";

const defaultClassFlow = [
  "Opening challenge 10-15 นาที",
  "Mini lecture 25-35 นาที",
  "Board game play/session 90-120 นาที",
  "Debrief 30-40 นาที",
  "Exit ticket 5-10 นาที"
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
      "อธิบาย information, uncertainty และ interaction ในสถานการณ์เชิงกลยุทธ์ได้",
      "วิเคราะห์ Chess และ Splendor ด้วยกรอบกลยุทธ์พื้นฐานได้"
    ],
    concepts: ["strategy", "tactics", "decision maker", "action set", "environment", "objectives", "compound advantage", "engine building"],
    classFlow: defaultClassFlow,
    teachToPlay: [
      {
        game: "Splendor",
        goal: "สะสมแต้มให้ถึง 15 คะแนนด้วยการซื้อการ์ดและสร้าง engine อัญมณี",
        turnLoop: ["เลือกเก็บ token", "หรือจองการ์ด", "หรือซื้อการ์ด", "ตรวจ bonus noble และคะแนนรวม"],
        firstDecisions: ["เก็บ token เพื่อซื้อการ์ดใบไหน", "จะเน้นการ์ดราคาถูกเพื่อปู engine หรือรีบเก็บแต้ม", "ควรจองการ์ดเพื่อกันคู่แข่งหรือไม่"],
        doNotWorryYet: ["สูตรเปิดเกมตายตัว", "การนับทุกคะแนนล่วงหน้าหลายตา", "การจำการ์ดทุกใบในกอง"],
        playNowPrompt: "เริ่ม 4-6 รอบแรกโดยให้ทุกคนพูดเหตุผลของ action หนึ่งครั้ง",
        debriefPrompt: "action ใดดูเล็กตอนทำ แต่เริ่มสร้างความได้เปรียบสะสมในรอบถัดไป"
      },
      {
        game: "Chess puzzle",
        goal: "หาจังหวะเดินที่แก้ปัญหาเฉพาะหน้าและดูว่าแผนระยะยาวคืออะไร",
        turnLoop: ["ดูตำแหน่งชิ้นสำคัญ", "หา threat ทันที", "เลือก candidate move", "อธิบายแผนต่อจาก move นั้น"],
        firstDecisions: ["กำลังป้องกันหรือโจมตี", "move นี้เป็น tactic หรือเป็นส่วนหนึ่งของ strategy", "ถ้าคู่แข่งตอบโต้ดีที่สุด แผนยังอยู่ไหม"],
        doNotWorryYet: ["opening theory", "ชื่อ tactical pattern ทั้งหมด", "การเล่นทั้งกระดานจนจบเกม"],
        playNowPrompt: "ดู puzzle เดียวและให้แต่ละกลุ่มเสนอ move พร้อมเหตุผล 30 วินาที",
        debriefPrompt: "move ที่ดีเพราะแก้ปัญหาตอนนี้ หรือเพราะเปิดทางให้แผนระยะยาว"
      }
    ],
    conceptBlocks: [
      {
        title: "Strategy vs Tactics",
        body: "Strategy คือทิศทางและเหตุผลระยะยาว ส่วน tactics คือ action เฉพาะหน้าที่ทำให้แผนนั้นเดินต่อได้"
      },
      {
        title: "Decision Structure",
        body: "ทุกเกมมีผู้ตัดสินใจ ตัวเลือก สภาพแวดล้อม ข้อมูล และเป้าหมาย การมองครบชุดนี้ทำให้คุยเรื่องกลยุทธ์ได้ชัดขึ้น"
      },
      {
        title: "Compound Advantage",
        body: "บาง action ไม่ให้คะแนนทันที แต่ทำให้ตาถัดไปมีตัวเลือกมากขึ้น ถูกลง หรือเร็วขึ้น นี่คือหัวใจของ engine building"
      }
    ],
    activities: [
      { id: "strategy-tactics-sorter", title: "Strategy vs Tactics card sorter", purpose: "ฝึกแยก action เฉพาะหน้ากับแผนระยะยาว", kind: "sorter" },
      { id: "decision-canvas", title: "Decision structure canvas", purpose: "จับสถานการณ์เกมให้เห็นผู้เล่น ตัวเลือก สิ่งแวดล้อม และเป้าหมาย", kind: "canvas" },
      { id: "splendor-timeline", title: "Splendor engine-building timeline", purpose: "เห็นความได้เปรียบสะสมจาก action หลายรอบ", kind: "timeline" },
      { id: "chess-prompt", title: "Chess puzzle prompt", purpose: "เทียบ tactical move กับ strategic plan โดยไม่ต้องสอนหมากรุกทั้งเกม", kind: "prompt" }
    ],
    worksheet: "Game Observation Worksheet",
    submissionTitle: "Strategic Move Reflection",
    submissionPrompt: "เลือก decision สำคัญจากเกมวันนี้ แล้วอธิบายว่าเป็นกลยุทธ์หรือยุทธวิธี พร้อมเหตุผล",
    exitTicket: {
      title: "Strategic Move Reflection",
      prompt: "เลือก decision สำคัญจากเกมวันนี้ แล้วอธิบายว่าเป็นกลยุทธ์หรือยุทธวิธี เพราะอะไร",
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
      { id: "werewolf-wake-order", title: "One Night Werewolf wake-order strip", purpose: "เห็นว่าแต่ละ role ได้ข้อมูลหรือเปลี่ยนข้อมูลตอนไหน", kind: "placeholder" },
      { id: "night-action-simulator", title: "Night action simulator", purpose: "จำลองการสลับการ์ดและผลต่อข้อมูลของผู้เล่น", kind: "placeholder" },
      { id: "information-map", title: "Information map", purpose: "แสดงว่าใครรู้อะไร ใครต้องเดา และ claim ไหนมีหลักฐาน", kind: "placeholder" }
    ],
    worksheet: "Game Observation Worksheet",
    submissionTitle: "Information Structure Log",
    submissionPrompt: "บันทึก key decision 2 ครั้ง และระบุว่าข้อมูลใดเปิดเผย ซ่อนอยู่ หรือไม่สมมาตร",
    exitTicket: { title: "Information Structure Log", prompt: "วันนี้มีข้อมูลอะไรที่เปลี่ยนการตัดสินใจของคุณมากที่สุด" },
    status: "placeholder"
  },
  {
    week: 3,
    title: "การตัดสินใจภายใต้ความไม่แน่นอน",
    englishTitle: "Decision Making under Uncertainty",
    chapterSource: "chapters/ch03.tex",
    games: ["Werewolf", "Avalon"],
    learningOutcomes: ["แยก social uncertainty จาก risk และ ambiguity ได้", "อธิบาย bluffing, cheap talk และ credible communication ได้"],
    concepts: ["social uncertainty", "mixed strategy", "bluffing", "cheap talk", "credible communication", "herding"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "credibility-meter", title: "Credibility meter", purpose: "จัดอันดับคำพูดและหลักฐาน", kind: "placeholder" },
      { id: "vote-history", title: "Vote history visualization", purpose: "มอง pattern การโหวตในเกม social deduction", kind: "placeholder" },
      { id: "bluff-mixer", title: "Bluff pattern mixer", purpose: "ทดลองสร้าง mixed strategy", kind: "placeholder" }
    ],
    worksheet: "Game Observation Worksheet",
    submissionTitle: "Credible or Cheap Talk",
    submissionPrompt: "เลือกคำพูดหรือ vote หนึ่งครั้งจากเกม แล้ววิเคราะห์ว่ามีความน่าเชื่อถือเพียงใด",
    exitTicket: { title: "Credible or Cheap Talk", prompt: "หลักฐานแบบไหนทำให้คุณเชื่อหรือไม่เชื่อผู้เล่นคนหนึ่ง" },
    status: "placeholder"
  },
  {
    week: 4,
    title: "ความน่าจะเป็นและความเสี่ยง",
    englishTitle: "Probability and Risk",
    chapterSource: "chapters/ch04.tex",
    games: ["Catan", "Stone Age"],
    learningOutcomes: ["คำนวณ expected value เบื้องต้นได้", "อธิบาย risk attitude, variance และ diversification ได้"],
    concepts: ["risk", "probability distribution", "expected value", "expected utility", "variance", "diversification"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "2d6-visualizer", title: "2d6 probability visualizer", purpose: "เห็น distribution ของลูกเต๋า 2 ลูก", kind: "placeholder" },
      { id: "catan-ev", title: "Catan settlement EV calculator", purpose: "เทียบตำแหน่งตั้งบ้านจาก EV และ variance", kind: "placeholder" },
      { id: "stone-age-variance", title: "Stone Age worker variance simulator", purpose: "ทดลองกระจาย worker กับความผันผวน", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Risk Decision Note",
    submissionPrompt: "เลือกตำแหน่งหรือการกระจาย worker แล้วอธิบายด้วย EV, variance และ risk attitude",
    exitTicket: { title: "Risk Decision Note", prompt: "EV สูงสุดใช่คำตอบที่ดีที่สุดเสมอไหม เพราะอะไร" },
    status: "placeholder"
  },
  {
    week: 5,
    title: "การบริหารทรัพยากร",
    englishTitle: "Resource Management",
    chapterSource: "chapters/ch05.tex",
    games: ["Splendor", "7 Wonders"],
    learningOutcomes: ["อธิบาย scarcity และ opportunity cost ได้", "วิเคราะห์ chain dependency และ comparative advantage ได้"],
    concepts: ["scarcity", "opportunity cost", "diminishing marginal utility", "allocative efficiency", "externality", "chain dependency"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "opportunity-cost", title: "Opportunity cost chooser", purpose: "เห็นต้นทุนของ action ที่ไม่ได้เลือก", kind: "placeholder" },
      { id: "resource-flow", title: "Resource flow map", purpose: "วาดเส้นทางทรัพยากรจากต้นเกมถึงคะแนน", kind: "placeholder" },
      { id: "7w-chain", title: "7 Wonders chain planner", purpose: "ทดลอง dependency ของการ์ด", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Resource Choice Memo",
    submissionPrompt: "อธิบาย resource decision หนึ่งครั้งด้วย opportunity cost และผลต่อแผนระยะยาว",
    exitTicket: { title: "Resource Choice Memo", prompt: "ทรัพยากรใดที่ดูสำคัญน้อยตอนแรก แต่ส่งผลต่อเกมภายหลัง" },
    status: "placeholder"
  },
  {
    week: 6,
    title: "กลยุทธ์การวาง Worker",
    englishTitle: "Worker Placement and Scheduling Strategy",
    chapterSource: "chapters/ch06.tex",
    games: ["Stone Age", "Agricola", "Architects of the West Kingdom"],
    learningOutcomes: ["วิเคราะห์ action space และ timing ได้", "อธิบาย blocking, scarcity และ deterrence ใน worker placement ได้"],
    concepts: ["worker placement", "action space", "blocking", "timing", "scheduling", "deterrence"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "worker-priority", title: "Worker priority board", purpose: "เรียงลำดับ action space ตามความเร่งด่วน", kind: "placeholder" },
      { id: "blocking-map", title: "Blocking map", purpose: "เห็นผลของการแย่งพื้นที่", kind: "placeholder" },
      { id: "schedule-planner", title: "Round schedule planner", purpose: "วางแผนหลายรอบล่วงหน้า", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Worker Placement Plan",
    submissionPrompt: "วิเคราะห์ action space สำคัญและเหตุผลของ timing ที่เลือก",
    exitTicket: { title: "Worker Placement Plan", prompt: "วันนี้คุณเลือก action เพราะมันดีที่สุด หรือเพราะกลัวถูก block" },
    status: "placeholder"
  },
  {
    week: 7,
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
      { id: "batna-canvas", title: "BATNA negotiation canvas", purpose: "เห็นทางเลือกสำรองของแต่ละฝ่าย", kind: "placeholder" },
      { id: "price-signal", title: "Stockpile price signal board", purpose: "มองราคาว่าเป็นข้อมูล", kind: "placeholder" },
      { id: "trade-network", title: "Catan trade network graph", purpose: "เห็นเครือข่าย trade และ coalition", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Bargaining and BATNA Memo",
    submissionPrompt: "เลือกดีลหนึ่งครั้ง วิเคราะห์ BATNA อำนาจต่อรอง และผลต่อผู้นำเกม",
    exitTicket: { title: "Bargaining and BATNA Memo", prompt: "ดีลไหนดูยุติธรรมแต่จริงๆ เปลี่ยนอำนาจในเกม" },
    status: "placeholder"
  },
  {
    week: 8,
    title: "แนวคิด Game Theory",
    englishTitle: "Game Theory Concepts",
    chapterSource: "chapters/ch08.tex",
    games: ["7 Wonders Duel", "Catan"],
    learningOutcomes: ["นิยาม normal form game ได้", "อธิบาย dominant strategy และ Nash equilibrium ได้"],
    concepts: ["normal form", "payoff matrix", "dominant strategy", "Nash equilibrium", "Prisoner's Dilemma", "repeated game"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "payoff-builder", title: "Payoff matrix builder", purpose: "สร้าง matrix จากสถานการณ์ในเกม", kind: "placeholder" },
      { id: "dominant-highlighter", title: "Dominant strategy highlighter", purpose: "หา strategy ที่ดีกว่าเสมอ", kind: "placeholder" },
      { id: "nash-checker", title: "Nash equilibrium checker", purpose: "ตรวจดุลยภาพแบบง่าย", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Payoff Matrix from Play",
    submissionPrompt: "สร้าง payoff matrix จากสถานการณ์ในเกม แล้วระบุ dominant strategy หรือ Nash equilibrium ถ้ามี",
    exitTicket: { title: "Payoff Matrix from Play", prompt: "สถานการณ์ใดในเกมวันนี้เปลี่ยนเป็น payoff matrix ได้ชัดที่สุด" },
    status: "placeholder"
  },
  {
    week: 9,
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
      { id: "connectivity-tool", title: "Taluva connectivity graph tool", purpose: "แปลงพื้นที่เป็น node/edge", kind: "placeholder" },
      { id: "cut-vertex", title: "Cut vertex detector", purpose: "หาจุดเปราะของ network", kind: "placeholder" },
      { id: "heatmap", title: "Territory influence heatmap", purpose: "เห็นพื้นที่คุมเกม", kind: "placeholder" }
    ],
    worksheet: "Game Observation Worksheet",
    submissionTitle: "Spatial Map and Weak Point",
    submissionPrompt: "วาด map หรือ graph ของสถานการณ์ในเกม ระบุจุดแข็ง จุดอ่อน และตำแหน่งที่ควร block",
    exitTicket: { title: "Spatial Map and Weak Point", prompt: "จุดใดบนกระดานสำคัญที่สุด และสำคัญเพราะอะไร" },
    status: "placeholder"
  },
  {
    week: 10,
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
      { id: "fitness-landscape", title: "Fitness landscape explorer", purpose: "เห็นทางเลือกที่ดีในสภาพแวดล้อมต่างกัน", kind: "placeholder" },
      { id: "adaptation-tracker", title: "Species adaptation tracker", purpose: "ติดตามการปรับตัวใน Evolution", kind: "placeholder" },
      { id: "red-queen", title: "Red Queen arms race timeline", purpose: "เห็นการไล่ตามกันของกลยุทธ์", kind: "placeholder" }
    ],
    worksheet: "Game Observation Worksheet",
    submissionTitle: "When Good Strategy Expired",
    submissionPrompt: "อธิบาย strategy ที่เคยดีแต่ต้องเปลี่ยน เพราะ environment หรือคู่แข่งเปลี่ยนไป",
    exitTicket: { title: "When Good Strategy Expired", prompt: "กลยุทธ์ใดที่หมดอายุระหว่างเกมวันนี้" },
    status: "placeholder"
  },
  {
    week: 11,
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
      { id: "terraforming-dashboard", title: "Terraforming parameter dashboard", purpose: "ติดตาม global parameters", kind: "placeholder" },
      { id: "feedback-loop", title: "Feedback loop mapper", purpose: "วาดวงจร feedback", kind: "placeholder" },
      { id: "tipping-signal", title: "Tipping point signal tracker", purpose: "มองสัญญาณก่อนระบบเปลี่ยน", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Emergence and Feedback Map",
    submissionPrompt: "สร้าง systems map แสดงว่า action หลายฝ่ายทำให้เกิดผลระดับระบบอย่างไร",
    exitTicket: { title: "Emergence and Feedback Map", prompt: "ผลลัพธ์ใดเกิดจากระบบรวม ไม่ใช่จากผู้เล่นคนเดียว" },
    status: "placeholder"
  },
  {
    week: 12,
    title: "การวิเคราะห์และประยุกต์ใช้กลยุทธ์",
    englishTitle: "Strategic Analysis and Application",
    chapterSource: "chapters/ch12.tex",
    games: ["Catan", "student-selected game"],
    learningOutcomes: ["ใช้ 4 layers of strategic thinking เพื่อ diagnose สถานการณ์ได้", "สังเคราะห์ recommendation จากหลาย framework ได้"],
    concepts: ["4 layers", "decision diagnostic", "multi-framework analysis", "framework tension", "cognitive bias", "strategic toolkit"],
    classFlow: defaultClassFlow,
    teachToPlay: [],
    conceptBlocks: [],
    activities: [
      { id: "diagnostic-wizard", title: "Decision diagnostic wizard", purpose: "เลือกกรอบคิดให้เหมาะกับสถานการณ์", kind: "placeholder" },
      { id: "framework-selector", title: "Framework selector", purpose: "เลือก framework อย่างน้อย 3 ชุด", kind: "placeholder" },
      { id: "presentation-builder", title: "Final project presentation builder", purpose: "จัดโครงนำเสนอ final mini project", kind: "placeholder" }
    ],
    worksheet: "Strategy Analysis Worksheet",
    submissionTitle: "Multi-Framework Strategy Analysis",
    submissionPrompt: "เลือกเกมหรือสถานการณ์หนึ่ง วิเคราะห์ด้วยอย่างน้อย 3 frameworks และเสนอ strategic recommendation",
    exitTicket: { title: "Multi-Framework Strategy Analysis", prompt: "framework ใดช่วยให้คุณเห็นเกมต่างจากเดิมมากที่สุด" },
    status: "placeholder"
  }
];

export function getMaterialWeek(week: number) {
  return materialWeeks.find((item) => item.week === week);
}
