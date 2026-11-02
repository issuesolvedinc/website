import { cx } from "@/lib/cx";

/** Page width and side margins. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-[var(--page-max)] px-[var(--gutter)]", className)}>{children}</div>;
}
