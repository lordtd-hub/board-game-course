import { listAssignments, listGrades, listSubmissions } from "@/lib/repository";
import { requireRole } from "@/lib/session";
import { TableWrap } from "@/components/table";

export default async function GradesPage() {
  await requireRole(["super_admin", "instructor"]);
  const [grades, submissions, assignments] = await Promise.all([listGrades(), listSubmissions(), listAssignments()]);

  return (
    <div className="stack">
      <h1>Grades</h1>
      <TableWrap>
        <table>
          <thead><tr><th>Student</th><th>Assignment</th><th>Score</th><th>Feedback</th><th>Graded by</th><th>At</th></tr></thead>
          <tbody>
            {grades.map((grade) => {
              const submission = submissions.find((item) => item.id === grade.submissionId);
              const assignment = assignments.find((item) => item.id === grade.assignmentId);
              return (
                <tr key={grade.id}>
                  <td>{submission?.studentEmail || grade.studentEmail}</td>
                  <td>{assignment?.title || grade.assignmentId}</td>
                  <td>{grade.score}</td>
                  <td>{grade.feedback}</td>
                  <td>{grade.gradedBy}</td>
                  <td>{grade.gradedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
