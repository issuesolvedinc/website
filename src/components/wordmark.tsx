import { cx } from "@/lib/cx";

type WordmarkProps = {
  className?: string;
  /** Set to true when visible text next to it already says IssueSolved. */
  decorative?: boolean;
};

/**
 * The IssueSolved wordmark, drawn like two nodes of the process flow: "Issue" in a rounded, dashed orange outline
 * (work still waiting), then "Solved" in italic inside a square cornered green outline (work done). Both words take the text colour. No fills, no check.
 * Size it with a text size class.
 */
export function Wordmark({ className, decorative = false }: WordmarkProps) {
  return (
    <span
      className={cx("wordmark inline-flex items-center font-sans font-semibold leading-none tracking-[-0.02em]", className)}
      {...(decorative ? { "aria-hidden": true } : {})}
    >
      <span className="wordmark-issue">Issue</span>
      <span className="wordmark-solved">Solved</span>
    </span>
  );
}
