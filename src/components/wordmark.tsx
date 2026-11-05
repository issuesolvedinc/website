import { cx } from "@/lib/cx";

type WordmarkProps = {
  className?: string;
  /** Set to true when visible text next to it already says IssueSolved. */
  decorative?: boolean;
};

/**
 * The IssueSolved wordmark, set in the site's sans. Size it with a text size class. Takes the current text color, so
 * it is ink on paper and chalk on night.
 */
export function Wordmark({ className, decorative = false }: WordmarkProps) {
  return (
    <span
      className={cx("block font-sans font-semibold leading-none tracking-[-0.02em]", className)}
      {...(decorative ? { "aria-hidden": true } : {})}
    >
      IssueSolved
    </span>
  );
}
