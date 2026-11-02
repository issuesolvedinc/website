import { cx } from "@/lib/cx";

type LabelProps = {
  as?: "span" | "p" | "div" | "dt" | "figcaption" | "th";
  tone?: "default" | "muted" | "error";
  size?: "xs" | "sm";
  className?: string;
  children: React.ReactNode;
};

const tones = { default: "text-fg", muted: "text-fg-muted", error: "text-error" };

/** Typewriter label for small details: section numbers, captions, table headers. */
export function Label({ as: Tag = "span", tone = "muted", size = "xs", className, children }: LabelProps) {
  return (
    <Tag className={cx("font-mono uppercase tracking-[0.08em]", size === "sm" ? "text-sm" : "text-xs", tones[tone], className)}>{children}</Tag>
  );
}
