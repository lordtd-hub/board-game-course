import { createAssignmentAction } from "@/lib/actions";
import { listSections, sectionsForInstructor } from "@/lib/repository";
import { requireRole } from "@/lib/session";

export default async function NewAssignmentPage() {
  const user = await requireRole(["super_admin", "instructor"]);
  const sections = user.role === "super_admin" ? await listSections() : await sectionsForInstructor(user.email);

  return (
    <div className="stack">
      <section>
        <h1>สร้างงานใหม่</h1>
        <p className="muted">ใช้สำหรับ worksheet, reflection, แบบฝึกหัด หรือรายงานกลุ่ม โดยยังไม่ผูกเนื้อหารายสัปดาห์จริง</p>
      </section>

      <form className="card form" action={createAssignmentAction}>
        <label className="field">Section
          <select name="sectionId" required>
            {sections.map((section) => <option key={section.id} value={section.id}>{section.code} · {section.title}</option>)}
          </select>
        </label>
        <label className="field">Module/week placeholder<input name="moduleNo" placeholder="1 หรือ blank" /></label>
        <label className="field">ชื่องาน<input name="title" required /></label>
        <label className="field">คำชี้แจง<textarea name="instructions" required rows={6} /></label>
        <label className="field">กำหนดส่ง<input name="dueAt" type="datetime-local" /></label>
        <label className="field">คะแนนเต็ม<input name="maxScore" defaultValue="10" inputMode="decimal" /></label>
        <label className="field">ชนิดไฟล์ที่อนุญาต<input name="allowedFileTypes" defaultValue="pdf,docx,jpg,png" /></label>
        <label className="field">ขนาดไฟล์สูงสุด MB<input name="maxFileMb" defaultValue="20" inputMode="numeric" /></label>
        <label className="field">Resubmit policy
          <select name="resubmitPolicy" defaultValue="allowed">
            <option value="allowed">allowed</option>
            <option value="locked">locked</option>
          </select>
        </label>
        <label className="field">Status
          <select name="status" defaultValue="published">
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </label>
        <button type="submit">สร้างงาน</button>
      </form>
    </div>
  );
}
