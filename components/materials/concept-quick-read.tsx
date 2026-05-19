import type { LessonBlock } from "@/lib/materials/types";

export function ConceptQuickRead({ blocks }: { blocks: LessonBlock[] }) {
  if (!blocks.length) return null;

  return (
    <section>
      <h2>Mini concepts</h2>
      <div className="concept-grid">
        {blocks.map((block) => (
          <article className="concept-card" key={block.title}>
            <h3>{block.title}</h3>
            <p>{block.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
