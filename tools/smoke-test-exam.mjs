import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const baseUrl = process.argv[2] || "http://localhost:3000";
const mode = process.env.SMOKE_MODE || "basic";
const controlPin = process.env.EXAM_CONTROL_PIN || "";
const roomCode = process.env.EXAM_TEST_ROOM_CODE || "246810";
const runId = Date.now().toString(36).toUpperCase().slice(-6);
const eventId = () => randomUUID();

async function request(path, options = {}, cookie = "") {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), ...(cookie ? { cookie } : {}) }
  });
}

async function jsonRequest(path, body, cookie = "") {
  return request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  }, cookie);
}

function responseCookie(response) {
  return response.headers.get("set-cookie")?.split(";")[0] || "";
}

async function responseText(response) {
  const text = await response.text();
  return `${response.status} ${text}`;
}

async function assertStatus(response, expected, label) {
  if (response.status !== expected) throw new Error(`${label}: ${await responseText(response)}`);
}

async function unlockControl() {
  if (!controlPin) return "";
  const response = await jsonRequest("/api/instructor/exam-control", { action: "unlock", pin: controlPin });
  await assertStatus(response, 200, "control unlock failed");
  const cookie = responseCookie(response);
  assert.ok(cookie, "missing instructor control cookie");
  const status = await request("/api/instructor/exam-control", {}, cookie);
  await assertStatus(status, 200, "control status failed");
  const payload = await status.json();
  assert.equal(payload.storageReady, true, "Google Sheet storage is not ready");
  return cookie;
}

async function openExam(controlCookie) {
  if (!controlCookie) return;
  const closeAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const response = await jsonRequest("/api/instructor/exam-control", { action: "open", roomCode, closeAt }, controlCookie);
  await assertStatus(response, 200, "control open failed");
  const payload = await response.json();
  assert.equal(payload.status, "open");
  assert.equal(payload.storageReady, true);
}

async function closeExam(controlCookie) {
  if (!controlCookie) return;
  const response = await jsonRequest("/api/instructor/exam-control", { action: "close" }, controlCookie);
  await assertStatus(response, 200, "control close failed");
  const payload = await response.json();
  assert.equal(payload.status, "closed");
}

async function diagnostics(controlCookie) {
  if (!controlCookie) return null;
  const response = await request("/api/instructor/exam-control", {}, controlCookie);
  await assertStatus(response, 200, "control diagnostics failed");
  return (await response.json()).diagnostics || null;
}

async function startAttempt(studentId, studentName = "Production QA") {
  const response = await jsonRequest("/api/exam/start", {
    studentId,
    studentName,
    sectionId: "SEC-1",
    roomCode
  });
  if (response.status !== 200) throw new Error(`start failed for ${studentId}: ${await responseText(response)}`);
  const cookie = responseCookie(response);
  assert.ok(cookie, `missing session cookie for ${studentId}`);
  return { cookie, session: await response.json() };
}

async function fetchQuestion(cookie, index) {
  const response = await request(`/api/exam/question?index=${index}`, {}, cookie);
  await assertStatus(response, 200, `question ${index + 1} failed`);
  assert.match(response.headers.get("content-type") || "", /image\/svg\+xml/);
  return response.text();
}

async function submitAttempt(cookie, leaveCount = 0) {
  return jsonRequest("/api/exam/submit", { answers: Array(24).fill("A"), leaveCount }, cookie);
}

async function runBasic(controlCookie) {
  const studentId = `TEST-NORMAL-${runId}`;
  const { cookie, session } = await startAttempt(studentId, '=HYPERLINK("https://example.invalid","Normal Flow Test")');
  assert.equal(session.total, 24);
  const beforeQuestions = await diagnostics(controlCookie);
  const questions = [];
  for (let index = 0; index < 24; index += 1) questions.push(await fetchQuestion(cookie, index));
  assert.match(questions[0], new RegExp(studentId));
  assert.doesNotMatch(questions[0], /rationale|answer\s*:/i);
  assert.equal(await fetchQuestion(cookie, 0), questions[0], "refresh changed the seeded question");
  const afterQuestions = await diagnostics(controlCookie);
  if (beforeQuestions && afterQuestions) {
    assert.equal(afterQuestions.stateReads, beforeQuestions.stateReads, "question requests read exam state storage");
  }

  const submit = await submitAttempt(cookie);
  await assertStatus(submit, 200, "normal submit failed");
  const result = await submit.json();
  assert.match(result.receipt, /^SMA-[A-Z0-9_-]{10}$/);
  const recoveredStatus = await request("/api/exam/status", {}, cookie);
  await assertStatus(recoveredStatus, 200, "submitted status recovery failed");
  const recovered = await recoveredStatus.json();
  assert.equal(recovered.status, "submitted");
  assert.equal(recovered.receipt, result.receipt, "status recovery changed the receipt");
  const duplicate = await submitAttempt(cookie);
  await assertStatus(duplicate, 200, "duplicate submit failed");
  assert.equal((await duplicate.json()).receipt, result.receipt, "duplicate submit changed the receipt");

  const raceId = `TEST-RACE-${runId}`;
  const race = await startAttempt(raceId, "Ten Concurrent Submits");
  const beforeRace = await diagnostics(controlCookie);
  const raceResponses = await Promise.all(Array.from({ length: 10 }, () => submitAttempt(race.cookie)));
  for (const [index, response] of raceResponses.entries()) await assertStatus(response, 200, `race submit ${index + 1} failed`);
  const raceReceipts = await Promise.all(raceResponses.map((response) => response.json().then((data) => data.receipt)));
  assert.equal(new Set(raceReceipts).size, 1, "concurrent submits returned different receipts");
  const afterRace = await diagnostics(controlCookie);
  if (beforeRace && afterRace) {
    assert.equal(afterRace.resultCount, beforeRace.resultCount + 1, "concurrent submits created physical duplicate rows");
    assert.deepEqual(afterRace.duplicateResultKeys, [], "memory store contains duplicate result keys");
  }

  const cheaterId = `TEST-CHEAT-${runId}`;
  const cheater = await startAttempt(cheaterId, "Visibility Test");
  const firstEventId = eventId();
  const beforeEvents = await diagnostics(controlCookie);
  for (const [count, id] of [[1, firstEventId], [1, firstEventId], [2, eventId()]]) {
    const event = await jsonRequest("/api/exam/event", { eventId: id, count, clientAt: new Date().toISOString() }, cheater.cookie);
    await assertStatus(event, 200, `event ${count} failed`);
    assert.equal((await event.json()).status, count === 1 ? "warning" : "disqualified");
  }
  const afterEvents = await diagnostics(controlCookie);
  if (beforeEvents && afterEvents) {
    assert.equal(afterEvents.eventCount, beforeEvents.eventCount + 2, "duplicate eventId created a physical duplicate event");
  }
  const blockedSubmit = await submitAttempt(cheater.cookie, 2);
  assert.equal(blockedSubmit.status, 423);
  const blockedRestart = await jsonRequest("/api/exam/start", {
    studentId: cheaterId,
    studentName: "Visibility Test",
    sectionId: "SEC-1",
    roomCode
  });
  assert.equal(blockedRestart.status, 423);

  const heldId = `TEST-HOLD-${runId}`;
  const held = await startAttempt(heldId, "Started Before Close");
  await closeExam(controlCookie);
  await fetchQuestion(held.cookie, 0);
  const heldSubmit = await submitAttempt(held.cookie);
  await assertStatus(heldSubmit, 200, "held submit failed");
  const lateStart = await jsonRequest("/api/exam/start", {
    studentId: `TEST-LATE-${runId}`,
    studentName: "Late Start Test",
    sectionId: "SEC-1",
    roomCode
  });
  await assertStatus(lateStart, 403, "late start should be blocked");
  console.log(`Basic production flow passed; receipt ${result.receipt}.`);
}

async function runLoad() {
  const startedAt = Date.now();
  const attempts = await Promise.all(Array.from({ length: 60 }, async (_, index) => {
    const studentId = `TEST-LOAD-${runId}-${String(index + 1).padStart(2, "0")}`;
    const attempt = await startAttempt(studentId, `Load Test ${index + 1}`);
    await fetchQuestion(attempt.cookie, 0);
    return { studentId, ...attempt };
  }));
  const submissions = await Promise.all(attempts.map(async ({ studentId, cookie }) => {
    const response = await submitAttempt(cookie);
    if (response.status !== 200) throw new Error(`submit failed for ${studentId}: ${await responseText(response)}`);
    const result = await response.json();
    assert.match(result.receipt, /^SMA-[A-Z0-9_-]{10}$/);
    return result.receipt;
  }));
  assert.equal(new Set(submissions).size, 60);
  console.log(`60 concurrent starts and submits passed in ${Date.now() - startedAt} ms.`);
}

async function runEventLoad() {
  const attempts = await Promise.all(Array.from({ length: 60 }, async (_, index) => {
    const studentId = `TEST-EVENT-${runId}-${String(index + 1).padStart(2, "0")}`;
    return { studentId, ...(await startAttempt(studentId, `Event Test ${index + 1}`)) };
  }));
  const events = await Promise.all(attempts.map(async ({ studentId, cookie }) => {
    const response = await jsonRequest("/api/exam/event", { eventId: eventId(), count: 1, clientAt: new Date().toISOString() }, cookie);
    if (response.status !== 200) throw new Error(`event failed for ${studentId}: ${await responseText(response)}`);
    return response.json();
  }));
  assert.ok(events.every((event) => event.status === "warning"));
  console.log("60 concurrent event writes passed.");
}

const controlCookie = await unlockControl();
if (mode === "open") {
  await openExam(controlCookie);
  console.log("Exam entry opened for the isolated load-test rounds.");
} else if (mode === "close") {
  await closeExam(controlCookie);
  console.log("Exam entry closed after the isolated load-test rounds.");
} else {
  let alreadyClosed = false;
  try {
    await openExam(controlCookie);
    if (mode === "basic") {
      await runBasic(controlCookie);
      alreadyClosed = true;
    } else if (mode === "load") {
      await runLoad();
    } else if (mode === "events") {
      await runEventLoad();
    } else {
      throw new Error(`Unsupported SMOKE_MODE: ${mode}`);
    }
  } finally {
    if (!alreadyClosed) await closeExam(controlCookie);
  }
}
