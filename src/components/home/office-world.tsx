"use client";

import "./office-world.css";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/*
  A small process flow on a node canvas: a grid, nodes with a title bar and ports, curved wires between them.
  People are person icons, the agent is a circle with a square core. Black and white; only the work is blue.
  It plays on its own, nothing to click.

  Before: requests come in, the coordinator sorts them, the lead reviews and writes every reply, and work piles
  up in the lead's node. Then the agent node joins and is wired in: it sorts and drafts, the lead only approves,
  and the pile goes down. Then it starts again. No figures.
*/

type Phase = "before" | "after";
type Station = "a" | "agent" | "b";
type Id = Station | "in" | "out";
type P2 = { x: number; y: number };
type Node = { id: Id; title: string; x: number; y: number };
type Layout = {
  w: number;
  h: number;
  nodeW: number;
  nodeH: number;
  flow: "across" | "down";
  nodes: Record<Id, Node>;
};

const HEAD = 26;

const WIDE: Layout = {
  w: 1200,
  h: 330,
  nodeW: 150,
  nodeH: 112,
  flow: "across",
  nodes: {
    in: { id: "in", title: "Requests", x: 50, y: 190 },
    a: { id: "a", title: "Coordinator", x: 360, y: 190 },
    agent: { id: "agent", title: "Agent", x: 360, y: 28 },
    b: { id: "b", title: "Lead", x: 690, y: 190 },
    out: { id: "out", title: "Sent", x: 1000, y: 190 },
  },
};
const NARROW: Layout = {
  w: 360,
  h: 640,
  nodeW: 140,
  nodeH: 112,
  flow: "down",
  nodes: {
    in: { id: "in", title: "Requests", x: 110, y: 20 },
    a: { id: "a", title: "Coordinator", x: 20, y: 180 },
    agent: { id: "agent", title: "Agent", x: 200, y: 180 },
    b: { id: "b", title: "Lead", x: 110, y: 340 },
    out: { id: "out", title: "Sent", x: 110, y: 500 },
  },
};

const WIRES: { from: Id; to: Id; when: Phase | "both" }[] = [
  { from: "in", to: "a", when: "before" },
  { from: "a", to: "b", when: "before" },
  { from: "in", to: "agent", when: "after" },
  { from: "agent", to: "b", when: "after" },
  { from: "b", to: "out", when: "both" },
];

// ---------- Geometry ----------

const outPort = (L: Layout, n: Node): P2 =>
  L.flow === "across"
    ? { x: n.x + L.nodeW, y: n.y + HEAD + 20 }
    : { x: n.x + L.nodeW / 2, y: n.y + L.nodeH };
const inPort = (L: Layout, n: Node): P2 =>
  L.flow === "across"
    ? { x: n.x, y: n.y + HEAD + 20 }
    : { x: n.x + L.nodeW / 2, y: n.y };

/** The four points of a wire's curve, leaving and entering the ports straight. */
function curve(L: Layout, from: Id, to: Id): [P2, P2, P2, P2] {
  const a = outPort(L, L.nodes[from]);
  const b = inPort(L, L.nodes[to]);
  if (L.flow === "across") {
    const k = Math.max(50, Math.abs(b.x - a.x) / 2);
    return [a, { x: a.x + k, y: a.y }, { x: b.x - k, y: b.y }, b];
  }
  const k = Math.max(40, Math.abs(b.y - a.y) / 2);
  return [a, { x: a.x, y: a.y + k }, { x: b.x, y: b.y - k }, b];
}
const pathOf = ([a, c1, c2, b]: [P2, P2, P2, P2]) =>
  `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
function at([a, c1, c2, b]: [P2, P2, P2, P2], t: number): P2 {
  const u = 1 - t;
  return {
    x:
      u * u * u * a.x +
      3 * u * u * t * c1.x +
      3 * u * t * t * c2.x +
      t * t * t * b.x,
    y:
      u * u * u * a.y +
      3 * u * u * t * c1.y +
      3 * u * t * t * c2.y +
      t * t * t * b.y,
  };
}
function lengthOf(c: [P2, P2, P2, P2]) {
  let len = 0;
  let prev = c[0];
  for (let i = 1; i <= 24; i++) {
    const p = at(c, i / 24);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}

// ---------- The simulation ----------

const ARRIVE = 0.95;
const SERVICE: Record<Phase, Record<Station, number>> = {
  before: { a: 0.6, agent: 0.15, b: 2.6 },
  after: { a: 0.6, agent: 0.15, b: 0.3 },
};
const PHASE_LENGTH: Record<Phase, number> = { before: 16, after: 14 };
const SPEED = 150; // pixels a second along a wire
const QUEUE_MAX = 24;

type Moving = { id: number; from: Id; to: Id; t: number; len: number };
type Sim = {
  phase: Phase;
  clock: number;
  time: number;
  spawn: number;
  nextId: number;
  moving: Moving[];
  queue: Record<Station, number[]>;
  busy: Record<Station, { id: number; left: number } | null>;
};

const fresh = (): Sim => ({
  phase: "before",
  clock: 0,
  time: 0,
  spawn: 0.6,
  nextId: 1,
  moving: [],
  queue: { a: [], agent: [], b: [] },
  busy: { a: null, agent: null, b: null },
});

function step(s: Sim, L: Layout, dt: number) {
  s.time += dt;
  s.clock += dt;
  if (s.clock >= PHASE_LENGTH[s.phase]) {
    s.clock = 0;
    s.phase = s.phase === "before" ? "after" : "before";
  }
  const send = (id: number, from: Id, to: Id) =>
    s.moving.push({ id, from, to, t: 0, len: lengthOf(curve(L, from, to)) });
  s.spawn += dt;
  if (s.spawn >= ARRIVE) {
    s.spawn -= ARRIVE;
    send(s.nextId++, "in", s.phase === "before" ? "a" : "agent");
  }
  s.moving = s.moving.filter((m) => {
    m.t += (SPEED * dt) / m.len;
    if (m.t < 1) return true;
    if (m.to !== "out" && m.to !== "in") s.queue[m.to].push(m.id);
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
  s.clock = 5;
  if (phase === "before") {
    s.queue.b = Array.from({ length: 14 }, (_, i) => i + 1);
    s.busy.a = { id: 98, left: 1 };
    s.busy.b = { id: 99, left: 1 };
  } else {
    s.busy.agent = { id: 97, left: 1 };
    s.busy.b = { id: 96, left: 1 };
  }
  return s;
}

// ---------- Drawing ----------

function Icon({ id, c, spin }: { id: Id; c: P2; spin: number }) {
  if (id === "agent")
    return (
      <g>
        <circle cx={c.x} cy={c.y} r={15} className="ow-line" />
        <rect
          x={c.x - 5}
          y={c.y - 5}
          width={10}
          height={10}
          className="ow-ink"
          transform={`rotate(${spin.toFixed(1)} ${c.x} ${c.y})`}
        />
      </g>
    );
  if (id === "in")
    return (
      <g className="ow-line">
        <rect x={c.x - 15} y={c.y - 11} width={30} height={22} />
        <path d={`M${c.x - 15} ${c.y - 2} h9 l3 4 h6 l3 -4 h9`} />
      </g>
    );
  if (id === "out")
    return (
      <g className="ow-line">
        <rect x={c.x - 15} y={c.y - 11} width={30} height={22} />
        <path d={`M${c.x - 6} ${c.y} l4 4 l8 -8`} />
      </g>
    );
  return (
    <g className="ow-ink">
      <circle cx={c.x} cy={c.y - 8} r={6.5} />
      <path
        d={`M${c.x - 12} ${c.y + 14} A12 12 0 0 1 ${c.x + 12} ${c.y + 14} Z`}
      />
    </g>
  );
}

function NodeView({ L, n, s }: { L: Layout; n: Node; s: Sim }) {
  const after = s.phase === "after";
  const station =
    n.id === "a" || n.id === "agent" || n.id === "b" ? n.id : null;
  const busy = station
    ? !!s.busy[station] && (station !== "agent" || after)
    : false;
  const queue = station ? s.queue[station].slice(0, QUEUE_MAX) : [];
  const off = (n.id === "a" && after) || (n.id === "agent" && !after);
  // The agent node drops in from a little above when it joins.
  // On the very first round there is nothing to fade out, so the room starts empty.
  const join =
    n.id === "agent"
      ? after
        ? Math.min(1, s.clock / 0.7)
        : s.time > s.clock
          ? Math.max(0, 1 - s.clock / 0.5)
          : 0
      : 1;
  const lift = n.id === "agent" ? (1 - join) * -14 : 0;
  const icon = { x: n.x + L.nodeW / 2, y: n.y + HEAD + 32 };
  const ip = inPort(L, n);
  const op = outPort(L, n);
  return (
    <g
      className={cx("ow-node", busy && "ow-busy", off && "ow-off")}
      style={
        n.id === "agent"
          ? { opacity: join, transform: `translateY(${lift}px)` }
          : undefined
      }
    >
      <rect
        x={n.x}
        y={n.y}
        width={L.nodeW}
        height={L.nodeH}
        rx={8}
        className="ow-box"
      />
      <path
        d={`M${n.x} ${n.y + HEAD} V${n.y + 8} A8 8 0 0 1 ${n.x + 8} ${n.y} H${n.x + L.nodeW - 8} A8 8 0 0 1 ${n.x + L.nodeW} ${n.y + 8} V${n.y + HEAD} Z`}
        className="ow-head"
      />
      <line
        x1={n.x}
        y1={n.y + HEAD}
        x2={n.x + L.nodeW}
        y2={n.y + HEAD}
        className="ow-rule"
      />
      <text x={n.x + 10} y={n.y + 17} className="ow-title">
        {n.title}
      </text>
      <circle
        cx={n.x + L.nodeW - 13}
        cy={n.y + HEAD / 2}
        r={3.5}
        className="ow-status"
      />

      <Icon id={n.id} c={icon} spin={(s.time * 90) % 360} />

      {queue.map((id, i) => (
        <rect
          key={id}
          x={n.x + 12 + (i % 12) * 10.5}
          y={
            n.y +
            L.nodeH -
            24 +
            Math.floor(i / 12) * 10.5 -
            (queue.length > 12 ? 10.5 : 0)
          }
          width={8}
          height={8}
          rx={1.5}
          className="ow-item"
        />
      ))}

      {n.id !== "in" && (
        <circle cx={ip.x} cy={ip.y} r={4.5} className="ow-port" />
      )}
      {n.id !== "out" && (
        <circle cx={op.x} cy={op.y} r={4.5} className="ow-port" />
      )}
    </g>
  );
}

function Canvas({ L, grid }: { L: Layout; grid: string }) {
  return (
    <>
      <defs>
        <pattern
          id={`${grid}-minor`}
          width={20}
          height={20}
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0 H0 V20" className="ow-grid-minor" />
        </pattern>
        <pattern
          id={`${grid}-major`}
          width={100}
          height={100}
          patternUnits="userSpaceOnUse"
        >
          <rect width={100} height={100} fill={`url(#${grid}-minor)`} />
          <path d="M100 0 H0 V100" className="ow-grid-major" />
        </pattern>
      </defs>
      <rect
        x={0.5}
        y={0.5}
        width={L.w - 1}
        height={L.h - 1}
        rx={14}
        className="ow-canvas"
      />
      <rect
        x={0.5}
        y={0.5}
        width={L.w - 1}
        height={L.h - 1}
        rx={14}
        fill={`url(#${grid}-major)`}
      />
      <rect
        x={0.5}
        y={0.5}
        width={L.w - 1}
        height={L.h - 1}
        rx={14}
        className="ow-frame"
      />
    </>
  );
}

function Scene({ L, s }: { L: Layout; s: Sim }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const canvas = useMemo(() => <Canvas L={L} grid={`ow-g-${uid}`} />, [L, uid]);
  const curves = useMemo(
    () =>
      Object.fromEntries(
        WIRES.map((w) => [`${w.from}-${w.to}`, curve(L, w.from, w.to)]),
      ),
    [L],
  );
  const after = s.phase === "after";
  return (
    <svg
      viewBox={`0 0 ${L.w} ${L.h}`}
      className="ow block h-auto w-full"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`ow-glow-${uid}`}
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {canvas}

      {WIRES.map((w) => {
        const on = w.when === "both" || (w.when === "after") === after;
        const carrying = s.moving.some(
          (m) => m.from === w.from && m.to === w.to,
        );
        return (
          <g
            key={`${w.from}-${w.to}`}
            className={cx(
              "ow-wire",
              !on && "ow-wire-off",
              carrying && "ow-wire-live",
            )}
          >
            <path
              d={pathOf(curves[`${w.from}-${w.to}`])}
              className="ow-wire-base"
            />
            <path
              d={pathOf(curves[`${w.from}-${w.to}`])}
              className="ow-wire-flow"
            />
          </g>
        );
      })}

      {(["in", "a", "b", "out", "agent"] as const).map((id) => (
        <NodeView key={id} L={L} n={L.nodes[id]} s={s} />
      ))}

      {s.moving.map((m) => {
        const c = curves[`${m.from}-${m.to}`];
        if (!c) return null;
        const p = at(c, Math.min(1, m.t));
        const trail = [0.04, 0.08, 0.12].map((k) =>
          at(c, Math.max(0, m.t - k * (150 / m.len))),
        );
        return (
          <g key={m.id}>
            {trail.map((q, i) => (
              <circle
                key={i}
                cx={q.x}
                cy={q.y}
                r={3.6 - i}
                className="ow-item"
                style={{ opacity: 0.5 - i * 0.15 }}
              />
            ))}
            <circle
              cx={p.x}
              cy={p.y}
              r={9}
              className="ow-item"
              filter={`url(#ow-glow-${uid})`}
              style={{ opacity: 0.65 }}
            />
            <circle cx={p.x} cy={p.y} r={4.5} className="ow-item" />
          </g>
        );
      })}
    </svg>
  );
}

const DESCRIPTION =
  "A process flow on a node canvas. Requests go to a coordinator, who sorts them, then to a lead, who reviews and writes every reply, so work piles up at the lead. Then an agent node is wired in: it sorts the requests and drafts the replies, the lead only approves, and the pile goes down.";

export function OfficeWorld({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery("(max-width: 63.99rem)");
  const L = narrow ? NARROW : WIDE;

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

  // A new layout starts the flow again, so no work is caught between two sets of positions.
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

  if (reduced) {
    return (
      <figure
        className={cx(
          "grid gap-8",
          narrow && "mx-auto w-full max-w-[26rem]",
          className,
        )}
      >
        <figcaption className="sr-only">{DESCRIPTION}</figcaption>
        <Scene L={L} s={still("before")} />
        <Scene L={L} s={still("after")} />
      </figure>
    );
  }
  return (
    <figure
      ref={box}
      className={cx(narrow && "mx-auto w-full max-w-[26rem]", className)}
    >
      <figcaption className="sr-only">{DESCRIPTION}</figcaption>
      <Scene L={L} s={sim.current} />
    </figure>
  );
}
