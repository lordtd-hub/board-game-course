import assert from "node:assert/strict";
import { EXAM_QUESTION_BANK } from "../lib/exam/question-bank.server";

assert.equal(EXAM_QUESTION_BANK.length, 72, "question bank must contain 72 variants");
const slots = new Map<string, typeof EXAM_QUESTION_BANK>();
for (const question of EXAM_QUESTION_BANK) {
  slots.set(question.slot, [...(slots.get(question.slot) || []), question]);
  assert.equal(question.choices.length, 4, `${question.id} must have four choices`);
  assert.ok(question.answer >= 0 && question.answer <= 3, `${question.id} answer is out of range`);
  assert.ok(question.rationale.length >= 20, `${question.id} needs a rationale`);
  assert.ok(question.source.length >= 10, `${question.id} needs a source`);
  assert.ok(!/Love Letter|Avalon/i.test(question.prompt), `${question.id} includes an excluded game`);
}
assert.equal(slots.size, 24, "bank must contain 24 blueprint slots");
for (const [name, variants] of slots) assert.equal(variants.length, 3, `${name} must contain three variants`);

const firstVariants = [...slots.values()].map((variants) => variants[0]);
assert.deepEqual(
  firstVariants.reduce<Record<string, number>>((counts, question) => ({ ...counts, [question.difficulty]: (counts[question.difficulty] || 0) + 1 }), {}),
  { easy: 6, medium: 12, hard: 6 }
);
assert.deepEqual(
  firstVariants.reduce<Record<string, number>>((counts, question) => ({ ...counts, [question.cognitive]: (counts[question.cognitive] || 0) + 1 }), {}),
  { understand: 6, apply: 12, analyze: 6 }
);
console.log("Exam bank valid: 72 variants, 24 slots, blueprint 6/12/6.");
