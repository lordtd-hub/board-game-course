import { completeMaterialAction } from "@/lib/actions";
import type { MaterialWeek } from "@/lib/materials/types";
import type { Section } from "@/lib/types";

type Props = {
  week: Pick<MaterialWeek, "week" | "exitTicket">;
  sections: Section[];
  defaultValue?: string;
  completed?: boolean;
};

export function ExitTicketForm({ week, sections, defaultValue = "", completed = false }: Props) {
  if (!sections.length) {
    return (
      <section className="card">
        <h2>Exit ticket</h2>
        <p className="muted">เข้าร่วม section ก่อน จึงจะส่ง exit ticket ได้</p>
      </section>
    );
  }

  return (
    <form className="card form exit-ticket" action={completeMaterialAction}>
      <input type="hidden" name="week" value={week.week} />
      <h2>{week.exitTicket.title}</h2>
      <p className="muted">{week.exitTicket.prompt}</p>
      <label className="field">
        Section
        <select name="sectionId" defaultValue={sections[0]?.id}>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>{section.code} - {section.title}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Reflection
        <textarea name="exitTicket" rows={5} required minLength={20} defaultValue={defaultValue} />
      </label>
      <button type="submit">{completed ? "อัปเดต exit ticket" : "ส่ง exit ticket"}</button>
    </form>
  );
}
