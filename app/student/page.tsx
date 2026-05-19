import { joinSectionAction, submitAssignmentAction } from "@/lib/actions";
import { listAssignments, listGrades, listSubmissions, sectionsForStudent } from "@/lib/repository";
import { requireRole } from "@/lib/session";
import { EmptyState, TableWrap } from "@/components/table";

export default async function StudentPage() {
  const user = await requireRole(["student", "instructor", "super_admin"]);
  const sections = await sectionsForStudent(user.email);
  const sectionIds = sections.map((section) => section.id);
  const [assignments, submissions, grades] = await Promise.all([listAssignments(), listSubmissions(), listGrades()]);
  const visibleAssignments = assignments.filter(
    (assignment) => sectionIds.includes(assignment.sectionId) && assignment.status === "published"
  );
  const mySubmissions = submissions.filter((submission) => submission.studentEmail === user.email);

  return (
    <div className="stack">
      <section>
        <h1>Student</h1>
        <p className="muted">ดูงาน ส่งไฟล์ และติดตามคะแนน/feedback ของตัวเอง</p>
      </section>

      <form className="card form" action={joinSectionAction}>
        <h2>เข้าร่วม Section</h2>
        <label className="field">Enrollment code<input name="enrollmentCode" placeholder="BG-SEC1" /></label>
        <button type="submit">Join section</button>
      </form>

      {sections.length ? (
        <TableWrap>
          <h2>My sections</h2>
          <table>
            <thead><tr><th>Code</th><th>Title</th><th>Term</th><th>Instructor</th></tr></thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id}>
                  <td>{section.code}</td>
                  <td>{section.title}</td>
                  <td>{section.term}</td>
                  <td>{section.instructorEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <EmptyState title="ยังไม่อยู่ใน section" detail="กรอก enrollment code หรือให้อาจารย์เพิ่มรายชื่อในหน้า admin" />
      )}

      <div className="stack">
        <h2>Assignments</h2>
        {visibleAssignments.map((assignment) => {
          const section = sections.find((item) => item.id === assignment.sectionId);
          const submission = mySubmissions.find((item) => item.assignmentId === assignment.id);
          const grade = submission ? grades.find((item) => item.submissionId === submission.id) : null;
          return (
            <section className="card" key={assignment.id}>
              <h3>{assignment.title}</h3>
              <p className="muted">{section?.code} · Due {assignment.dueAt || "-"}</p>
              <p>{assignment.instructions}</p>
              {submission ? (
                <p><span className="badge">{submission.status}</span> {grade ? `คะแนน ${grade.score}: ${grade.feedback}` : "รอตรวจ"}</p>
              ) : null}
              <form className="form" action={submitAssignmentAction}>
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <label className="field">คำตอบ/หมายเหตุ<textarea name="textAnswer" rows={4} /></label>
                <label className="field">ไฟล์งาน<input name="file" type="file" /></label>
                <button type="submit">{submission ? "ส่งใหม่" : "ส่งงาน"}</button>
              </form>
            </section>
          );
        })}
      </div>
    </div>
  );
}
