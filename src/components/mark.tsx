import { cx } from "@/lib/cx";

/**
 * The IssueSolved mark (final, 2026-11-05, docs/design/brand/round32): a square cut on the diagonal into an emerald
 * lower triangle and a navy upper triangle, a white wedge along the cut, and an orange dot. All filled. The emerald
 * and navy switch for dark (globals.css, .mark). Size it with a text size class (it is 1em square, the view cropped to the shapes). Decorative by
 * default: the wordmark next to it names it.
 */
export function Mark({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="6.5 6.5 27 27"
      className={cx("mark h-[1em] w-[1em] shrink-0", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path d="M7 33 L33 33 L33 20 Z" className="mark-low" />
      <path d="M7 33 L33 20 L33 7 Z" className="mark-high" />
      <path d="M7 33 L33 17.7 L33 22.3 Z" fill="#FFFFFF" />
      <circle cx="13.64" cy="13.64" r="6.5" fill="#FF9A00" />
    </svg>
  );
}
