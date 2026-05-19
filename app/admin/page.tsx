import { changeRoleAction, createSectionAction, enrollStudentAction } from "@/lib/actions";
import { dashboardForSectionIds, listEnrollments, listSections, listUsers } from "@/lib/repository";
import { requireRole } from "@/lib/session";
import { MetricCard } from "@/components/metric-card";
import { TableWrap } from "@/components/table";

export default async function AdminPage() {
  await requireRole(["super_admin"]);
  const [users, sections, enrollments] = await Promise.all([listUsers(), listSections(), listEnrollments()]);
  const stats = await dashboardForSectionIds(sections.map((section) => section.id));

  return (
    <div className="stack">
      <section>
        <h1>Admin</h1>
        <p className="muted">จัดการผู้ใช้, section, instructor และ enrollment</p>
      </section>

      <section className="grid">
        <MetricCard label="Sections" value={stats.sections} />
        <MetricCard label="Students" value={stats.students} />
        <MetricCard label="Assignments" value={stats.assignments} />
        <MetricCard label="Submissions" value={stats.submissions} />
      </section>

      <section className="grid">
        <form className="card form" action={createSectionAction}>
          <h2>เพิ่ม Section</h2>
          <label className="field">รหัส section<input name="code" required placeholder="SEC-01" /></label>
          <label className="field">ชื่อ<input name="title" required placeholder="Board Game Section 1" /></label>
          <label className="field">เทอม<input name="term" required placeholder="2569/1" /></label>
          <label className="field">อีเมลอาจารย์<input name="instructorEmail" required type="email" /></label>
          <label className="field">Enrollment code<input name="enrollmentCode" required placeholder="BG-SEC1" /></label>
          <button type="submit">บันทึก section</button>
        </form>

        <form className="card form" action={enrollStudentAction}>
          <h2>เพิ่มนักศึกษาเข้า Section</h2>
          <label className="field">Section
            <select name="sectionId" required>
              {sections.map((section) => <option key={section.id} value={section.id}>{section.code}</option>)}
            </select>
          </label>
          <label className="field">อีเมลนักศึกษา<input name="studentEmail" required type="email" /></label>
          <button type="submit">เพิ่ม enrollment</button>
        </form>
      </section>

      <TableWrap>
        <h2>Users</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Change role</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge">{user.role}</span></td>
                <td>{user.status}</td>
                <td>
                  <form action={changeRoleAction} className="nav">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="role" defaultValue={user.role}>
                      <option value="super_admin">super_admin</option>
                      <option value="instructor">instructor</option>
                      <option value="student">student</option>
                    </select>
                    <button type="submit">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      <TableWrap>
        <h2>Sections</h2>
        <table>
          <thead><tr><th>Code</th><th>Title</th><th>Term</th><th>Instructor</th><th>Enrollment code</th><th>Students</th></tr></thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id}>
                <td>{section.code}</td>
                <td>{section.title}</td>
                <td>{section.term}</td>
                <td>{section.instructorEmail}</td>
                <td><code>{section.enrollmentCode}</code></td>
                <td>{enrollments.filter((item) => item.sectionId === section.id && item.status === "active").length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
