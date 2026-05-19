import Link from "next/link";
import { gradeSubmissionAction } from "@/lib/actions";
import {
  dashboardForSectionIds,
  listAssignments,
  listGrades,
  listSubmissions,
  sectionsForInstructor,
  listSections
} from "@/lib/repository";
import { requireRole } from "@/lib/session";
import { MetricCard } from "@/components/metric-card";
import { EmptyState, TableWrap } from "@/components/table";

export default async function InstructorPage() {
  const user = await requireRole(["super_admin", "instructor"]);
  const sections = user.role === "super_admin" ? await listSections() : await sectionsForInstructor(user.email);
  const sectionIds = sections.map((section) => section.id);
  const [assignments, submissions, grades, stats] = await Promise.all([
    listAssignments(),
    listSubmissions(),
    listGrades(),
    dashboardForSectionIds(sectionIds)
  ]);
  const scopedAssignments = assignments.filter((assignment) => sectionIds.includes(assignment.sectionId));
  const scopedSubmissions = submissions.filter((submission) => sectionIds.includes(submission.sectionId));
  const gradedSubmissionIds = new Set(grades.map((grade) => grade.submissionId));

  return (
    <div className="stack">
      <section>
        <h1>Instructor</h1>
        <p className="muted">สร้างงาน ดูงานส่ง และให้คะแนนสำหรับ section ที่รับผิดชอบ</p>
        <div className="nav">
          <Link className="button" href="/assignments/new">สร้างงานใหม่</Link>
          <Link className="button secondary" href="/instructor/materials">Materials dashboard</Link>
        </div>
      </section>

      <section className="grid">
        <MetricCard label="Sections" value={stats.sections} />
        <MetricCard label="Assignments" value={stats.assignments} />
        <MetricCard label="Submissions" value={stats.submissions} />
        <MetricCard label="Pending grades" value={stats.pendingGrades} />
      </section>

      {sections.length ? (
        <TableWrap>
          <h2>Assignments</h2>
          <table>
            <thead><tr><th>Title</th><th>Section</th><th>Module</th><th>Due</th><th>Status</th><th>Submissions</th></tr></thead>
            <tbody>
              {scopedAssignments.map((assignment) => {
                const section = sections.find((item) => item.id === assignment.sectionId);
                return (
                  <tr key={assignment.id}>
                    <td>{assignment.title}</td>
                    <td>{section?.code || assignment.sectionId}</td>
                    <td>{assignment.moduleNo || "-"}</td>
                    <td>{assignment.dueAt || "-"}</td>
                    <td><span className="badge">{assignment.status}</span></td>
                    <td>{scopedSubmissions.filter((submission) => submission.assignmentId === assignment.id).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <EmptyState title="ยังไม่มี section" detail="ให้ super admin ผูกบัญชีผู้สอนกับ section ก่อน" />
      )}

      <TableWrap>
        <h2>Submissions</h2>
        <table>
          <thead><tr><th>Student</th><th>Assignment</th><th>File</th><th>Submitted</th><th>Grade</th></tr></thead>
          <tbody>
            {scopedSubmissions.map((submission) => {
              const assignment = assignments.find((item) => item.id === submission.assignmentId);
              const graded = gradedSubmissionIds.has(submission.id);
              return (
                <tr key={submission.id}>
                  <td>{submission.studentEmail}</td>
                  <td>{assignment?.title || submission.assignmentId}</td>
                  <td>{submission.fileUrl ? <a className="badge" href={submission.fileUrl} target="_blank">เปิดไฟล์</a> : "ไม่มีไฟล์"}</td>
                  <td>{submission.submittedAt}</td>
                  <td>
                    {graded ? <span className="badge">graded</span> : (
                      <form className="form" action={gradeSubmissionAction}>
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <input type="hidden" name="assignmentId" value={submission.assignmentId} />
                        <input type="hidden" name="studentEmail" value={submission.studentEmail} />
                        <label className="field">คะแนน<input name="score" required inputMode="decimal" /></label>
                        <label className="field">Feedback<textarea name="feedback" rows={2} /></label>
                        <button type="submit">บันทึกคะแนน</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
