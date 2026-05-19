import { notFound } from "next/navigation";
import { ConceptQuickRead } from "@/components/materials/concept-quick-read";
import { ExitTicketForm } from "@/components/materials/exit-ticket-form";
import { LessonShell } from "@/components/materials/lesson-shell";
import { TeachToPlayCard } from "@/components/materials/teach-to-play-card";
import { WeekOneInteractive } from "@/components/materials/week-one-interactive";
import { getMaterialWeek } from "@/lib/materials/course-map";
import { listMaterialProgress, sectionsForStudent } from "@/lib/repository";
import { getSessionUser } from "@/lib/session";
import { sameEmail } from "@/lib/utils";

export default async function MaterialWeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week: weekParam } = await params;
  const weekNo = Number(weekParam);
  const week = getMaterialWeek(weekNo);
  if (!week) notFound();

  const user = await getSessionUser();
  const [sections, progressRows] = user
    ? await Promise.all([
        sectionsForStudent(user.email).catch(() => []),
        listMaterialProgress().catch(() => [])
      ])
    : [[], []];
  const sectionIds = new Set(sections.map((section) => section.id));
  const existingProgress = progressRows.find(
    (progress) =>
      user &&
      sameEmail(progress.studentEmail, user.email) &&
      progress.week === String(week.week) &&
      sectionIds.has(progress.sectionId)
  );

  if (week.week === 1) {
    return <WeekOneInteractive />;
  }

  return (
    <LessonShell week={week}>
      {week.teachToPlay.length ? (
        <section className="stack">
          <h2>Teach-to-play cards</h2>
          <div className="teach-card-grid">
            {week.teachToPlay.map((card) => <TeachToPlayCard card={card} key={card.game} />)}
          </div>
        </section>
      ) : null}

      <ConceptQuickRead blocks={week.conceptBlocks} />

      <section className="activity-panel">
        <p className="badge">Coming next</p>
        <h2>Interactive activities for Week {week.week}</h2>
        <div className="concept-grid">
          {week.activities.map((activity) => (
            <article className="concept-card" key={activity.id}>
              <h3>{activity.title}</h3>
              <p>{activity.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lesson-band">
        <div>
          <h2>Worksheet</h2>
          <p>{week.worksheet}</p>
        </div>
        <div>
          <h2>{week.submissionTitle}</h2>
          <p>{week.submissionPrompt}</p>
        </div>
      </section>

      {user?.role === "student" ? (
        <ExitTicketForm
          week={week}
          sections={sections}
          defaultValue={existingProgress?.exitTicket}
          completed={Boolean(existingProgress)}
        />
      ) : (
        <section className="card">
          <h2>{user ? "Instructor preview" : "Public preview"}</h2>
          <p className="muted">ดู outline ได้ทันที ถ้าต้องการส่ง exit ticket ให้ login เป็นนักศึกษา</p>
        </section>
      )}
    </LessonShell>
  );
}
