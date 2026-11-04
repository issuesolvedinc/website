"use client";

import "./office-world.css";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/*
  A small office, drawn in black and white, where work moves in blue. Nothing to click: it plays on its own.
  Requests come in, a coordinator sorts them, a lead reviews and writes every reply, and the work piles up in
  front of the lead. Then an agent (a circle) joins: it sorts and drafts, the lead only approves, and the pile
  goes down. Then it starts again. An example, not client work, and no figures.
*/

type Pt = { x: number; y: number };
type Station = "a" | "agent" | "b";
type Phase = "before" | "after";

type Layout = {
  w: number;
  h: number;
  inbox: Pt;
  a: Pt;
  agent: Pt;
  b: Pt;
  out: Pt;
  /** Points upstream from the lead, and across, so the pile can line up in front of the desk. */
  back: Pt;
  side: Pt;
  label: Record<
    "inbox" | "a" | "agent" | "b" | "out",
    { dx: number; dy: number; anchor: "start" | "middle" }
  >;
};

const below = { dx: 0, dy: 44, anchor: "middle" as const };
const WIDE: Layout = {
  w: 760,
  h: 270,
  inbox: { x: 60, y: 165 },
  a: { x: 250, y: 165 },
  agent: { x: 250, y: 55 },
  b: { x: 520, y: 165 },
  out: { x: 700, y: 165 },
  back: { x: -1, y: 0 },
  side: { x: 0, y: 1 },
  label: {
    inbox: below,
    a: below,
    agent: { dx: 0, dy: -28, anchor: "middle" },
    b: below,
    out: below,
  },
};
const right = { dx: 30, dy: 5, anchor: "start" as const };
const TALL: Layout = {
  w: 340,
  h: 620,
  inbox: { x: 110, y: 40 },
  a: { x: 110, y: 200 },
  agent: { x: 250, y: 200 },
  b: { x: 110, y: 430 },
  out: { x: 110, y: 575 },
  back: { x: 0, y: -1 },
  side: { x: 1, y: 0 },
  label: {
    inbox: right,
    a: right,
    agent: { dx: 0, dy: 40, anchor: "middle" },
    b: right,
    out: right,
  },
};

/** Seconds: one request comes in every ARRIVE; each station takes this long per item. */
const ARRIVE = 0.95;
const SERVICE: Record<Phase, Record<Station, number>> = {
  before: { a: 0.6, agent: 0.15, b: 2.6 },
  after: { a: 0.6, agent: 0.15, b: 0.3 },
};
const PHASE_LENGTH: Record<Phase, number> = { before: 15, after: 14 };
/** Pixels per second for work in motion. */
const SPEED = 260;
const PILE_MAX = 18;

type Moving = {
  id: number;
  from: Pt;
  to: Pt;
  t: number;
  len: number;
  dest: Station | "out";
};
type Sim = {
  phase: Phase;
  clock: number;
  spawn: number;
  nextId: number;
  moving: Moving[];
  queue: Record<Station, number[]>;
  busy: Record<Station, { id: number; left: number } | null>;
  sent: number;
};

const fresh = (): Sim => ({
  phase: "before",
  clock: 0,
  spawn: 0,
  nextId: 1,
  moving: [],
  queue: { a: [], agent: [], b: [] },
  busy: { a: null, agent: null, b: null },
  sent: 0,
});

const dist = (p: Pt, q: Pt) => Math.hypot(q.x - p.x, q.y - p.y);

function step(s: Sim, L: Layout, dt: number) {
  s.clock += dt;
  if (s.clock >= PHASE_LENGTH[s.phase]) {
    s.clock = 0;
    s.phase = s.phase === "before" ? "after" : "before";
  }
  const send = (id: number, from: Pt, dest: Station | "out") => {
    const to = dest === "out" ? L.out : L[dest];
    s.moving.push({ id, from, to, t: 0, len: dist(from, to), dest });
  };
  s.spawn += dt;
  if (s.spawn >= ARRIVE) {
    s.spawn -= ARRIVE;
    send(s.nextId++, L.inbox, s.phase === "before" ? "a" : "agent");
  }
  s.moving = s.moving.filter((m) => {
    m.t += (SPEED * dt) / m.len;
    if (m.t < 1) return true;
    if (m.dest === "out") s.sent++;
    else s.queue[m.dest].push(m.id);
    return false;
  });
  for (const st of ["a", "agent", "b"] as const) {
    const busy = s.busy[st];
    if (busy) {
      busy.left -= dt;
      if (busy.left <= 0) {
        s.busy[st] = null;
        send(busy.id, L[st], st === "b" ? "out" : "b");
      }
    }
    if (!s.busy[st] && s.queue[st].length)
      s.busy[st] = { id: s.queue[st].shift()!, left: SERVICE[s.phase][st] };
  }
}

/** A still picture of one side, for reduced motion. */
function still(phase: Phase): Sim {
  const s = fresh();
  s.phase = phase;
  if (phase === "before") {
    s.queue.b = Array.from({ length: 12 }, (_, i) => i + 1);
    s.busy.b = { id: 99, left: 1 };
    s.busy.a = { id: 98, left: 1 };
  } else {
    s.busy.agent = { id: 97, left: 1 };
    s.busy.b = { id: 96, left: 1 };
  }
  return s;
}

export function OfficeWorld({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery("(max-width: 40rem)");
  const L = narrow ? TALL : WIDE;

  const sim = useRef<Sim>(fresh());
  const [, setFrame] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // A new layout starts the world again, so nothing is caught between two sets of positions.
  useEffect(() => {
    sim.current = fresh();
  }, [narrow]);

  useEffect(() => {
    if (reduced || !onScreen) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(sim.current, L, dt);
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onScreen, L]);

  const description =
    "Example. Requests come in, a coordinator sorts them and a lead reviews and writes every reply, so work piles up in front of the lead. Then an agent sorts the requests and drafts the replies, the lead only approves, and the pile goes down.";

  if (reduced) {
    return (
      <figure className={cx("grid gap-10", className)}>
        <figcaption className="sr-only">{description}</figcaption>
        <Scene L={L} s={still("before")} title="Before" />
        <Scene L={L} s={still("after")} title="With an agent" />
      </figure>
    );
  }

  return (
    <figure ref={box} className={cx("grid gap-2", className)}>
      <figcaption className="sr-only">{description}</figcaption>
      <p aria-hidden="true" className="font-mono text-xs text-fg-muted">Example</p>
      <Scene L={L} s={sim.current} />
    </figure>
  );
}

function Scene({ L, s, title }: { L: Layout; s: Sim; title?: string }) {
  const after = s.phase === "after";
  const pile = s.queue.b.slice(0, PILE_MAX);
  const pilePos = (i: number): Pt => {
    const col = Math.floor(i / 3);
    const row = (i % 3) - 1;
    const d = 40 + col * 12;
    return {
      x: L.b.x + L.back.x * d + L.side.x * row * 12,
      y: L.b.y + L.back.y * d + L.side.y * row * 12,
    };
  };
  const line = (p: Pt, q: Pt, on: boolean) => (
    <line
      x1={p.x}
      y1={p.y}
      x2={q.x}
      y2={q.y}
      className={cx("ow-line", !on && "ow-off")}
    />
  );
  return (
    <div className="grid gap-2">
      {title && <p className="font-mono text-xs text-fg-muted">{title}</p>}
      <svg
        viewBox={`0 0 ${L.w} ${L.h}`}
        className="ow block h-auto w-full"
        aria-hidden="true"
      >
        {line(L.inbox, L.a, !after)}
        {line(L.a, L.b, !after)}
        {line(L.inbox, L.agent, after)}
        {line(L.agent, L.b, after)}
        {line(L.b, L.out, true)}

        <Tray at={L.inbox} />
        <Tray at={L.out} done />
        <Person at={L.a} idle={after} />
        <Person at={L.b} />
        <g className={cx("ow-agent", !after && "ow-hidden")}>
          <circle cx={L.agent.x} cy={L.agent.y} r={17} className="ow-figure" />
          <rect
            x={L.agent.x - 5}
            y={L.agent.y - 5}
            width={10}
            height={10}
            className={cx("ow-ink", s.busy.agent && "ow-spin")}
            style={{ transformOrigin: `${L.agent.x}px ${L.agent.y}px` }}
          />
        </g>

        {pile.map((id, i) => {
          const p = pilePos(i);
          return (
            <rect
              key={id}
              x={p.x - 4.5}
              y={p.y - 4.5}
              width={9}
              height={9}
              className="ow-work"
            />
          );
        })}
        {(["a", "agent", "b"] as const).map((st) => {
          const busy = s.busy[st];
          if (!busy) return null;
          const at = L[st];
          return (
            <rect
              key={`busy-${busy.id}`}
              x={at.x + (st === "agent" ? 22 : 16)}
              y={at.y + (st === "agent" ? -4.5 : 2)}
              width={9}
              height={9}
              className="ow-work"
            />
          );
        })}
        {s.moving.map((m) => (
          <circle
            key={m.id}
            cx={m.from.x + (m.to.x - m.from.x) * m.t}
            cy={m.from.y + (m.to.y - m.from.y) * m.t}
            r={4.5}
            className="ow-work"
          />
        ))}

        <Label L={L} k="inbox" text="Requests" />
        <Label L={L} k="a" text="Coordinator" />
        <Label L={L} k="b" text="Lead" />
        <Label L={L} k="out" text="Sent" />
        <g className={cx("ow-agent", !after && "ow-hidden")}>
          <Label L={L} k="agent" text="Agent" />
        </g>
      </svg>
    </div>
  );
}

function Person({ at, idle }: { at: Pt; idle?: boolean }) {
  const { x, y } = at;
  return (
    <g className={cx("ow-person", idle && "ow-idle")}>
      <circle cx={x} cy={y - 9} r={7} className="ow-figure" />
      <path
        d={`M${x - 13} ${y + 15} A13 13 0 0 1 ${x + 13} ${y + 15} Z`}
        className="ow-figure"
      />
    </g>
  );
}

function Tray({ at, done }: { at: Pt; done?: boolean }) {
  const { x, y } = at;
  return (
    <g>
      <rect
        x={x - 15}
        y={y - 11}
        width={30}
        height={22}
        className="ow-figure"
      />
      {done ? (
        <path d={`M${x - 6} ${y} l4 4 l8 -8`} className="ow-stroke" />
      ) : (
        <path
          d={`M${x - 15} ${y - 2} h9 l3 4 h6 l3 -4 h9`}
          className="ow-stroke"
        />
      )}
    </g>
  );
}

function Label({
  L,
  k,
  text,
}: {
  L: Layout;
  k: keyof Layout["label"];
  text: string;
}) {
  const at = L[k];
  const o = L.label[k];
  return (
    <text
      x={at.x + o.dx}
      y={at.y + o.dy}
      textAnchor={o.anchor}
      className="ow-label"
    >
      {text}
    </text>
  );
}
