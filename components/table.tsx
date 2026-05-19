export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <p className="muted">{detail}</p>
    </section>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="table-wrap card">{children}</div>;
}
