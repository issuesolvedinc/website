import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary";

type ButtonProps =
  | ({ href: string; variant?: Variant } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined; variant?: Variant } & React.ButtonHTMLAttributes<HTMLButtonElement>);

const base =
  "inline-flex min-h-11 items-center justify-center border border-fg px-5 py-2 font-sans text-sm font-medium transition-colors duration-[var(--duration)] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-bg hover:text-fg",
  secondary: "bg-transparent text-fg hover:bg-fill",
};

/** A link or button with square corners. Renders an anchor when given an href. */
export function Button(props: ButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cx(base, variants[variant], className);
  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
