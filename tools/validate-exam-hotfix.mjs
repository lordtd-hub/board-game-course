import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  question: await readFile("app/api/exam/question/route.ts", "utf8"),
  event: await readFile("app/api/exam/event/route.ts", "utf8"),
  mobile: await readFile("app/exam/sma2106-week1-2/mobile-exam.tsx", "utf8"),
  sheets: await readFile("lib/sheets.ts", "utf8")
};

assert.doesNotMatch(files.question, /examState|repository\.server/, "question route must not read exam state or Sheets");
assert.match(files.event, /eventId:\s*z\.string\(\)\.uuid\(\)/, "event API must require a UUID eventId");
assert.match(files.mobile, /visibilityState === "hidden"/, "mobile client must record hidden visibility immediately");
assert.match(files.mobile, /navigator\.sendBeacon\("\/api\/exam\/event"/, "mobile client must beacon hidden events");
assert.match(files.mobile, /pendingEvents/, "mobile client must persist an event outbox");

const dataWriteOptions = [...files.sheets.matchAll(/valueInputOption:\s*"(RAW|USER_ENTERED)"/g)].map((match) => match[1]);
assert.deepEqual(dataWriteOptions, ["RAW", "RAW", "USER_ENTERED"], "row append/update must use RAW; only schema headers may use USER_ENTERED");
assert.doesNotMatch(files.sheets, /21_000/, "Sheets retry must not wait 21 seconds per attempt");

console.log("Exam hotfix invariants passed: question reads, event outbox, RAW writes, and bounded retries.");
