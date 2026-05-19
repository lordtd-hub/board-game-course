"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureSubmissionFolder, uploadSubmissionFile } from "@/lib/drive";
import {
  createAssignment,
  createSection,
  createSubmission,
  enrollStudent,
  gradeSubmission,
  joinSectionWithCode,
  listAssignments,
  listSections,
  sectionsForStudent,
  updateUserRole,
  upsertMaterialProgress
} from "@/lib/repository";
import { requireRole } from "@/lib/session";
import type { Role } from "@/lib/types";

const roleSchema = z.enum(["super_admin", "instructor", "student"]);

export async function changeRoleAction(formData: FormData) {
  const actor = await requireRole(["super_admin"]);
  const userId = String(formData.get("userId") || "");
  const role = roleSchema.parse(String(formData.get("role") || "")) as Role;
  await updateUserRole(actor.email, userId, role);
  revalidatePath("/admin");
}

export async function createSectionAction(formData: FormData) {
  const actor = await requireRole(["super_admin"]);
  await createSection(actor.email, {
    code: String(formData.get("code") || ""),
    title: String(formData.get("title") || ""),
    term: String(formData.get("term") || ""),
    instructorEmail: String(formData.get("instructorEmail") || ""),
    enrollmentCode: String(formData.get("enrollmentCode") || "")
  });
  revalidatePath("/admin");
}

export async function enrollStudentAction(formData: FormData) {
  const actor = await requireRole(["super_admin", "instructor"]);
  await enrollStudent(actor.email, String(formData.get("sectionId") || ""), String(formData.get("studentEmail") || ""));
  revalidatePath("/admin");
  revalidatePath("/instructor");
}

export async function joinSectionAction(formData: FormData) {
  const user = await requireRole(["student"]);
  await joinSectionWithCode(user.email, String(formData.get("enrollmentCode") || ""));
  revalidatePath("/student");
}

export async function createAssignmentAction(formData: FormData) {
  const actor = await requireRole(["super_admin", "instructor"]);
  await createAssignment(actor.email, {
    sectionId: String(formData.get("sectionId") || ""),
    moduleNo: String(formData.get("moduleNo") || ""),
    title: String(formData.get("title") || ""),
    instructions: String(formData.get("instructions") || ""),
    dueAt: String(formData.get("dueAt") || ""),
    maxScore: String(formData.get("maxScore") || "10"),
    allowedFileTypes: String(formData.get("allowedFileTypes") || "pdf,docx,jpg,png"),
    maxFileMb: String(formData.get("maxFileMb") || "20"),
    resubmitPolicy: String(formData.get("resubmitPolicy") || "allowed") === "locked" ? "locked" : "allowed",
    status: String(formData.get("status") || "published") === "draft" ? "draft" : "published"
  });
  revalidatePath("/instructor");
  redirect("/instructor");
}

export async function submitAssignmentAction(formData: FormData) {
  const user = await requireRole(["student"]);
  const assignmentId = String(formData.get("assignmentId") || "");
  const textAnswer = String(formData.get("textAnswer") || "");
  const file = formData.get("file");

  const assignments = await listAssignments();
  const sections = await listSections();
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (!assignment) throw new Error("Assignment not found.");
  const section = sections.find((item) => item.id === assignment.sectionId);
  if (!section) throw new Error("Section not found.");

  let uploaded = { fileId: "", fileName: "", fileUrl: "" };
  if (file instanceof File && file.size > 0) {
    const maxBytes = Number(assignment.maxFileMb || 20) * 1024 * 1024;
    if (file.size > maxBytes) throw new Error(`File is larger than ${assignment.maxFileMb} MB.`);
    const folderId = await ensureSubmissionFolder(section.term, section.code, assignment.id);
    uploaded = await uploadSubmissionFile({
      file,
      folderId,
      studentEmail: user.email,
      assignmentId: assignment.id
    });
  }

  await createSubmission({
    assignmentId: assignment.id,
    sectionId: assignment.sectionId,
    studentEmail: user.email,
    textAnswer,
    ...uploaded
  });

  revalidatePath("/student");
  redirect("/student");
}

export async function gradeSubmissionAction(formData: FormData) {
  const actor = await requireRole(["super_admin", "instructor"]);
  await gradeSubmission(actor.email, {
    submissionId: String(formData.get("submissionId") || ""),
    assignmentId: String(formData.get("assignmentId") || ""),
    studentEmail: String(formData.get("studentEmail") || ""),
    score: String(formData.get("score") || ""),
    feedback: String(formData.get("feedback") || "")
  });
  revalidatePath("/instructor");
  revalidatePath("/grades");
}

export async function completeMaterialAction(formData: FormData) {
  const user = await requireRole(["student"]);
  const week = String(formData.get("week") || "");
  const sectionId = String(formData.get("sectionId") || "");
  const exitTicket = String(formData.get("exitTicket") || "").trim();
  if (!week) throw new Error("Missing material week.");
  if (!exitTicket) throw new Error("Please write an exit ticket before completing the lesson.");

  const sections = await sectionsForStudent(user.email);
  const allowedSection = sections.some((section) => section.id === sectionId);
  if (!allowedSection) throw new Error("You are not enrolled in this section.");

  await upsertMaterialProgress({
    studentEmail: user.email,
    week,
    sectionId,
    exitTicket
  });

  revalidatePath("/materials");
  revalidatePath(`/materials/week/${week}`);
  revalidatePath("/instructor/materials");
}
