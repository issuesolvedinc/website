"use client";

import { memo, useId, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { safeId, seeded } from "./seeded";

/** The full set of curves from the first landing page: each one shifted 7 right and 8 up from the last. */
const TOTAL = 58;
function beamPath(i: number) {
  const p = (x: number, y: number) => `${x + 7 * i} ${y - 8 * i}`;
  return `M${p(-380, -189)}C${p(-380, -189)} ${p(-312, 216)} ${p(152, 343)}C${p(616, 470)} ${p(684, 875)} ${p(684, 875)}`;
}
const ALL_PATHS = Array.from({ length: TOTAL }, (_, i) => beamPath(i)).join("");

export type BackgroundBeamsProps = {
  className?: string;
  /** How many curves carry a moving light. Fewer is lighter on phones. */
  count?: number;
  /** Seconds for the slowest light to cross. */
  speed?: number;
};

/**
 * Curves that sweep across the area behind its content, with lights in the accent running along them.
 * Fills its positioned parent. Still when reduced motion is on, paused when off screen.
 */
export const BackgroundBeams = memo(function BackgroundBeams({ className, count = 20, speed = 20 }: BackgroundBeamsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const reduced = useReducedMotion();
  const id = safeId(useId());
  const beams = useMemo(() => {
    const n = Math.max(1, Math.min(count, TOTAL));
    return Array.from({ length: n }, (_, k) => Math.round((k * (TOTAL - 1)) / Math.max(1, n - 1)));
  }, [count]);
  const moving = inView && !reduced;

  return (
    <div ref={ref} aria-hidden="true" className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 696 316"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path d={ALL_PATHS} style={{ stroke: "var(--fg)" }} strokeOpacity="0.07" strokeWidth="0.5" />
        {beams.map((i, k) => (
          <path key={i} d={beamPath(i)} stroke={`url(#${id}-${k})`} strokeWidth="0.6" />
        ))}
        <defs>
          {beams.map((i, k) => {
            const stops = (
              <>
                <stop style={{ stopColor: "var(--accent)" }} stopOpacity="0" />
                <stop offset="20%" style={{ stopColor: "var(--accent)" }} />
                <stop offset="45%" style={{ stopColor: "var(--fg)" }} stopOpacity="0.5" />
                <stop offset="100%" style={{ stopColor: "var(--fg)" }} stopOpacity="0" />
              </>
            );
            if (!moving) {
              // A still light part way along each curve.
              const at = 25 + seeded(i, 1) * 50;
              return (
                <linearGradient key={i} id={`${id}-${k}`} x1={`${at - 20}%`} y1={`${at - 20}%`} x2={`${at}%`} y2={`${at}%`}>
                  {stops}
                </linearGradient>
              );
            }
            return (
              <motion.linearGradient
                key={i}
                id={`${id}-${k}`}
                initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
                animate={{ x1: ["0%", "100%"], x2: ["0%", "95%"], y1: ["0%", "100%"], y2: ["0%", `${93 + seeded(i, 2) * 8}%`] }}
                transition={{
                  duration: speed / 2 + seeded(i, 3) * (speed / 2),
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: seeded(i, 4) * 10,
                }}
              >
                {stops}
              </motion.linearGradient>
            );
          })}
        </defs>
      </svg>
    </div>
  );
});
