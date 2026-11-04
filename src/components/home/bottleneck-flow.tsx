"use client";

import { useEffect, useRef, useState } from "react";
import { AgentFlow } from "@/components/agent-flow/agent-flow";
import { BackgroundBeams } from "@/components/effects/background-beams";
import { cx } from "@/lib/cx";
import type { FlowChange } from "@/lib/flow/definition";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

type Side = "before" | "after";

/** Milliseconds between two changes of the queue: it fills slowly before and drains fast after. */
const TICK = { before: 1000, after: 500 };
/** Ticks the picture rests on a full queue, and on an empty one, before it turns. */
const HOLD_FULL = 3;
const HOLD_EMPTY = 8;

/**
 * One small flow, shown before and after an agent takes part of the work. It plays on its own: work piles up
 * at the bottleneck, the agent steps in, the pile drains, and it starts again. The switch sets a side by hand and
 * pauses the loop. With reduced motion the two sides are drawn still, next to each other.
 */
export function BottleneckFlow({
  change,
  bottleneck,
}: {
  change: FlowChange;
  bottleneck: string;
}) {
  const reduced = usePrefersReducedMotion();
  const full = change.before.nodes.find((n) => n.id === bottleneck)?.queue ?? 8;

  const [{ side, queue }, setState] = useState<{
    side: Side;
    queue: number;
    hold: number;
  }>({ side: "before", queue: 1, hold: 0 });
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const run = playing && onScreen && !reduced;
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => {
      setState(({ side: s, queue: q, hold: h }) => {
        if (s === "before") {
          if (q < full) return { side: s, queue: q + 1, hold: 0 };
          return h + 1 < HOLD_FULL
            ? { side: s, queue: q, hold: h + 1 }
            : { side: "after", queue: q, hold: 0 };
        }
        if (q > 0) return { side: s, queue: q - 1, hold: 0 };
        return h + 1 < HOLD_EMPTY
          ? { side: s, queue: q, hold: h + 1 }
          : { side: "before", queue: 1, hold: 0 };
      });
    }, TICK[side]);
    return () => clearInterval(t);
  }, [run, full, side]);

  const pick = (s: Side) => {
    setPlaying(false);
    setState({ side: s, queue: s === "before" ? full : 0, hold: 0 });
  };

  if (reduced) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <AgentFlow flow={change.before} animated={false} interactive={false} />
        <AgentFlow flow={change.after} animated={false} interactive={false} />
      </div>
    );
  }

  const flow = side === "before" ? change.before : change.after;
  return (
    <div ref={frame} className="relative">
      <BackgroundBeams count={8} className="opacity-70" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <p className="flex items-baseline gap-3">
            <span className="text-sm font-semibold">{change.title}</span>
            {change.example && <span className="af-tag">Example</span>}
          </p>
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Show"
              className="flex border border-rule bg-[var(--glass)] backdrop-blur"
            >
              {(["before", "after"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={side === s}
                  onClick={() => pick(s)}
                  className={cx(
                    "min-h-11 px-3 font-mono text-xs transition-colors",
                    side === s
                      ? "bg-fg text-bg"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {change.labels[s]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="grid size-11 place-items-center border border-rule bg-[var(--glass)] text-fg backdrop-blur hover:bg-fill"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-4 fill-current"
              >
                {playing ? (
                  <path d="M4 3h3v10H4zM9 3h3v10H9z" />
                ) : (
                  <path d="M5 3l8 5-8 5z" />
                )}
              </svg>
            </button>
          </div>
        </div>
        <AgentFlow
          flow={flow}
          queues={{ [bottleneck]: queue }}
          interactive={false}
          caption={false}
        />
      </div>
    </div>
  );
}
