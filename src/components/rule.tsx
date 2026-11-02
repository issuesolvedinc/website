import { cx } from "@/lib/cx";

/** Horizontal rule between sections. "strong" is ink colored and twice as thick. */
export function Rule({ strong = false, className }: { strong?: boolean; className?: string }) {
  return (
    <hr
      className={cx(
        "border-0",
        strong ? "border-t-[length:var(--rule-width-strong)] border-fg" : "border-t-[length:var(--rule-width)] border-rule",
        className,
      )}
    />
  );
}
