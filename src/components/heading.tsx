import { cx } from "@/lib/cx";

type HeadingProps = {
  level: 1 | 2 | 3;
  /** Visual size, when it should differ from the level. */
  size?: 1 | 2 | 3;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

const sizes = {
  1: "text-2xl md:text-3xl font-semibold tracking-[-0.015em]",
  2: "text-xl md:text-2xl font-semibold tracking-[-0.01em]",
  3: "text-lg font-semibold",
};

/** Serif heading. One h1 per page. */
export function Heading({ level, size, id, className, children }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={cx("font-serif text-balance text-fg", sizes[size ?? level], className)}>
      {children}
    </Tag>
  );
}
