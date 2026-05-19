import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { EmptyState, TableWrap } from "@/components/table";
import { materialWeeks } from "@/lib/materials/course-map";
import { materialCompletionForSectionIds, sectionsForInstructor, listSections } from "@/lib/repository";
import { requireRole } from "@/lib/session";

export default async function InstructorMaterialsPage() {
  const user = await requireRole(["super_admin", "instructor"]);
  const sections = await (user.role === "super_admin" ? listSections() : sectionsForInstructor(user.email)).catch(() => []);
  const sectionIds = sections.map((section) => section.id);
  const completion = await materialCompletionForSectionIds(sectionIds, "1").catch(() => ({
    students: 0,
    completed: 0,
    pendingWeek1: 0,
    progressRows: []
  }));

  return (
    <div className="stack">
      <section className="lesson-hero">
        <div>
          <p className="badge">Instructor</p>
          <h1>Materials dashboard</h1>
          <p className="muted">เปิด preview สื่อรายสัปดาห์และดู completion ของ exit ticket เบื้องต้น</p>
        </div>
        <Link className="button" href="/materials/week/1">เปิด Week 1</Link>
      </section>

      <section className="grid">
        <MetricCard label="Sections" value={sections.length} />
        <MetricCard label="Students" value={completion.students} />
        <MetricCard label="Week 1 completed" value={completion.completed} />
        <MetricCard label="Week 1 pending" value={completion.pendingWeek1} />
      </section>

      {sections.length ? (
        <TableWrap>
          <h2>Weekly materials</h2>
          <table>
            <thead>
              <tr><th>Week</th><th>Title</th><th>Games</th><th>Status</th><th>Open</th></tr>
            </thead>
            <tbody>
              {materialWeeks.map((week) => (
                <tr key={week.week}>
                  <td>Week {week.week}</td>
                  <td>{week.title}</td>
                  <td>{week.games.join(", ")}</td>
                  <td><span className="badge">{week.status}</span></td>
                  <td><Link className="badge" href={`/materials/week/${week.week}`}>preview</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <EmptyState title="ยังไม่มี section" detail="ต้องผูกบัญชีอาจารย์กับ section ก่อนจึงจะเห็น dashboard ของสื่อ" />
      )}

      <TableWrap>
        <h2>Week 1 exit tickets</h2>
        <table>
          <thead>
            <tr><th>Student</th><th>Section</th><th>Completed</th><th>Exit ticket</th></tr>
          </thead>
          <tbody>
            {completion.progressRows.map((progress) => {
              const section = sections.find((item) => item.id === progress.sectionId);
              return (
                <tr key={progress.id}>
                  <td>{progress.studentEmail}</td>
                  <td>{section?.code || progress.sectionId}</td>
                  <td>{progress.completedAt}</td>
                  <td>{progress.exitTicket}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
