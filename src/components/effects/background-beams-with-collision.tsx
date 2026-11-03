"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { seeded } from "./seeded";

export type FallingBeam = {
  /** Distance from the left edge, in percent of the width. */
  x: number;
  /** Seconds to fall to the floor. */
  duration: number;
  /** Seconds before the first fall. */
  delay?: number;
  /** Seconds between falls. */
  repeatDelay?: number;
  /** Length in pixels. */
  length?: number;
};

const DEFAULT_BEAMS: FallingBeam[] = [
  { x: 4, duration: 5, repeatDelay: 3, delay: 2 },
  { x: 46, duration: 3, repeatDelay: 3, delay: 4 },
  { x: 12, duration: 5, repeatDelay: 7, length: 24 },
  { x: 32, duration: 4, repeatDelay: 10, delay: 4 },
  { x: 64, duration: 7, repeatDelay: 2, length: 80 },
  { x: 80, duration: 3.5, repeatDelay: 2, length: 48 },
  { x: 94, duration: 4.5, repeatDelay: 4, delay: 2, length: 24 },
];

export type BackgroundBeamsWithCollisionProps = {
  children?: React.ReactNode;
  className?: string;
  beams?: FallingBeam[];
};

/**
 * Lights fall from the top and break into sparks on the floor line at the bottom.
 * The area takes its height from className (the first landing page used h-96 md:h-[40rem]).
 * With reduced motion the lights hang still part way down and nothing breaks.
 */
export function BackgroundBeamsWithCollision({ children, className, beams = DEFAULT_BEAMS }: BackgroundBeamsWithCollisionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [floor, setFloor] = useState(0);
  const inView = useInView(ref, { margin: "120px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFloor(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const moving = inView && !reduced && floor > 0;

  return (
    <div ref={ref} className={cx("relative isolate flex w-full items-center justify-center overflow-hidden", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {beams.map((b, i) =>
          moving ? (
            <Beam key={i} beam={b} floor={floor} index={i} />
          ) : (
            <span
              key={i}
              className="absolute w-px rounded-full bg-gradient-to-t from-accent to-transparent"
              style={{ left: `${b.x}%`, top: `${15 + seeded(i, 7) * 55}%`, height: b.length ?? 56 }}
            />
          ),
        )}
        <div className="absolute inset-x-0 bottom-0 h-px bg-rule" />
      </div>
      {children}
    </div>
  );
}

function Beam({ beam, floor, index }: { beam: FallingBeam; floor: number; index: number }) {
  const length = beam.length ?? 56;
  const [cycle, setCycle] = useState(0);
  const [burst, setBurst] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      {!burst && (
        <motion.span
          key={cycle}
          className="absolute top-0 w-px rounded-full bg-gradient-to-t from-accent to-transparent"
          style={{ left: `${beam.x}%`, height: length }}
          initial={{ y: -length - 40 }}
          animate={{ y: floor - length }}
          transition={{
            duration: beam.duration,
            ease: "linear",
            delay: cycle === 0 ? (beam.delay ?? 0) : (beam.repeatDelay ?? 0),
          }}
          onAnimationComplete={() => {
            setBurst(true);
            timer.current = setTimeout(() => {
              setBurst(false);
              setCycle((c) => c + 1);
            }, 1400);
          }}
        />
      )}
      <AnimatePresence>{burst && <Burst key={cycle} x={beam.x} seed={index * 31 + cycle} />}</AnimatePresence>
    </>
  );
}

/** Sparks where a light meets the floor. Twelve, so a phone keeps up. */
function Burst({ x, seed }: { x: number; seed: number }) {
  return (
    <div className="absolute bottom-0 h-2 w-2 -translate-x-1/2" style={{ left: `${x}%` }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent blur-sm"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: seeded(seed + i, 1) * 80 - 40, y: -10 - seeded(seed + i, 2) * 50, opacity: 0 }}
          transition={{ duration: 0.5 + seeded(seed + i, 3) * 1.2, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-accent"
        />
      ))}
    </div>
  );
}
