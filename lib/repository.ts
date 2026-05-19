import { appConfig } from "@/lib/config";
import { appendRow, getRows, updateRowById } from "@/lib/sheets";
import type {
  Assignment,
  AuditLog,
  DashboardStats,
  Enrollment,
  Grade,
  MaterialProgress,
  Role,
  Section,
  Submission,
  User
} from "@/lib/types";
import { id, normalizeEmail, nowIso, sameEmail, toNumber } from "@/lib/utils";

export async function listUsers() {
  return getRows<User>("users");
}

export async function listSections() {
  return getRows<Section>("sections");
}

export async function listEnrollments() {
  return getRows<Enrollment>("enrollments");
}

export async function listAssignments() {
  return getRows<Assignment>("assignments");
}

export async function listSubmissions() {
  return getRows<Submission>("submissions");
}

export async function listGrades() {
  return getRows<Grade>("grades");
}

export async function listMaterialProgress() {
  return getRows<MaterialProgress>("material_progress");
}

export async function upsertUserFromLogin(input: { email: string; name: string }) {
  const email = normalizeEmail(input.email);
  const users = await listUsers();
  const existing = users.find((user) => sameEmail(user.email, email));
  const role: Role = sameEmail(email, appConfig.bootstrapSuperAdminEmail) ? "super_admin" : "student";

  if (existing) {
    await updateRowById("users", existing.id, { ...existing, name: input.name, updatedAt: nowIso() });
    return { ...existing, name: input.name };
  }

  const user: User = {
    id: id("usr"),
    email,
    name: input.name,
    role,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  await appendRow("users", user);
  return user;
}

export async function updateUserRole(actorEmail: string, userId: string, role: Role) {
  const users = await listUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) throw new Error("User not found.");
  const next = { ...user, role, updatedAt: nowIso() };
  await updateRowById("users", userId, next);
  await addAudit(actorEmail, "update_role", "user", userId, role);
}

export async function createSection(actorEmail: string, input: Pick<Section, "code" | "title" | "term" | "instructorEmail" | "enrollmentCode">) {
  const section: Section = {
    id: id("sec"),
    code: input.code.trim(),
    title: input.title.trim(),
    term: input.term.trim(),
    instructorEmail: normalizeEmail(input.instructorEmail),
    enrollmentCode: input.enrollmentCode.trim(),
    status: "active",
    createdAt: nowIso()
  };
  await appendRow("sections", section);
  await addAudit(actorEmail, "create_section", "section", section.id, section.code);
}

export async function enrollStudent(actorEmail: string, sectionId: string, studentEmail: string) {
  const enrollment: Enrollment = {
    id: id("enr"),
    sectionId,
    studentEmail: normalizeEmail(studentEmail),
    status: "active",
    createdAt: nowIso()
  };
  await appendRow("enrollments", enrollment);
  await addAudit(actorEmail, "enroll_student", "enrollment", enrollment.id, enrollment.studentEmail);
}

export async function joinSectionWithCode(studentEmail: string, enrollmentCode: string) {
  const sections = await listSections();
  const section = sections.find((item) => item.enrollmentCode === enrollmentCode.trim() && item.status === "active");
  if (!section) throw new Error("Enrollment code not found.");

  const enrollments = await listEnrollments();
  const existing = enrollments.find((item) => item.sectionId === section.id && sameEmail(item.studentEmail, studentEmail));
  if (existing) return section;

  await enrollStudent(studentEmail, section.id, studentEmail);
  return section;
}

export async function createAssignment(actorEmail: string, input: Omit<Assignment, "id" | "createdBy" | "createdAt">) {
  const assignment: Assignment = {
    ...input,
    id: id("asg"),
    createdBy: normalizeEmail(actorEmail),
    createdAt: nowIso()
  };
  await appendRow("assignments", assignment);
  await addAudit(actorEmail, "create_assignment", "assignment", assignment.id, assignment.title);
}

export async function createSubmission(input: Omit<Submission, "id" | "submittedAt" | "status">) {
  const submissions = await listSubmissions();
  const alreadySubmitted = submissions.some(
    (item) => item.assignmentId === input.assignmentId && sameEmail(item.studentEmail, input.studentEmail)
  );
  const submission: Submission = {
    ...input,
    id: id("sub"),
    submittedAt: nowIso(),
    status: alreadySubmitted ? "resubmitted" : "submitted"
  };
  await appendRow("submissions", submission);
  await addAudit(input.studentEmail, "submit_assignment", "submission", submission.id, input.assignmentId);
}

export async function gradeSubmission(actorEmail: string, input: Omit<Grade, "id" | "gradedBy" | "gradedAt">) {
  const grade: Grade = {
    ...input,
    id: id("grd"),
    gradedBy: normalizeEmail(actorEmail),
    gradedAt: nowIso()
  };
  await appendRow("grades", grade);
  await addAudit(actorEmail, "grade_submission", "grade", grade.id, `${grade.studentEmail}:${grade.score}`);
}

export async function upsertMaterialProgress(input: {
  studentEmail: string;
  week: string;
  sectionId: string;
  exitTicket: string;
}) {
  const studentEmail = normalizeEmail(input.studentEmail);
  const week = input.week.trim();
  const sectionId = input.sectionId.trim();
  const progressRows = await listMaterialProgress();
  const existing = progressRows.find(
    (item) => sameEmail(item.studentEmail, studentEmail) && item.week === week && item.sectionId === sectionId
  );
  const timestamp = nowIso();

  if (existing) {
    const next: MaterialProgress = {
      ...existing,
      status: "completed",
      exitTicket: input.exitTicket.trim(),
      updatedAt: timestamp
    };
    await updateRowById("material_progress", existing.id, next);
    await addAudit(studentEmail, "update_material_progress", "material_progress", existing.id, `week ${week}`);
    return next;
  }

  const progress: MaterialProgress = {
    id: id("mat"),
    studentEmail,
    week,
    sectionId,
    status: "completed",
    exitTicket: input.exitTicket.trim(),
    completedAt: timestamp,
    updatedAt: timestamp
  };
  await appendRow("material_progress", progress);
  await addAudit(studentEmail, "complete_material", "material_progress", progress.id, `week ${week}`);
  return progress;
}

export async function addAudit(actorEmail: string, action: string, entityType: string, entityId: string, detail: string) {
  const log: AuditLog = {
    id: id("aud"),
    actorEmail: normalizeEmail(actorEmail),
    action,
    entityType,
    entityId,
    detail,
    createdAt: nowIso()
  };
  await appendRow("audit_logs", log);
}

export async function materialCompletionForSectionIds(sectionIds: string[], week?: string) {
  const [enrollments, progressRows] = await Promise.all([listEnrollments(), listMaterialProgress()]);
  const sectionIdSet = new Set(sectionIds);
  const scopedEnrollments = enrollments.filter(
    (enrollment) => sectionIdSet.has(enrollment.sectionId) && enrollment.status === "active"
  );
  const scopedProgress = progressRows.filter(
    (progress) => sectionIdSet.has(progress.sectionId) && (!week || progress.week === week)
  );
  const completedKeys = new Set(
    scopedProgress.map((progress) => `${normalizeEmail(progress.studentEmail)}:${progress.sectionId}:${progress.week}`)
  );

  return {
    students: scopedEnrollments.length,
    completed: scopedProgress.length,
    pendingWeek1: scopedEnrollments.filter(
      (enrollment) => !completedKeys.has(`${normalizeEmail(enrollment.studentEmail)}:${enrollment.sectionId}:1`)
    ).length,
    progressRows: scopedProgress
  };
}

export async function sectionsForInstructor(email: string) {
  return (await listSections()).filter((section) => sameEmail(section.instructorEmail, email));
}

export async function sectionsForStudent(email: string) {
  const [sections, enrollments] = await Promise.all([listSections(), listEnrollments()]);
  const sectionIds = new Set(
    enrollments.filter((item) => sameEmail(item.studentEmail, email) && item.status === "active").map((item) => item.sectionId)
  );
  return sections.filter((section) => sectionIds.has(section.id));
}

export async function dashboardForSectionIds(sectionIds: string[]): Promise<DashboardStats> {
  const [sections, enrollments, assignments, submissions, grades] = await Promise.all([
    listSections(),
    listEnrollments(),
    listAssignments(),
    listSubmissions(),
    listGrades()
  ]);
  const sectionIdSet = new Set(sectionIds);
  const scopedSections = sections.filter((section) => sectionIdSet.has(section.id));
  const scopedAssignments = assignments.filter((assignment) => sectionIdSet.has(assignment.sectionId));
  const scopedSubmissions = submissions.filter((submission) => sectionIdSet.has(submission.sectionId));
  const gradedSubmissionIds = new Set(grades.map((grade) => grade.submissionId));
  const scopedGrades = grades.filter((grade) => scopedSubmissions.some((submission) => submission.id === grade.submissionId));
  const scoreValues = scopedGrades.map((grade) => toNumber(grade.score)).filter((score) => Number.isFinite(score));

  return {
    sections: scopedSections.length,
    students: enrollments.filter((enrollment) => sectionIdSet.has(enrollment.sectionId) && enrollment.status === "active").length,
    assignments: scopedAssignments.length,
    submissions: scopedSubmissions.length,
    pendingGrades: scopedSubmissions.filter((submission) => !gradedSubmissionIds.has(submission.id)).length,
    averageScore: scoreValues.length ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length : null
  };
}
