import { cx } from "@/lib/cx";
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "./wordmark-path";

type WordmarkProps = {
  className?: string;
  /** Set to true when visible text next to it already says IssueSolved. */
  decorative?: boolean;
};

/** The IssueSolved wordmark. Takes the current text color, so it is ink on paper and chalk on night. */
export function Wordmark({ className, decorative = false }: WordmarkProps) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      fill="currentColor"
      className={cx("block h-auto", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "IssueSolved" })}
    >
      <path d={WORDMARK_PATH} />
    </svg>
  );
}
