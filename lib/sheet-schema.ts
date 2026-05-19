export const SHEET_SCHEMAS = {
  users: ["id", "email", "name", "role", "status", "createdAt", "updatedAt"],
  sections: ["id", "code", "title", "term", "instructorEmail", "enrollmentCode", "status", "createdAt"],
  enrollments: ["id", "sectionId", "studentEmail", "status", "createdAt"],
  assignments: [
    "id",
    "sectionId",
    "moduleNo",
    "title",
    "instructions",
    "dueAt",
    "maxScore",
    "allowedFileTypes",
    "maxFileMb",
    "resubmitPolicy",
    "status",
    "createdBy",
    "createdAt"
  ],
  submissions: [
    "id",
    "assignmentId",
    "sectionId",
    "studentEmail",
    "textAnswer",
    "fileId",
    "fileName",
    "fileUrl",
    "submittedAt",
    "status"
  ],
  grades: ["id", "submissionId", "assignmentId", "studentEmail", "score", "feedback", "gradedBy", "gradedAt"],
  feedback: ["id", "submissionId", "studentEmail", "feedback", "createdBy", "createdAt"],
  material_progress: ["id", "studentEmail", "week", "sectionId", "status", "exitTicket", "completedAt", "updatedAt"],
  audit_logs: ["id", "actorEmail", "action", "entityType", "entityId", "detail", "createdAt"]
} as const;

export type SheetName = keyof typeof SHEET_SCHEMAS;
