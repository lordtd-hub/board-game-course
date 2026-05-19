import Link from "next/link";
import { materialWeeks } from "@/lib/materials/course-map";
import { listMaterialProgress, sectionsForStudent } from "@/lib/repository";
import { requireRole } from "@/lib/session";
import { sameEmail } from "@/lib/utils";

export default async function MaterialsPage() {
  const user = await requireRole(["student", "instructor", "super_admin"]);
  const [sections, progressRows] = await Promise.all([
    sectionsForStudent(user.email).catch(() => []),
    listMaterialProgress().catch(() => [])
  ]);
  const sectionIds = new Set(sections.map((section) => section.id));
  const completedWeeks = new Set(
    progressRows
      .filter((progress) => sameEmail(progress.studentEmail, user.email) && sectionIds.has(progress.sectionId))
      .map((progress) => progress.week)
  );

  return (
    <div className="stack">
      <section className="lesson-hero">
        <div>
          <p className="badge">Interactive HTML</p>
          <h1>สื่อการสอนรายสัปดาห์</h1>
          <p className="muted">บทเรียนแบบเล่นก่อน ทฤษฎีตามหลัง สำหรับใช้ในห้องเรียนและทบทวนก่อนส่งงาน</p>
        </div>
      </section>

      <section className="week-grid">
        {materialWeeks.map((week) => (
          <Link className="week-card" href={`/materials/week/${week.week}`} key={week.week}>
            <div>
              <p className="badge">Week {week.week}</p>
              <h2>{week.title}</h2>
              <p className="muted">{week.englishTitle}</p>
            </div>
            <div className="chip-row">
              {week.games.map((game) => <span className="game-chip" key={game}>{game}</span>)}
            </div>
            <p className="muted">{week.activities.length} activities ยท {week.worksheet}</p>
            <span className={completedWeeks.has(String(week.week)) ? "status-dot done" : "status-dot"}>
              {completedWeeks.has(String(week.week)) ? "completed" : week.status}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
