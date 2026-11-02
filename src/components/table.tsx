import { cx } from "@/lib/cx";

type TableProps = {
  columns: string[];
  rows: React.ReactNode[][];
  /** Read by screen readers. Shown as a typewriter label when visible is true. */
  caption?: string;
  captionVisible?: boolean;
  className?: string;
};

/** A plain table: typewriter headers, thin rules between rows, the first column as the row header. */
export function Table({ columns, rows, caption, captionVisible = false, className }: TableProps) {
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left">
        {caption && (
          <caption
            className={cx(
              captionVisible ? "pb-3 text-left font-mono text-xs uppercase tracking-[0.08em] text-fg-muted" : "sr-only",
            )}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b-[length:var(--rule-width-strong)] border-fg">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="py-2 pr-4 align-bottom font-mono text-xs font-normal uppercase tracking-[0.08em] text-fg-muted last:pr-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-rule">
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="w-[38%] py-4 pr-4 align-top font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={j} className="py-4 pr-4 align-top last:pr-0">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
