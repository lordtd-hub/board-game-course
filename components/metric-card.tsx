export function MetricCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <section className="card metric-card">
      <div className="muted">{label}</div>
      <div className="metric">{value}</div>
      {note ? <div className="muted">{note}</div> : null}
    </section>
  );
}
