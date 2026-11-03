"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { LINE_PATHS } from "./lines-paths";
import { seeded } from "./seeded";

export type BackgroundLinesProps = {
  children?: React.ReactNode;
  className?: string;
  /** Seconds for one run along a line. */
  duration?: number;
  /** Two layers draw a second, thicker stroke on each line. One is lighter on phones. */
  layers?: 1 | 2;
};

/** Every other line in the accent, the rest in the muted text color. */
const stroke = (i: number) => (i % 3 === 0 ? "var(--accent)" : "var(--fg-muted)");

/**
 * Short strokes that run out from the centre along curved lines, behind the content.
 * With reduced motion the lines are drawn once, faint and still.
 */
export function BackgroundLines({ children, className, duration = 10, layers = 1 }: BackgroundLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const reduced = useReducedMotion();
  const moving = inView && !reduced;

  return (
    <div ref={ref} className={cx("relative isolate overflow-hidden", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      >
        {!moving &&
          LINE_PATHS.map((d, i) => (
            <path key={i} d={d} style={{ stroke: stroke(i) }} strokeOpacity="0.22" strokeWidth="1" strokeLinecap="round" />
          ))}
        {moving &&
          Array.from({ length: layers }, (_, layer) =>
            LINE_PATHS.map((d, i) => (
              <motion.path
                key={`${layer}-${i}`}
                d={d}
                style={{ stroke: stroke(i) }}
                strokeWidth={layer + 1}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 800, strokeDasharray: "50 800", opacity: 0 }}
                animate={{ strokeDashoffset: 0, strokeDasharray: "20 800", opacity: [0, 1, 1, 0] }}
                transition={{
                  duration,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: seeded(i, layer + 1) * 4,
                  repeatDelay: seeded(i, layer + 5) * 6 + 1,
                }}
              />
            )),
          )}
      </svg>
      {children}
    </div>
  );
}
