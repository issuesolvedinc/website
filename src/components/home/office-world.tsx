"use client";

import "./office-world.css";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/*
  The main map: one process flow on a node canvas, playing on its own. Information (blue dots and squares) pours
  in from the left on several lines.

  Before: one person does the triage. The pile in their node grows, what gets through sits in Waiting, and it
  reaches you late and all at once: you, at the end, are worn out.
  After: an agent does the triage at the start. It takes everything in, settles what it can, and passes on one
  thing at a time at a steady pace (green). Waiting is gone, and you are standing, thumbs up.
  Then it starts again. No figures.
*/

type Phase = "before" | "after";
type NodeId = "triage" | "wait" | "you";
type WireId =
  "s0" | "s1" | "s2" | "s3" | "triage-wait" | "wait-you" | "triage-you";
type P2 = { x: number; y: number };
type Bez = [P2, P2, P2, P2];
/** One piece of information. `paced` once the agent has passed it on. */
type Item = { id: number; shape: "c" | "s"; paced?: boolean };
type Layout = {
  w: number;
  h: number;
  nodeW: number;
  nodeH: number;
  flow: "across" | "down";
  nodes: Record<NodeId, { x: number; y: number; title: string }>;
  /** Where the information lines start, on the canvas edge. */
  sources: P2[];
};

const HEAD = 26;

const WIDE: Layout = {
  w: 1200,
  h: 300,
  nodeW: 150,
  nodeH: 112,
  flow: "across",
  nodes: {
    triage: { x: 300, y: 94, title: "Triage" },
    wait: { x: 620, y: 94, title: "Waiting" },
    you: { x: 950, y: 94, title: "You" },
  },
  sources: [
    { x: 1, y: 34 },
    { x: 1, y: 112 },
    { x: 1, y: 188 },
    { x: 1, y: 266 },
  ],
};
const NARROW: Layout = {
  w: 360,
  h: 620,
  nodeW: 150,
  nodeH: 112,
  flow: "down",
  nodes: {
    triage: { x: 105, y: 110, title: "Triage" },
    wait: { x: 105, y: 290, title: "Waiting" },
    you: { x: 105, y: 476, title: "You" },
  },
  sources: [
    { x: 40, y: 1 },
    { x: 135, y: 1 },
    { x: 225, y: 1 },
    { x: 320, y: 1 },
  ],
};

const WIRES: { id: WireId; when: Phase | "both" }[] = [
  { id: "s0", when: "both" },
  { id: "s1", when: "both" },
  { id: "s2", when: "both" },
  { id: "s3", when: "both" },
  { id: "triage-you", when: "after" },
  { id: "triage-wait", when: "before" },
  { id: "wait-you", when: "before" },
];

// ---------- Geometry ----------

function ports(L: Layout, id: NodeId) {
  const n = L.nodes[id];
  return L.flow === "across"
    ? {
        in: { x: n.x, y: n.y + HEAD + 20 },
        out: { x: n.x + L.nodeW, y: n.y + HEAD + 20 },
      }
    : {
        in: { x: n.x + L.nodeW / 2, y: n.y },
        out: { x: n.x + L.nodeW / 2, y: n.y + L.nodeH },
      };
}

function bend(L: Layout, a: P2, b: P2): Bez {
  if (L.flow === "across") {
    const k = Math.max(40, (b.x - a.x) / 2);
    return [a, { x: a.x + k, y: a.y }, { x: b.x - k, y: b.y }, b];
  }
  const k = Math.max(40, (b.y - a.y) / 2);
  return [a, { x: a.x, y: a.y + k }, { x: b.x, y: b.y - k }, b];
}

function curvesOf(L: Layout): Record<WireId, Bez> {
  const t = ports(L, "triage");
  const w = ports(L, "wait");
  const y = ports(L, "you");
  return {
    s0: bend(L, L.sources[0], t.in),
    s1: bend(L, L.sources[1], t.in),
    s2: bend(L, L.sources[2], t.in),
    s3: bend(L, L.sources[3], t.in),
    "triage-wait": bend(L, t.out, w.in),
    "wait-you": bend(L, w.out, y.in),
    "triage-you": bend(L, t.out, y.in),
  };
}

const pathOf = ([a, c1, c2, b]: Bez) =>
  `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
function at([a, c1, c2, b]: Bez, t: number): P2 {
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
function lengthOf(c: Bez) {
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

const PHASE_LENGTH: Record<Phase, number> = { before: 12, after: 11 };
const SPEED = 300; // pixels a second along a wire
/** Seconds between two pieces of information on one line, at random within this range. */
const GAP: [number, number] = [0.3, 1.0];
const TRIAGE: Record<Phase, number> = { before: 0.5, after: 0.06 };
const YOU: Record<Phase, number> = { before: 1.0, after: 0.25 };
const WAIT = 2.2;
/** After: the agent passes on one thing every PACE seconds and settles the rest itself. */
const PACE = 0.75;
const TRIAGE_MAX = 36;
const SETTLE = 0.6;

type Moving = Item & { wire: WireId; t: number; len: number };
type Held = { item: Item; left: number };
type Sim = {
  phase: Phase;
  clock: number;
  time: number;
  spawn: number[];
  nextId: number;
  moving: Moving[];
  triage: Item[];
  triageBusy: Held | null;
  waiting: Held[];
  you: Item[];
  youBusy: Held | null;
  ready: Item[];
  pace: number;
  settled: { id: number; t: number }[];
};

const fresh = (): Sim => ({
  phase: "before",
  clock: 0,
  time: 0,
  spawn: [0.1, 0.5, 0.3, 0.8],
  nextId: 1,
  moving: [],
  triage: [],
  triageBusy: null,
  waiting: [],
  you: [],
  youBusy: null,
  ready: [],
  pace: 0,
  settled: [],
});

function step(s: Sim, len: Record<WireId, number>, dt: number) {
  s.time += dt;
  s.clock += dt;
  if (s.clock >= PHASE_LENGTH[s.phase]) {
    s.clock = 0;
    s.phase = s.phase === "before" ? "after" : "before";
    s.ready = [];
  }
  const send = (item: Item, wire: WireId) =>
    s.moving.push({ ...item, wire, t: 0, len: len[wire] });

  s.spawn = s.spawn.map((left, i) => {
    if (left - dt > 0) return left - dt;
    send(
      { id: s.nextId++, shape: Math.random() < 0.5 ? "c" : "s" },
      `s${i}` as WireId,
    );
    return GAP[0] + Math.random() * (GAP[1] - GAP[0]);
  });

  s.moving = s.moving.filter((m) => {
    m.t += (SPEED * dt) / m.len;
    if (m.t < 1) return true;
    const item: Item = { id: m.id, shape: m.shape, paced: m.paced };
    if (m.wire.startsWith("s")) {
      if (s.triage.length < TRIAGE_MAX) s.triage.push(item);
    } else if (m.wire === "triage-wait") s.waiting.push({ item, left: WAIT });
    else s.you.push(item);
    return false;
  });

  // Triage: one person, one thing at a time; or the agent, which takes everything and paces what it passes on.
  if (s.triageBusy) {
    s.triageBusy.left -= dt;
    if (s.triageBusy.left <= 0) {
      const { item } = s.triageBusy;
      s.triageBusy = null;
      if (s.phase === "before") send(item, "triage-wait");
      else if (s.ready.length < 1) s.ready.push({ ...item, paced: true });
      else s.settled.push({ id: item.id, t: 0 });
    }
  }
  if (!s.triageBusy && s.triage.length)
    s.triageBusy = { item: s.triage.shift()!, left: TRIAGE[s.phase] };
  if (s.phase === "after") {
    s.pace -= dt;
    if (s.pace <= 0 && s.ready.length) {
      send(s.ready.shift()!, "triage-you");
      s.pace = PACE;
    }
  }

  s.waiting = s.waiting.filter((w) => {
    w.left -= dt;
    if (w.left > 0) return true;
    send(w.item, "wait-you");
    return false;
  });

  if (s.youBusy) {
    s.youBusy.left -= dt;
    if (s.youBusy.left <= 0) s.youBusy = null;
  }
  if (!s.youBusy && s.you.length)
    s.youBusy = { item: s.you.shift()!, left: YOU[s.phase] };

  s.settled = s.settled.filter((f) => (f.t += dt) < SETTLE);
}

/** A still picture of one moment, for reduced motion. */
function still(phase: Phase, len: Record<WireId, number>): Sim {
  const s = fresh();
  s.phase = phase;
  s.clock = 5;
  s.time = 50;
  let id = 1;
  const items = (n: number) =>
    Array.from({ length: n }, (_, i): Item => ({
      id: id++,
      shape: (i * 7) % 3 === 0 ? "s" : "c",
    }));
  const on = (wire: WireId, ts: number[], paced?: boolean) =>
    ts.forEach((t, i) =>
      s.moving.push({
        id: id++,
        shape: i % 2 ? "s" : "c",
        paced,
        wire,
        t,
        len: len[wire],
      }),
    );
  on("s0", [0.2, 0.7]);
  on("s1", [0.45]);
  on("s2", [0.1, 0.6]);
  on("s3", [0.35, 0.85]);
  if (phase === "before") {
    s.triage = items(32);
    s.triageBusy = { item: items(1)[0], left: 1 };
    s.waiting = items(6).map((item) => ({ item, left: 1 }));
    s.you = items(7);
    s.youBusy = { item: items(1)[0], left: 1 };
    on("wait-you", [0.5]);
  } else {
    on("triage-you", [0.55], true);
  }
  return s;
}

// ---------- Drawing ----------

const Dot = ({ p, item, r = 4 }: { p: P2; item: Item; r?: number }) =>
  item.shape === "c" ? (
    <circle cx={p.x} cy={p.y} r={r} className={cx(item.paced && "ow-paced")} />
  ) : (
    <rect
      x={p.x - r * 0.9}
      y={p.y - r * 0.9}
      width={r * 1.8}
      height={r * 1.8}
      rx={1}
      className={cx(item.paced && "ow-paced")}
    />
  );

function Person({ c, mood }: { c: P2; mood: "worn" | "free" | "plain" }) {
  if (mood === "worn")
    return (
      <g className="ow-ink">
        {/* Slumped: head dropped forward, shoulders low. */}
        <circle cx={c.x + 5} cy={c.y - 1} r={6.5} />
        <path
          d={`M${c.x - 13} ${c.y + 16} Q${c.x - 12} ${c.y + 2} ${c.x} ${c.y + 5} Q${c.x + 12} ${c.y + 8} ${c.x + 13} ${c.y + 16} Z`}
        />
        <text x={c.x + 15} y={c.y - 9} className="ow-z">
          z
        </text>
        <text x={c.x + 21} y={c.y - 16} className="ow-z">
          z
        </text>
      </g>
    );
  if (mood === "free") {
    // Standing, one arm up, thumb up.
    const x = c.x - 3;
    const y = c.y + 3;
    return (
      <g className="ow-ink">
        <circle cx={x} cy={y - 14} r={5.5} />
        <rect x={x - 6} y={y - 6} width={12} height={14} rx={4} />
        <path
          d={`M${x - 3} ${y + 7} L${x - 4} ${y + 19} M${x + 3} ${y + 7} L${x + 4} ${y + 19}`}
          className="ow-arm"
        />
        <path
          d={`M${x - 5} ${y - 3} L${x - 9} ${y + 7}`}
          className="ow-arm ow-thin"
        />
        <path
          d={`M${x + 5} ${y - 3} L${x + 12} ${y - 12}`}
          className="ow-arm ow-thin"
        />
        <rect x={x + 9} y={y - 18} width={6.5} height={6} rx={2} />
        <path
          d={`M${x + 11} ${y - 18} V${y - 23}`}
          className="ow-arm ow-thumb"
        />
      </g>
    );
  }
  return (
    <g className="ow-ink">
      <circle cx={c.x} cy={c.y - 9} r={6.5} />
      <path
        d={`M${c.x - 12} ${c.y + 15} A12 12 0 0 1 ${c.x + 12} ${c.y + 15} Z`}
      />
    </g>
  );
}

function Agent({ c, spin }: { c: P2; spin: number }) {
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
}

function Clock({ c, spin }: { c: P2; spin: number }) {
  const a = (spin * Math.PI) / 180;
  return (
    <g className="ow-line">
      <circle cx={c.x} cy={c.y} r={14} />
      <path d={`M${c.x} ${c.y} V${c.y - 8}`} />
      <path
        d={`M${c.x} ${c.y} L${c.x + Math.cos(a) * 10} ${c.y + Math.sin(a) * 10}`}
      />
    </g>
  );
}

function Pile({
  L,
  x,
  y,
  items,
}: {
  L: Layout;
  x: number;
  y: number;
  items: Item[];
}) {
  const per = Math.floor((L.nodeW - 20) / 10);
  return (
    <g className="ow-item">
      {items.slice(0, per * 3).map((it, i) => (
        <Dot
          key={it.id}
          p={{ x: x + 15 + (i % per) * 10, y: y + Math.floor(i / per) * 10 }}
          item={it}
          r={3.6}
        />
      ))}
    </g>
  );
}

function Box({
  L,
  id,
  state,
  children,
}: {
  L: Layout;
  id: NodeId;
  state?: string;
  children: React.ReactNode;
}) {
  const n = L.nodes[id];
  const p = ports(L, id);
  const w = L.nodeW;
  return (
    <g className={cx("ow-node", state)}>
      <rect
        x={n.x}
        y={n.y}
        width={w}
        height={L.nodeH}
        rx={8}
        className="ow-box"
      />
      <path
        d={`M${n.x} ${n.y + HEAD} V${n.y + 8} A8 8 0 0 1 ${n.x + 8} ${n.y} H${n.x + w - 8} A8 8 0 0 1 ${n.x + w} ${n.y + 8} V${n.y + HEAD} Z`}
        className="ow-head"
      />
      <line
        x1={n.x}
        y1={n.y + HEAD}
        x2={n.x + w}
        y2={n.y + HEAD}
        className="ow-rule"
      />
      <text x={n.x + 10} y={n.y + 17} className="ow-title">
        {n.title}
      </text>
      <circle
        cx={n.x + w - 13}
        cy={n.y + HEAD / 2}
        r={3.5}
        className="ow-status"
      />
      {children}
      <circle cx={p.in.x} cy={p.in.y} r={4.5} className="ow-port" />
      <circle cx={p.out.x} cy={p.out.y} r={4.5} className="ow-port" />
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

function Scene({ L, C, s }: { L: Layout; C: Record<WireId, Bez>; s: Sim }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const canvas = useMemo(() => <Canvas L={L} grid={`ow-g-${uid}`} />, [L, uid]);
  const after = s.phase === "after";
  const spin = (s.time * 120) % 360;
  const icon = (id: NodeId): P2 => ({
    x: L.nodes[id].x + L.nodeW / 2,
    y: L.nodes[id].y + HEAD + 24,
  });
  const pileY = (id: NodeId) => L.nodes[id].y + HEAD + 50;
  const live = new Set(s.moving.map((m) => m.wire));
  const dots = s.moving.map((m) => (
    <Dot key={m.id} p={at(C[m.wire], Math.min(1, m.t))} item={m} />
  ));
  const hub = icon("triage");

  return (
    <svg
      viewBox={`0 0 ${L.w} ${L.h}`}
      className={cx("ow block h-auto w-full", after && "ow-after")}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`ow-glow-${uid}`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {canvas}

      {WIRES.map((w) => {
        const on = w.when === "both" || (w.when === "after") === after;
        return (
          <g
            key={w.id}
            className={cx(
              "ow-wire",
              !on && "ow-wire-off",
              live.has(w.id) && "ow-wire-live",
              w.id === "triage-you" && "ow-wire-paced",
            )}
          >
            <path d={pathOf(C[w.id])} className="ow-wire-base" />
            <path d={pathOf(C[w.id])} className="ow-wire-flow" />
          </g>
        );
      })}

      <Box L={L} id="triage" state={cx(!after && "ow-busy", after && "ow-ok")}>
        <g className={cx("ow-swap", after && "ow-hide")}>
          <Person c={hub} mood="plain" />
        </g>
        <g className={cx("ow-swap", !after && "ow-hide")}>
          <Agent c={hub} spin={spin} />
        </g>
        <Pile L={L} x={L.nodes.triage.x} y={pileY("triage")} items={s.triage} />
      </Box>

      <g className={cx("ow-fold", after && "ow-gone")}>
        <Box L={L} id="wait" state={s.waiting.length ? "ow-busy" : undefined}>
          <Clock c={icon("wait")} spin={spin * 3} />
          <Pile
            L={L}
            x={L.nodes.wait.x}
            y={pileY("wait")}
            items={s.waiting.map((w) => w.item)}
          />
        </Box>
      </g>

      <Box
        L={L}
        id="you"
        state={cx(!after && s.you.length > 2 && "ow-busy", after && "ow-ok")}
      >
        <g className={cx("ow-swap", after && "ow-hide")}>
          <Person c={icon("you")} mood="worn" />
        </g>
        <g className={cx("ow-swap", !after && "ow-hide")}>
          <Person c={icon("you")} mood="free" />
        </g>
        <Pile L={L} x={L.nodes.you.x} y={pileY("you")} items={s.you} />
      </Box>

      {/* What the agent settles on its own: a ring that opens and fades. */}
      {s.settled.map((f) => (
        <circle
          key={f.id}
          cx={hub.x}
          cy={hub.y}
          r={16 + (f.t / SETTLE) * 18}
          className="ow-settle"
          style={{ opacity: 0.7 * (1 - f.t / SETTLE) }}
        />
      ))}

      <g className="ow-item ow-glow" filter={`url(#ow-glow-${uid})`}>
        {dots}
      </g>
      <g className="ow-item">{dots}</g>
    </svg>
  );
}

const DESCRIPTION =
  "A process flow. Information pours in from the left. When one person does the triage, it piles up, waits, and reaches you late, and you are worn out. When an agent does the triage at the start, it settles what it can and passes on one thing at a time at a steady pace: nothing waits, and you are free.";

function useCurves(L: Layout) {
  return useMemo(() => {
    const C = curvesOf(L);
    const len = Object.fromEntries(
      Object.entries(C).map(([k, c]) => [k, lengthOf(c)]),
    ) as Record<WireId, number>;
    return { C, len };
  }, [L]);
}

export function OfficeWorld({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery("(max-width: 63.99rem)");
  const L = narrow ? NARROW : WIDE;
  const { C, len } = useCurves(L);

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

  // A new layout starts the flow again, so nothing is caught between two sets of positions.
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
      step(sim.current, len, dt);
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onScreen, len]);

  const frame = cx(narrow && "mx-auto w-full max-w-[26rem]", className);
  if (reduced) {
    return (
      <figure className={cx("grid gap-8", frame)}>
        <figcaption className="sr-only">{DESCRIPTION}</figcaption>
        <Scene L={L} C={C} s={still("before", len)} />
        <Scene L={L} C={C} s={still("after", len)} />
      </figure>
    );
  }
  return (
    <figure ref={box} className={frame}>
      <figcaption className="sr-only">{DESCRIPTION}</figcaption>
      <Scene L={L} C={C} s={sim.current} />
    </figure>
  );
}
