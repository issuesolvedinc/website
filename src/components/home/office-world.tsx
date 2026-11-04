"use client";

import "./office-world.css";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/*
  A small office seen from above, inside one rectangle: cubicles along a corridor, people at their desks, and an
  empty room that an agent (a circle) moves into. Black and white; only the work moves, in blue, along the corridor
  from desk to desk. Nothing to click: it plays on its own.

  Before: requests come in at the door, the coordinator sorts them, the lead reviews and writes every reply, and
  the work piles up on the lead's floor. Then the agent joins: it sorts and drafts, the lead only approves, and the
  pile goes down. Then it starts again. An example, not client work, and no figures.
*/

type Pt = { x: number; y: number };
type Station = "a" | "agent" | "b";
type Phase = "before" | "after";
type Door = "top" | "bottom" | "left" | "right";
type Who = Station | "colleague";

type Cube = {
  x: number;
  y: number;
  w: number;
  h: number;
  door: Door;
  who: Who;
  label?: string;
};
type Layout = {
  w: number;
  h: number;
  frame: { x: number; y: number; w: number; h: number };
  /** The corridor runs along this line: a fixed y when it crosses the office, a fixed x when it runs down it. */
  corridor: { fixed: "x" | "y"; at: number };
  inTray: Pt;
  outTray: Pt;
  inGap: [Pt, Pt];
  outGap: [Pt, Pt];
  inLabel: Pt & { anchor: "start" | "middle" };
  outLabel: Pt & { anchor: "start" | "middle" };
  cubes: Cube[];
};

const row = (
  y: number,
  h: number,
  door: Door,
  who: [Who, Who, Who],
  labels: (string | undefined)[],
): Cube[] =>
  [90, 300, 510].map((x, i) => ({
    x,
    y,
    w: 200,
    h,
    door,
    who: who[i],
    label: labels[i],
  }));
const WIDE: Layout = {
  w: 800,
  h: 400,
  frame: { x: 20, y: 20, w: 760, h: 360 },
  corridor: { fixed: "y", at: 200 },
  inTray: { x: 52, y: 200 },
  outTray: { x: 748, y: 200 },
  inGap: [
    { x: 20, y: 182 },
    { x: 20, y: 218 },
  ],
  outGap: [
    { x: 780, y: 182 },
    { x: 780, y: 218 },
  ],
  inLabel: { x: 52, y: 231, anchor: "middle" },
  outLabel: { x: 748, y: 231, anchor: "middle" },
  cubes: [
    ...row(
      40,
      125,
      "bottom",
      ["a", "agent", "colleague"],
      ["Coordinator", "Agent"],
    ),
    ...row(
      235,
      125,
      "top",
      ["colleague", "b", "colleague"],
      [undefined, "Lead"],
    ),
  ],
};

const col = (
  x: number,
  door: Door,
  who: [Who, Who, Who],
  labels: (string | undefined)[],
): Cube[] =>
  [70, 250, 430].map((y, i) => ({
    x,
    y,
    w: 140,
    h: 170,
    door,
    who: who[i],
    label: labels[i],
  }));
const TALL: Layout = {
  w: 360,
  h: 700,
  frame: { x: 10, y: 10, w: 340, h: 680 },
  corridor: { fixed: "x", at: 180 },
  inTray: { x: 180, y: 40 },
  outTray: { x: 180, y: 655 },
  inGap: [
    { x: 162, y: 10 },
    { x: 198, y: 10 },
  ],
  outGap: [
    { x: 162, y: 690 },
    { x: 198, y: 690 },
  ],
  inLabel: { x: 202, y: 44, anchor: "start" },
  outLabel: { x: 202, y: 659, anchor: "start" },
  cubes: [
    ...col(20, "right", ["a", "colleague", "colleague"], ["Coordinator"]),
    ...col(200, "left", ["agent", "b", "colleague"], ["Agent", "Lead"]),
  ],
};

/** Where things sit in a cubicle, worked out from its walls and the side its door is on. */
function place(c: Cube, L: Layout) {
  const inward: Record<Door, Pt> = {
    top: { x: 0, y: 1 },
    bottom: { x: 0, y: -1 },
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
  };
  const n = inward[c.door];
  const door: Pt =
    c.door === "top"
      ? { x: c.x + c.w / 2, y: c.y }
      : c.door === "bottom"
        ? { x: c.x + c.w / 2, y: c.y + c.h }
        : c.door === "left"
          ? { x: c.x, y: c.y + c.h / 2 }
          : { x: c.x + c.w, y: c.y + c.h / 2 };
  const depth = n.x === 0 ? c.h : c.w;
  const across: Pt = n.x === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  const at = (p: Pt, k: number, v: Pt = n) => ({
    x: p.x + v.x * k,
    y: p.y + v.y * k,
  });
  const back = at(door, depth);
  const desk = at(back, -14);
  const person = at(back, -58);
  return {
    n,
    across,
    door,
    desk,
    deskSize: n.x === 0 ? { w: 70, h: 16 } : { w: 16, h: 70 },
    person,
    onDesk: at(desk, 22, across),
    arrive: at(door, 24),
    entry:
      L.corridor.fixed === "y"
        ? { x: door.x, y: L.corridor.at }
        : { x: L.corridor.at, y: door.y },
    pile: (i: number) =>
      at(at(person, 44 + (i % 4) * 11, across), -22 + Math.floor(i / 4) * 11),
  };
}
type Place = ReturnType<typeof place>;

/** The path work takes, along the corridor, from one desk to the next. */
function route(
  L: Layout,
  P: Record<Station, Place>,
  from: Station | "in",
  to: Station | "out",
): Pt[] {
  if (from === "in" && to !== "out")
    return [L.inTray, P[to].entry, P[to].arrive];
  if (to === "out" && from !== "in")
    return [P[from].arrive, P[from].entry, L.outTray];
  if (from !== "in" && to !== "out")
    return [P[from].arrive, P[from].entry, P[to].entry, P[to].arrive];
  return [L.inTray, L.outTray];
}

/** Seconds: one request comes in every ARRIVE; each desk takes this long per item. */
const ARRIVE = 0.95;
const SERVICE: Record<Phase, Record<Station, number>> = {
  before: { a: 0.6, agent: 0.15, b: 2.6 },
  after: { a: 0.6, agent: 0.15, b: 0.3 },
};
const PHASE_LENGTH: Record<Phase, number> = { before: 15, after: 14 };
/** Pixels per second for work in motion. */
const SPEED = 240;
const PILE_MAX = 20;

type Moving = {
  id: number;
  pts: Pt[];
  d: number;
  total: number;
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
};

const fresh = (): Sim => ({
  phase: "before",
  clock: 0,
  spawn: 0,
  nextId: 1,
  moving: [],
  queue: { a: [], agent: [], b: [] },
  busy: { a: null, agent: null, b: null },
});

const dist = (p: Pt, q: Pt) => Math.hypot(q.x - p.x, q.y - p.y);
const length = (pts: Pt[]) =>
  pts.slice(1).reduce((sum, p, i) => sum + dist(pts[i], p), 0);
function along(pts: Pt[], d: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const seg = dist(pts[i - 1], pts[i]);
    if (d <= seg && seg > 0) {
      const t = d / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t,
      };
    }
    d -= seg;
  }
  return pts[pts.length - 1];
}

function places(L: Layout): Record<Station, Place> {
  const of = (who: Station) =>
    place(
      L.cubes.find((c) => c.who === who)!,
      L,
    );
  return { a: of("a"), agent: of("agent"), b: of("b") };
}

function step(s: Sim, L: Layout, P: Record<Station, Place>, dt: number) {
  s.clock += dt;
  if (s.clock >= PHASE_LENGTH[s.phase]) {
    s.clock = 0;
    s.phase = s.phase === "before" ? "after" : "before";
  }
  const send = (id: number, from: Station | "in", dest: Station | "out") => {
    const pts = route(L, P, from, dest);
    s.moving.push({ id, pts, d: 0, total: length(pts), dest });
  };
  s.spawn += dt;
  if (s.spawn >= ARRIVE) {
    s.spawn -= ARRIVE;
    send(s.nextId++, "in", s.phase === "before" ? "a" : "agent");
  }
  s.moving = s.moving.filter((m) => {
    m.d += SPEED * dt;
    if (m.d < m.total) return true;
    if (m.dest !== "out") s.queue[m.dest].push(m.id);
    return false;
  });
  for (const st of ["a", "agent", "b"] as const) {
    const busy = s.busy[st];
    if (busy) {
      busy.left -= dt;
      if (busy.left <= 0) {
        s.busy[st] = null;
        send(busy.id, st, st === "b" ? "out" : "b");
      }
    }
    if (!s.busy[st] && s.queue[st].length)
      s.busy[st] = { id: s.queue[st].shift()!, left: SERVICE[s.phase][st] };
  }
}

/** A still picture of one moment, for reduced motion. */
function still(phase: Phase): Sim {
  const s = fresh();
  s.phase = phase;
  if (phase === "before") {
    s.queue.b = Array.from({ length: 12 }, (_, i) => i + 1);
    s.busy.a = { id: 98, left: 1 };
    s.busy.b = { id: 99, left: 1 };
  } else {
    s.busy.agent = { id: 97, left: 1 };
    s.busy.b = { id: 96, left: 1 };
  }
  return s;
}

const DESCRIPTION =
  "Example. An office seen from above. Requests come in at the door, a coordinator sorts them and a lead reviews and writes every reply, so work piles up at the lead's desk. Then an agent moves into the empty room: it sorts the requests and drafts the replies, the lead only approves, and the pile goes down.";

export function OfficeWorld({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery("(max-width: 40rem)");
  const L = narrow ? TALL : WIDE;

  const sim = useRef<Sim>(fresh());
  const [, setFrame] = useState(0);
  const box = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // A new layout starts the office again, so no work is caught between two sets of positions.
  useEffect(() => {
    sim.current = fresh();
  }, [narrow]);

  useEffect(() => {
    if (reduced || !onScreen) return;
    const P = places(L);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(sim.current, L, P, dt);
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onScreen, L]);

  if (reduced) {
    return (
      <figure className={cx("grid gap-10", className)}>
        <figcaption className="sr-only">{DESCRIPTION}</figcaption>
        <Office L={L} s={still("before")} title="Before" />
        <Office L={L} s={still("after")} title="With an agent" />
      </figure>
    );
  }

  return (
    <figure ref={box} className={className}>
      <figcaption className="sr-only">{DESCRIPTION}</figcaption>
      <Office L={L} s={sim.current} title="Example" />
    </figure>
  );
}

function Office({ L, s, title }: { L: Layout; s: Sim; title: string }) {
  const after = s.phase === "after";
  const P = places(L);
  const tracks: [Station | "in", Station | "out", boolean][] = [
    ["in", "a", !after],
    ["a", "b", !after],
    ["in", "agent", after],
    ["agent", "b", after],
    ["b", "out", true],
  ];
  const gap = ([p, q]: [Pt, Pt], width: number) => (
    <line
      x1={p.x}
      y1={p.y}
      x2={q.x}
      y2={q.y}
      className="ow-gap"
      style={{ strokeWidth: width }}
    />
  );

  return (
    <div className="grid gap-2">
      <p aria-hidden="true" className="font-mono text-xs text-fg-muted">
        {title}
      </p>
      <svg
        viewBox={`0 0 ${L.w} ${L.h}`}
        className="ow block h-auto w-full"
        aria-hidden="true"
      >
        <rect x={L.frame.x} y={L.frame.y} width={L.frame.w} height={L.frame.h} className="ow-frame" />
        {gap(L.inGap, 5)}
        {gap(L.outGap, 5)}

        {L.cubes.map((c, i) => (
          <Cubicle
            key={i}
            c={c}
            p={place(c, L)}
            on={c.who !== "agent" || after}
          />
        ))}

        {tracks.map(([from, to, on]) => (
          <polyline
            key={`${from}-${to}`}
            points={route(L, P, from, to)
              .map((p) => `${p.x},${p.y}`)
              .join(" ")}
            className={cx("ow-track", !on && "ow-hidden")}
          />
        ))}

        <Tray at={L.inTray} />
        <Tray at={L.outTray} done />
        <text
          x={L.inLabel.x}
          y={L.inLabel.y}
          textAnchor={L.inLabel.anchor}
          className="ow-label"
        >
          Requests
        </text>
        <text
          x={L.outLabel.x}
          y={L.outLabel.y}
          textAnchor={L.outLabel.anchor}
          className="ow-label"
        >
          Sent
        </text>

        {s.queue.b.slice(0, PILE_MAX).map((id, i) => {
          const p = P.b.pile(i);
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
          const p = P[st].onDesk;
          return (
            <rect
              key={`desk-${busy.id}`}
              x={p.x - 4.5}
              y={p.y - 4.5}
              width={9}
              height={9}
              className="ow-work"
            />
          );
        })}
        {s.moving.map((m) => {
          const p = along(m.pts, m.d);
          return (
            <circle key={m.id} cx={p.x} cy={p.y} r={4.5} className="ow-work" />
          );
        })}
      </svg>
    </div>
  );
}

function Cubicle({ c, p, on }: { c: Cube; p: Place; on: boolean }) {
  const half = 16;
  const gapEnds: [Pt, Pt] = [
    { x: p.door.x - p.across.x * half, y: p.door.y - p.across.y * half },
    { x: p.door.x + p.across.x * half, y: p.door.y + p.across.y * half },
  ];
  const labelY = c.door === "bottom" ? c.y + c.h - 10 : c.y + 18;
  return (
    <g>
      <rect x={c.x} y={c.y} width={c.w} height={c.h} className="ow-wall" />
      <line
        x1={gapEnds[0].x}
        y1={gapEnds[0].y}
        x2={gapEnds[1].x}
        y2={gapEnds[1].y}
        className="ow-gap"
      />
      <rect
        x={p.desk.x - p.deskSize.w / 2}
        y={p.desk.y - p.deskSize.h / 2}
        width={p.deskSize.w}
        height={p.deskSize.h}
        className="ow-desk"
      />
      {c.who === "agent" ? (
        <g className={cx("ow-fade", !on && "ow-hidden")}>
          <circle
            cx={p.person.x}
            cy={p.person.y}
            r={16}
            className="ow-figure"
          />
          <rect
            x={p.person.x - 5}
            y={p.person.y - 5}
            width={10}
            height={10}
            className="ow-ink ow-spin"
            style={{ transformOrigin: `${p.person.x}px ${p.person.y}px` }}
          />
        </g>
      ) : (
        <Person at={p.person} />
      )}
      {c.label && (
        <text
          x={c.x + 10}
          y={labelY}
          className={cx(
            "ow-label",
            c.who === "agent" && "ow-fade",
            c.who === "agent" && !on && "ow-hidden",
          )}
        >
          {c.label}
        </text>
      )}
    </g>
  );
}

function Person({ at }: { at: Pt }) {
  const { x, y } = at;
  return (
    <g>
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
