import type { TeachToPlayCard } from "@/lib/materials/types";

export function TeachToPlayCard({ card }: { card: TeachToPlayCard }) {
  return (
    <article className="teach-card">
      <div>
        <p className="badge">{card.game}</p>
        <h3>{card.goal}</h3>
      </div>
      <div className="teach-grid">
        <div>
          <h4>Turn loop</h4>
          <ol>
            {card.turnLoop.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
        <div>
          <h4>First 3 decisions</h4>
          <ul>
            {card.firstDecisions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4>ยังไม่ต้องกังวล</h4>
          <ul>
            {card.doNotWorryYet.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className="prompt-strip">
        <strong>Play now:</strong> {card.playNowPrompt}
      </div>
      <div className="prompt-strip secondary">
        <strong>Debrief:</strong> {card.debriefPrompt}
      </div>
    </article>
  );
}
