import { cx } from "@/lib/cx";

type TextProps = {
  variant?: "lead" | "body" | "small";
  muted?: boolean;
  as?: "p" | "div" | "span";
  className?: string;
  children: React.ReactNode;
};

const variants = {
  lead: "text-lg md:text-xl",
  body: "text-base",
  small: "text-sm",
};

/** Reading text in the serif. Kept to the measure so lines stay readable. */
export function Text({ variant = "body", muted = false, as: Tag = "p", className, children }: TextProps) {
  return (
    <Tag
      className={cx(
        "max-w-[var(--measure)] text-pretty",
        variants[variant],
        muted ? "text-fg-muted" : "text-fg",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
