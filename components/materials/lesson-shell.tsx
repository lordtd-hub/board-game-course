import type { MaterialWeek } from "@/lib/materials/types";

export function LessonShell({ week, children }: { week: MaterialWeek; children: React.ReactNode }) {
  return (
    <div className="material-page stack">
      <section className="lesson-hero">
        <div>
          <p className="badge">Week {week.week}</p>
          <h1>{week.title}</h1>
          <p className="muted">{week.englishTitle}</p>
        </div>
        <div className="lesson-status">
          <span>{week.status === "complete" ? "Interactive lesson" : "Lesson outline"}</span>
        </div>
      </section>

      <section className="lesson-band">
        <div>
          <h2>เป้าหมายคาบนี้</h2>
          <ul className="check-list">
            {week.learningOutcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>เกมที่ใช้</h2>
          <div className="chip-row">
            {week.games.map((game) => (
              <span className="game-chip" key={game}>{game}</span>
            ))}
          </div>
          <p className="muted">Source: {week.chapterSource}</p>
        </div>
      </section>

      {children}
    </div>
  );
}
