import { cx } from "@/lib/cx";
import { Label } from "./label";

type NoteProps = {
  title?: string;
  /** "error" is the only place the red appears. */
  tone?: "default" | "error";
  className?: string;
  children: React.ReactNode;
};

/** A boxed note set apart from the reading text. */
export function Note({ title, tone = "default", className, children }: NoteProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : undefined}
      className={cx(
        "max-w-[var(--measure)] border bg-fill px-5 py-4",
        isError ? "border-error" : "border-rule",
        className,
      )}
    >
      {title && (
        <Label as="p" tone={isError ? "error" : "default"} className="mb-2">
          {title}
        </Label>
      )}
      <div className="text-base text-fg">{children}</div>
    </div>
  );
}
