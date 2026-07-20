import fs from "node:fs";
import path from "node:path";
import { EXAM_QUESTION_BANK } from "../lib/exam/question-bank.server";

const output = path.resolve("tmp/pdfs/sma2106-week1-2-question-bank.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(EXAM_QUESTION_BANK, null, 2), "utf8");
console.log(output);
