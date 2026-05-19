export type Role = "super_admin" | "instructor" | "student";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
};

export type Section = {
  id: string;
  code: string;
  title: string;
  term: string;
  instructorEmail: string;
  enrollmentCode: string;
  status: "active" | "archived";
  createdAt: string;
};

export type Enrollment = {
  id: string;
  sectionId: string;
  studentEmail: string;
  status: "active" | "dropped";
  createdAt: string;
};

export type Assignment = {
  id: string;
  sectionId: string;
  moduleNo: string;
  title: string;
  instructions: string;
  dueAt: string;
  maxScore: string;
  allowedFileTypes: string;
  maxFileMb: string;
  resubmitPolicy: "allowed" | "locked";
  status: "draft" | "published" | "archived";
  createdBy: string;
  createdAt: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  sectionId: string;
  studentEmail: string;
  textAnswer: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  status: "submitted" | "resubmitted";
};

export type Grade = {
  id: string;
  submissionId: string;
  assignmentId: string;
  studentEmail: string;
  score: string;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
};

export type MaterialProgress = {
  id: string;
  studentEmail: string;
  week: string;
  sectionId: string;
  status: "completed";
  exitTicket: string;
  completedAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  createdAt: string;
};

export type SessionUser = Pick<User, "email" | "name" | "role" | "status">;

export type DashboardStats = {
  sections: number;
  students: number;
  assignments: number;
  submissions: number;
  pendingGrades: number;
  averageScore: number | null;
};
