import { cx } from "@/lib/cx";
import { Label } from "./label";

export type FlowStep = {
  title: string;
  detail?: string;
  /** "strong" is filled with ink, "quiet" is dashed and muted. */
  weight?: "normal" | "strong" | "quiet";
};

type ProcessFlowProps = {
  steps: FlowStep[];
  caption?: string;
  className?: string;
};

const boxes = {
  normal: "border border-fg text-fg",
  strong: "border border-fg bg-fg text-bg",
  quiet: "border border-dashed border-rule text-fg-muted",
};

/** A static process flow: boxes joined by arrows. Stacks on narrow screens, runs left to right on wide ones. */
export function ProcessFlow({ steps, caption, className }: ProcessFlowProps) {
  return (
    <figure className={className}>
      <ol className="grid gap-12 lg:grid-flow-col lg:auto-cols-fr lg:gap-12">
        {steps.map((step, i) => {
          const weight = step.weight ?? "normal";
          const last = i === steps.length - 1;
          return (
            <li key={step.title} className="relative">
              <div className={cx("flex h-full flex-col gap-2 px-5 py-4", boxes[weight])}>
                <span
                  className={cx(
                    "font-mono text-xs uppercase tracking-[0.08em]",
                    weight === "strong" ? "text-bg" : "text-fg-muted",
                  )}
                >
                  Step {i + 1}
                </span>
                <span className="text-lg font-semibold">{step.title}</span>
                {step.detail && (
                  <span className={cx("text-sm", weight === "strong" ? "text-bg" : "text-fg-muted")}>
                    {step.detail}
                  </span>
                )}
              </div>
              {!last && <Arrow quiet={steps[i + 1]?.weight === "quiet"} />}
            </li>
          );
        })}
      </ol>
      {caption && (
        <Label as="figcaption" className="mt-4 block">
          {caption}
        </Label>
      )}
    </figure>
  );
}

/** Arrow to the next step. Points down when stacked and right when in a row. */
function Arrow({ quiet }: { quiet: boolean }) {
  const stroke = quiet ? "stroke-fg-muted" : "stroke-fg";
  const dash = quiet ? "4 4" : undefined;
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 48"
        className={cx("absolute left-1/2 top-full h-12 w-4 -translate-x-1/2 fill-none lg:hidden", stroke)}
      >
        <path d="M8 4 V42" strokeWidth="1.5" strokeDasharray={dash} />
        <path d="M3 37 L8 43 L13 37" strokeWidth="1.5" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 48 16"
        className={cx("absolute left-full top-1/2 hidden h-4 w-12 -translate-y-1/2 fill-none lg:block", stroke)}
      >
        <path d="M4 8 H42" strokeWidth="1.5" strokeDasharray={dash} />
        <path d="M37 3 L43 8 L37 13" strokeWidth="1.5" />
      </svg>
    </>
  );
}
