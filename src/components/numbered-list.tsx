type NumberedListProps = {
  items: { title: string; text: string }[];
};

/** A numbered list of short statements, each a bold line and one sentence. */
export function NumberedList({ items }: NumberedListProps) {
  return (
    <ol className="max-w-[var(--measure)] divide-y divide-rule border-y border-rule">
      {items.map((item, i) => (
        <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] py-5">
          <span aria-hidden="true" className="pt-1 font-mono text-sm text-fg-muted">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-fg-muted">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
