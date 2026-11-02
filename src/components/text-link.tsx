import { cx } from "@/lib/cx";

type TextLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Inline link. Always underlined, the underline thickens on hover. */
export function TextLink({ className, children, ...rest }: TextLinkProps) {
  return (
    <a
      className={cx(
        "text-fg underline decoration-1 underline-offset-[0.2em] transition-[text-decoration-thickness] duration-[var(--duration)] hover:decoration-2",
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
