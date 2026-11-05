"use client";

import "./process-world.css";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  Both,
  ItemKind,
  Phase,
  ProcessNode,
  ProcessWorld,
  Tool,
  When,
  Who,
} from "@/content/process-worlds";
import {
  FlowThemeStyle,
  LookProvider,
  lookAttrs,
  useFlowLook,
  useLook,
} from "@/components/flow-theme/flow-theme";
import { cx } from "@/lib/cx";
import type { MotionLevel } from "@/lib/flow/theme";

/*
  One business process on a node canvas, alive. Work arrives from its sources (emails, scans, forms, calls) and
  travels on straight and oblique wires between the tools people use.

  Before: each step takes one thing at a time, so piles grow and the cards heat up; things wait, come back along
  the edges to be fixed, get typed in twice, fall off full piles, and the calls go straight to you.
  After: a green sweep crosses the map, an agent takes everything in at the start, settles what it can and
  passes the rest on as tickets at a steady pace. The extra steps are gone, and you stand up, thumbs up.

  Motion carries the meaning, as in process mining replays: what moves is the work, heat and piles show where it
  is stuck, and the pace of the green tickets shows it is not any more.
*/

const W = 1320;
const H = 470;
const NW = 132;
const NH = 92;
const HEAD = 26;
const SW = 112;
const SH = 44;
const COLS = [190, 376, 562, 748, 934, 1120];
const ROWS = [44, 190, 336];
const SRC_X = 24;
const SRC_Y = [46, 146, 280, 380];

const LENGTH: Record<Phase, number> = { before: 16, after: 11 };
/** The loop starts a few seconds in, so the mess is already there on first sight. */
const WARM = 7;
const SPEED = 270; // pixels a second along a wire
const GAP: [number, number] = [0.45, 1.25];
const CAP = 21; // what fits in a card; anything more falls off
const BACKLOG = 0.12; // after: the old pile clears at this pace
const SETTLE = 0.6;
const DROP = 1.0;
const SWEEP = 1.2;

/** Tool and item colours come from the flow theme (src/lib/flow/theme.ts) as CSS variables. */
export const TOOL: Record<Tool, string> = {
  email: "var(--ft-tool-email)",
  pdf: "var(--ft-tool-pdf)",
  form: "var(--ft-tool-form)",
  phone: "var(--ft-tool-phone)",
  chat: "var(--ft-tool-chat)",
  sheet: "var(--ft-tool-sheet)",
  ledger: "var(--ft-tool-ledger)",
  crm: "var(--ft-tool-crm)",
  billing: "var(--ft-tool-billing)",
  projects: "var(--ft-tool-projects)",
  calendar: "var(--ft-tool-calendar)",
  approval: "var(--ft-tool-approval)",
  wait: "var(--ft-tool-wait)",
  docs: "var(--ft-tool-docs)",
  video: "var(--ft-tool-video)",
  plans: "var(--ft-tool-plans)",
  contract: "var(--ft-tool-contract)",
  backlog: "var(--ft-tool-backlog)",
  delivered: "var(--ft-tool-delivered)",
  agent: "var(--ft-tool-agent)",
  you: "var(--ft-tool-you)",
  team: "var(--ft-tool-team)",
};
export const ITEM: Record<ItemKind, string> = {
  mail: "var(--ft-item-mail)",
  pdf: "var(--ft-item-pdf)",
  form: "var(--ft-item-form)",
  call: "var(--ft-item-call)",
  chat: "var(--ft-item-chat)",
  plan: "var(--ft-item-plan)",
  contract: "var(--ft-item-contract)",
};
export const HOT = "var(--ft-hot)";
export const AMBER = "var(--ft-warn)";

export type P2 = { x: number; y: number };
const pick = <T,>(v: Both<T>, p: Phase): T =>
  Array.isArray(v) ? (v as readonly [T, T])[p === "before" ? 0 : 1] : (v as T);
const on = (when: When | undefined, p: Phase) =>
  !when || when === "both" || when === p;

// ---------- Geometry: straight and oblique wires ----------

type Placed = ProcessNode & {
  x: number;
  y: number;
  w: number;
  h: number;
  src: boolean;
};
export type Path = { pts: P2[]; cum: number[]; len: number; d: string };
type Wire = {
  from: string;
  to: string;
  when: When;
  w: number;
  copy: boolean;
  back: boolean;
  path: Path;
};
type Graph = {
  nodes: Placed[];
  byId: Record<string, Placed>;
  wires: Wire[];
  out: Record<string, number[]>;
};

const portY = (n: Placed) => n.y + (n.src ? n.h / 2 : HEAD + 20);
const inPort = (n: Placed): P2 => ({ x: n.x, y: portY(n) });
const outPort = (n: Placed): P2 => ({ x: n.x + n.w, y: portY(n) });
const spot = (n: Placed): P2 => ({ x: n.x + 26, y: n.y + 60 });

/** Horizontal, then 45 degrees, then horizontal; or, when there is no room, down a short vertical. */
export function octo(a: P2, b: P2): P2[] {
  const s = 14;
  const x0 = a.x + s;
  const x1 = b.x - s;
  const dy = b.y - a.y;
  const ady = Math.abs(dy);
  if (ady < 0.5) return [a, b];
  const dx = x1 - x0;
  const sign = Math.sign(dy);
  if (dx >= ady) {
    const h = (dx - ady) / 2;
    return [a, { x: x0 + h, y: a.y }, { x: x0 + h + ady, y: b.y }, b];
  }
  const d = Math.max(0, dx / 2);
  return [
    a,
    { x: x0, y: a.y },
    { x: x0 + d, y: a.y + sign * d },
    { x: x0 + d, y: b.y - sign * d },
    { x: x1, y: b.y },
    b,
  ];
}

/** Out, up or down to a lane along the edge of the canvas, across, and back in. */
export function lane(a: P2, b: P2, y: number, i: number): P2[] {
  const s = 16 + i * 7;
  return [
    a,
    { x: a.x + s, y: a.y },
    { x: a.x + s, y },
    { x: b.x - s, y },
    { x: b.x - s, y: b.y },
    b,
  ];
}

/** Cut every corner at 45 degrees. */
export function chamfer(pts: P2[], c = 8): P2[] {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, p, b] = [pts[i - 1], pts[i], pts[i + 1]];
    const la = Math.hypot(p.x - a.x, p.y - a.y);
    const lb = Math.hypot(b.x - p.x, b.y - p.y);
    if (la < 0.5 || lb < 0.5) continue;
    const ca = Math.min(c, la / 2) / la;
    const cb = Math.min(c, lb / 2) / lb;
    out.push({ x: p.x + (a.x - p.x) * ca, y: p.y + (a.y - p.y) * ca });
    out.push({ x: p.x + (b.x - p.x) * cb, y: p.y + (b.y - p.y) * cb });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function pathOf(raw: P2[]): Path {
  const pts = chamfer(raw);
  const cum = [0];
  for (let i = 1; i < pts.length; i++)
    cum.push(
      cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
    );
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  return { pts, cum, len: cum[cum.length - 1] || 1, d };
}

export function pointAt(p: Path, t: number): P2 {
  const d = Math.max(0, Math.min(1, t)) * p.len;
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < d) i++;
  const seg = p.cum[i] - p.cum[i - 1] || 1;
  const k = (d - p.cum[i - 1]) / seg;
  const a = p.pts[i - 1];
  const b = p.pts[i];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

function graphOf(world: ProcessWorld): Graph {
  const nodes: Placed[] = world.nodes.map((n) =>
    n.col < 0
      ? { ...n, x: SRC_X, y: SRC_Y[n.row], w: SW, h: SH, src: true }
      : { ...n, x: COLS[n.col], y: ROWS[n.row], w: NW, h: NH, src: false },
  );
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const lanes = { over: 0, under: 0 };
  const wires: Wire[] = world.wires.map((d) => {
    const from = byId[d.from];
    const to = byId[d.to];
    const a = outPort(from);
    const b = inPort(to);
    const back = a.x >= b.x - 30;
    const route =
      d.route ??
      (back ? (from.row === 2 || to.row === 2 ? "under" : "over") : undefined);
    let raw: P2[];
    if (route) {
      const i = lanes[route]++;
      raw = lane(a, b, route === "over" ? 14 + i * 7 : H - 14 - i * 7, i);
    } else raw = octo(a, b);
    return {
      from: d.from,
      to: d.to,
      when: d.when ?? "both",
      w: d.w ?? 1,
      copy: !!d.copy,
      back,
      path: pathOf(raw),
    };
  });
  const out: Record<string, number[]> = Object.fromEntries(
    nodes.map((n) => [n.id, []]),
  );
  wires.forEach((w, i) => out[w.from].push(i));
  return { nodes, byId, wires, out };
}

// ---------- The simulation ----------

type Item = { id: number; kind: ItemKind; paced?: boolean };
type Moving = Item & { wire: number; t: number };
type Busy = { item: Item; left: number; total: number };
type NodeState = {
  queue: Item[];
  busy: Busy | null;
  held: Busy[];
  ready: Item[];
  pace: number;
  spawn: number;
  hit: number;
};
type Sim = {
  phase: Phase;
  clock: number;
  time: number;
  nextId: number;
  moving: Moving[];
  nodes: Record<string, NodeState>;
  rings: { id: number; at: string; t: number }[];
  drops: (Item & P2 & { t: number })[];
};

const emptyNode = (i: number): NodeState => ({
  queue: [],
  busy: null,
  held: [],
  ready: [],
  pace: 0,
  spawn: 0.1 + (i % 4) * 0.3,
  hit: -9,
});
const fresh = (G: Graph): Sim => ({
  phase: "before",
  clock: 0,
  time: 0,
  nextId: 1,
  moving: [],
  nodes: Object.fromEntries(G.nodes.map((n, i) => [n.id, emptyNode(i)])),
  rings: [],
  drops: [],
});

function step(G: Graph, s: Sim, dt: number) {
  s.time += dt;
  s.clock += dt;
  if (s.clock >= LENGTH[s.phase]) {
    const was = s.phase;
    const now: Phase = was === "before" ? "after" : "before";
    s.clock = 0;
    s.phase = now;
    s.moving = s.moving.filter((m) => on(G.wires[m.wire].when, now));
    G.nodes.forEach((n, i) => {
      if (on(n.when, now) && !on(n.when, was)) s.nodes[n.id] = emptyNode(i);
      s.nodes[n.id].ready = [];
    });
  }
  const P = s.phase;
  const send = (item: Item, wi: number) =>
    s.moving.push({ ...item, wire: wi, t: 0 });

  const route = (from: string, item: Item) => {
    const outs = G.out[from].filter((wi) => on(G.wires[wi].when, P));
    const main = outs.filter((wi) => !G.wires[wi].copy);
    if (!main.length) return; // the end of the line
    let r = Math.random() * main.reduce((sum, wi) => sum + G.wires[wi].w, 0);
    let chosen = main[main.length - 1];
    for (const wi of main) {
      r -= G.wires[wi].w;
      if (r <= 0) {
        chosen = wi;
        break;
      }
    }
    send(item, chosen);
    for (const wi of outs)
      if (G.wires[wi].copy) send({ ...item, id: s.nextId++ }, wi);
  };

  const finish = (n: Placed, item: Item) => {
    if (P === "after" && n.pace) {
      const st = s.nodes[n.id];
      if (st.ready.length < 1) st.ready.push({ ...item, paced: true });
      else s.rings.push({ id: item.id, at: n.id, t: 0 });
      return;
    }
    route(n.id, item);
  };

  const arrive = (id: string, item: Item) => {
    const n = G.byId[id];
    const st = s.nodes[id];
    st.hit = s.time;
    const hold = n.hold === undefined ? undefined : pick(n.hold, P);
    if (hold !== undefined) st.held.push({ item, left: hold, total: hold });
    else if (st.queue.length >= CAP)
      s.drops.push({ ...item, ...inPort(n), t: 0 });
    else st.queue.push(item);
  };

  s.moving = s.moving.filter((m) => {
    m.t += (SPEED * dt) / G.wires[m.wire].path.len;
    if (m.t < 1) return true;
    arrive(G.wires[m.wire].to, { id: m.id, kind: m.kind, paced: m.paced });
    return false;
  });

  for (const n of G.nodes) {
    if (!on(n.when, P)) continue;
    const st = s.nodes[n.id];
    if (n.spawn) {
      st.spawn -= dt;
      if (st.spawn <= 0) {
        st.hit = s.time;
        route(n.id, { id: s.nextId++, kind: n.spawn.item });
        st.spawn = n.spawn.every * (GAP[0] + Math.random() * (GAP[1] - GAP[0]));
      }
      continue;
    }
    st.held = st.held.filter((h) => {
      h.left -= dt;
      if (h.left > 0) return true;
      finish(n, h.item);
      return false;
    });
    if (st.busy) {
      st.busy.left -= dt;
      if (st.busy.left <= 0) {
        const { item } = st.busy;
        st.busy = null;
        finish(n, item);
      }
    }
    if (!st.busy && st.queue.length) {
      const item = st.queue.shift()!;
      const serve = pick(n.serve ?? 0.5, P);
      const left =
        P === "after" && !item.paced ? Math.min(BACKLOG, serve) : serve;
      st.busy = { item, left, total: left };
    }
    if (P === "after" && n.pace) {
      st.pace -= dt;
      if (st.pace <= 0 && st.ready.length) {
        route(n.id, st.ready.shift()!);
        st.pace = n.pace;
      }
    }
  }

  s.rings = s.rings.filter((r) => (r.t += dt) < SETTLE);
  s.drops = s.drops.filter((d) => (d.t += dt) < DROP);
}

/** A moment of the loop, for reduced motion and for the warm start: the flow run forward to `seconds`. */
function still(G: Graph, seconds: number): Sim {
  const s = fresh(G);
  for (let t = 0; t < seconds; t += 1 / 30) step(G, s, 1 / 30);
  return s;
}

// ---------- Drawing ----------

/** A tool's icon, white on its colour, in an 18 by 18 box. */
/** A card's header band: rounded at the top to the card's corner, square when the theme has square corners. */
export function headPath(x: number, y: number, w: number, head: number, r: number) {
  if (r <= 0) return `M${x} ${y + head} V${y} H${x + w} V${y + head} Z`;
  return `M${x} ${y + head} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + head} Z`;
}

export function Glyph({ tool }: { tool: Tool }) {
  switch (tool) {
    case "email":
      return (
        <>
          <rect x={3} y={5} width={12} height={9} rx={1.5} />
          <path d="M3.6 6 L9 10.2 L14.4 6" />
        </>
      );
    case "pdf":
      return (
        <>
          <path d="M5 3 H11 L14 6 V15 H5 Z" />
          <path d="M11 3 V6 H14 M7 10 H12 M7 12.5 H10.5" />
        </>
      );
    case "form":
      return (
        <>
          <rect x={3} y={4} width={12} height={11} rx={1.5} />
          <path d="M3 7 H15 M5.5 10 H12.5 M5.5 12.5 H10" />
        </>
      );
    case "phone":
      return (
        <path
          className="pw-fill"
          d="M5.6 3.4 L7.9 3.2 L9 6.3 L7.6 7.4 Q8.6 9.6 10.7 10.6 L11.8 9.2 L14.8 10.3 L14.6 12.6 Q13.9 14.4 11.9 14.3 Q4 13.4 3.7 5.8 Q3.8 3.9 5.6 3.4 Z"
        />
      );
    case "chat":
      return <path d="M3.5 4.5 H14.5 V12 H8 L5 14.5 V12 H3.5 Z" />;
    case "sheet":
      return (
        <>
          <rect x={3.5} y={3.5} width={11} height={11} rx={1} />
          <path d="M3.5 7.5 H14.5 M3.5 11 H14.5 M7.5 3.5 V14.5" />
        </>
      );
    case "ledger":
      return (
        <path d="M11.8 5.6 Q9.4 4.2 7.4 5.2 Q5.6 6.4 7.6 8.1 L10.4 9.6 Q12.6 11.1 10.9 12.8 Q8.8 14 6.2 12.5 M9 3 V15" />
      );
    case "crm":
      return (
        <>
          <rect x={3} y={4.5} width={12} height={9} rx={1.5} />
          <circle cx={6.8} cy={8.2} r={1.5} />
          <path d="M4.9 11.6 Q6.8 9.8 8.7 11.6 M10.5 7.6 H13 M10.5 10.2 H13" />
        </>
      );
    case "billing":
      return (
        <>
          <rect x={2.5} y={4.5} width={13} height={9} rx={1.5} />
          <path d="M2.5 7.5 H15.5 M5 11 H8" />
        </>
      );
    case "projects":
      return (
        <>
          <rect x={3} y={3.5} width={12} height={11} rx={1.5} />
          <path d="M7 3.5 V14.5 M11 3.5 V14.5 M4.6 6 H5.6 M8.5 6 H9.5 M12.4 6 H13.4 M4.6 8.4 H5.6 M8.5 8.4 H9.5" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x={3} y={4.5} width={12} height={10} rx={1.5} />
          <path d="M3 8 H15 M6.5 3 V6 M11.5 3 V6" />
          <circle cx={9} cy={11.3} r={1} className="pw-fill" />
        </>
      );
    case "approval":
      return (
        <>
          <circle cx={9} cy={9} r={5.8} />
          <path d="M6.4 9.2 L8.3 11 L11.8 7.3" />
        </>
      );
    case "wait":
      return (
        <path d="M5 3.5 H13 M5 14.5 H13 M6 3.5 Q6 7.5 9 9 Q12 10.5 12 14.5 M12 3.5 Q12 7.5 9 9 Q6 10.5 6 14.5" />
      );
    case "docs":
      return <path d="M3 5.5 H7.5 L9 7 H15 V14 H3 Z" />;
    case "video":
      return (
        <>
          <rect x={2.8} y={5.5} width={8.7} height={7} rx={1.5} />
          <path d="M11.5 8 L15.2 6 V12 L11.5 10" />
        </>
      );
    case "agent":
      return (
        <>
          <circle cx={9} cy={9} r={5.5} />
          <rect x={7} y={7} width={4} height={4} className="pw-fill" />
        </>
      );
    case "plans":
      return (
        <>
          <rect x={3} y={3.5} width={12} height={11} rx={1.5} />
          <path d="M5.8 12 V6.4 L11.4 12 Z M12.6 5.6 V8" />
        </>
      );
    case "contract":
      return (
        <>
          <path d="M5 3 H11 L14 6 V15 H5 Z" />
          <path d="M11 3 V6 H14 M7 7.6 H10 M6.8 12.6 Q7.9 10.2 8.9 12 Q9.9 13.6 12.2 11.4" />
        </>
      );
    case "backlog":
      return (
        <>
          <rect x={3.5} y={3.2} width={11} height={3} rx={1} />
          <rect x={3.5} y={7.5} width={11} height={3} rx={1} />
          <rect x={3.5} y={11.8} width={11} height={3} rx={1} />
        </>
      );
    case "delivered":
      return <path d="M4.4 9.4 L7.7 12.6 L13.8 5.8" />;
    case "team":
      return (
        <>
          <circle cx={11.8} cy={5.8} r={2.1} className="pw-fill" />
          <path
            d="M9.6 12.8 Q11.8 8.6 15.2 12.2 V13.8 H11 Z"
            className="pw-fill"
          />
          <circle cx={7} cy={7.2} r={2.5} className="pw-fill" />
          <path d="M2.6 15 Q7 8.8 11.4 15 Z" className="pw-fill" />
        </>
      );
    case "you":
      return (
        <>
          <circle cx={9} cy={6.4} r={2.6} className="pw-fill" />
          <path d="M4.4 14.6 Q9 8.4 13.6 14.6 Z" className="pw-fill" />
        </>
      );
  }
}

export function Tile({
  tool,
  x,
  y,
  size = 18,
}: {
  tool: Tool;
  x: number;
  y: number;
  size?: number;
}) {
  const ink = tool === "agent" || tool === "you" || tool === "team";
  const { theme } = useLook();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={size}
        height={size}
        rx={size * theme.shape.tile}
        style={{ fill: TOOL[tool] }}
      />
      <g
        className={cx("pw-glyph", ink && "pw-glyph-ink")}
        transform={`scale(${size / 18})`}
      >
        <Glyph tool={tool} />
      </g>
    </g>
  );
}

/** What travels: an email, a scan, a form, a call, a message; a green ticket once the agent passes it on. */
export function Token({
  item,
  p,
  s = 1,
  back,
}: {
  item: Item;
  p: P2;
  s?: number;
  back?: boolean;
}) {
  const c = ITEM[item.kind];
  let body: React.ReactNode;
  if (item.paced)
    body = (
      <>
        <rect
          x={-6.5}
          y={-5}
          width={13}
          height={10}
          rx={2.5}
          style={{ fill: "var(--ft-ok)" }}
        />
        <path d="M-2.8 0 L-0.7 2.1 L3 -2" className="pw-tick" />
      </>
    );
  else if (item.kind === "mail")
    body = (
      <>
        <rect
          x={-6.5}
          y={-4.6}
          width={13}
          height={9.2}
          rx={1.4}
          className="pw-paper"
          style={{ stroke: c }}
        />
        <path
          d="M-5.8 -3.8 L0 0.6 L5.8 -3.8"
          className="pw-ink-line"
          style={{ stroke: c }}
        />
      </>
    );
  else if (item.kind === "pdf")
    body = (
      <>
        <path
          d="M-4.6 -5.8 H2 L4.6 -3.2 V5.8 H-4.6 Z"
          className="pw-paper"
          style={{ stroke: c }}
        />
        <rect x={-4.6} y={1.2} width={9.2} height={2.8} style={{ fill: c }} />
      </>
    );
  else if (item.kind === "form")
    body = (
      <>
        <rect
          x={-6}
          y={-4.8}
          width={12}
          height={9.6}
          rx={1.4}
          className="pw-paper"
          style={{ stroke: c }}
        />
        <rect
          x={-6}
          y={-4.8}
          width={12}
          height={2.8}
          rx={1}
          style={{ fill: c }}
        />
        <path
          d="M-3.8 0.6 H3.8 M-3.8 2.8 H1.4"
          className="pw-ink-line"
          style={{ stroke: c }}
        />
      </>
    );
  else if (item.kind === "plan")
    body = (
      <>
        <rect
          x={-6.5}
          y={-5}
          width={13}
          height={10}
          rx={1.4}
          className="pw-paper"
          style={{ stroke: c }}
        />
        <path
          d="M-4 3 V-2.6 L1.6 3 Z M3.6 -3 V1"
          className="pw-ink-line"
          style={{ stroke: c }}
        />
      </>
    );
  else if (item.kind === "contract")
    body = (
      <>
        <path
          d="M-4.6 -5.8 H2 L4.6 -3.2 V5.8 H-4.6 Z"
          className="pw-paper"
          style={{ stroke: c }}
        />
        <path
          d="M-2.6 -2.4 H0.8 M-3 3.4 Q-1.8 0.8 -0.6 2.8 Q0.6 4.6 3 2"
          className="pw-ink-line"
          style={{ stroke: c }}
        />
      </>
    );
  else if (item.kind === "chat")
    body = (
      <path d="M-6 -4.4 H6 V2.4 H-0.8 L-3.6 5 V2.4 H-6 Z" style={{ fill: c }} />
    );
  else
    body = (
      <>
        <circle r={5.4} style={{ fill: c }} />
        <path d="M-2.4 -2.6 Q-2.9 2 2.6 2.6" className="pw-tick" />
      </>
    );
  return (
    <g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${s})`}>
      {back && <circle r={9} className="pw-back-ring" />}
      {body}
    </g>
  );
}

function Figure({
  who,
  c,
  s,
  n,
  st,
}: {
  who: Who;
  c: P2;
  s: Sim;
  n: Placed;
  st: NodeState;
}) {
  const after = s.phase === "after";
  // Figures move only at the animated level; below it they hold one pose.
  const { fx } = useLook();
  const time = fx ? s.time : 0;
  if (who === "agent") {
    const spin = (time * 140) % 360;
    return (
      <g>
        <circle cx={c.x} cy={c.y} r={19} className="pw-orbit" />
        {(["mail", "pdf", "form"] as ItemKind[]).map((k, i) => {
          const a = time * 2.2 + (i * Math.PI * 2) / 3;
          return (
            <circle
              key={k}
              cx={c.x + Math.cos(a) * 19}
              cy={c.y + Math.sin(a) * 19}
              r={2.6}
              style={{ fill: ITEM[k] }}
            />
          );
        })}
        <circle cx={c.x} cy={c.y} r={12} className="pw-agent" />
        <rect
          x={c.x - 4}
          y={c.y - 4}
          width={8}
          height={8}
          className="pw-ink"
          transform={`rotate(${spin.toFixed(1)} ${c.x} ${c.y})`}
        />
      </g>
    );
  }
  if (who === "you") {
    if (after) {
      const since = s.time - st.hit;
      const hop =
        fx && since < 0.35 ? Math.sin((since / 0.35) * Math.PI) * 3.5 : 0;
      return (
        <g
          transform={`translate(${c.x - 2} ${c.y - hop}) scale(0.8)`}
          className="pw-ink"
        >
          <circle cx={0} cy={-14} r={5.5} />
          <rect x={-6} y={-6} width={12} height={14} rx={4} />
          <path d="M-3 7 L-4 19 M3 7 L4 19" className="pw-limb" />
          <path d="M-5 -3 L-9 7" className="pw-limb pw-thin" />
          <path d="M5 -3 L12 -12" className="pw-limb pw-thin" />
          <rect x={9} y={-18} width={6.5} height={6} rx={2} />
          <path d="M11 -18 V-23" className="pw-limb pw-thumb" />
          <circle cx={20} cy={4} r={6} style={{ fill: "var(--ft-ok)" }} />
          <path d="M17.4 4.2 L19.3 6 L22.6 2.5" className="pw-tick" />
        </g>
      );
    }
    return (
      <g>
        <g
          transform={`translate(${c.x} ${c.y}) scale(0.85)`}
          className="pw-ink"
        >
          <circle cx={5} cy={-1} r={6.5} />
          <path d="M-13 16 Q-12 2 0 5 Q12 8 13 16 Z" />
        </g>
        {[0, 0.5].map((k) => {
          const f = (time * 0.55 + k) % 1;
          return (
            <text
              key={k}
              x={c.x + 12 + f * 6}
              y={c.y - 6 - f * 16}
              className="pw-z"
              style={{ opacity: 1 - f }}
            >
              z
            </text>
          );
        })}
      </g>
    );
  }
  if (n.hold !== undefined) {
    const flip =
      Math.floor(time / 1.6) * 180 + Math.min(1, (time % 1.6) / 0.35) * 180;
    return (
      <g>
        <circle
          cx={c.x}
          cy={c.y}
          r={14}
          style={{ fill: `color-mix(in srgb, ${TOOL.wait} 16%, transparent)` }}
        />
        <g
          transform={`translate(${c.x - 9} ${c.y - 9}) rotate(${flip % 360} 9 9)`}
          className="pw-glyph pw-glyph-dark"
        >
          <Glyph tool="wait" />
        </g>
      </g>
    );
  }
  const tool = pick(n.tool, s.phase);
  const busy = !!st.busy;
  return (
    <g>
      <circle
        cx={c.x}
        cy={c.y}
        r={14}
        style={{ fill: `color-mix(in srgb, ${TOOL[tool]} 18%, transparent)` }}
      />
      {who === "person" ? (
        <g
          className="pw-ink"
          transform={`translate(${c.x} ${c.y + (busy ? Math.sin(time * 18) * 0.6 : 0)})`}
        >
          <circle cx={0} cy={-4.5} r={4.6} />
          <path d="M-8.5 9.5 A8.5 8.5 0 0 1 8.5 9.5 Z" />
        </g>
      ) : (
        <g
          transform={`translate(${c.x - 9} ${c.y - 9})`}
          className="pw-glyph"
          style={{ color: TOOL[tool] }}
        >
          <Glyph tool={tool} />
        </g>
      )}
      {busy &&
        who === "person" &&
        [0, 1, 2].map((k) => (
          <circle
            key={k}
            cx={c.x - 5 + k * 5}
            cy={c.y + 21 - Math.max(0, Math.sin(time * 9 - k * 0.8)) * 2.5}
            r={1.5}
            className="pw-dots"
          />
        ))}
    </g>
  );
}

function Card({ n, s, i }: { n: Placed; s: Sim; i: number }) {
  const { theme, fx } = useLook();
  const { radius: r, glow } = theme.shape;
  const P = s.phase;
  const after = P === "after";
  const st = s.nodes[n.id];
  const sweepX = after && s.clock < SWEEP ? (s.clock / SWEEP) * W : W + 1;
  const gone = !on(n.when, P) && !(after && n.x > sweepX);
  const tool = pick(n.tool, P);
  const who = pick(n.who ?? "none", P);
  const pile = [
    ...st.held,
    ...st.queue.map((item) => ({ item, left: 0, total: 0 })),
  ];
  const load = Math.min(1, pile.length / CAP);
  const hot = !after && load > 0.3 ? (load - 0.3) / 0.7 : 0;
  const ok = after && on(n.when, P) && (who === "agent" || who === "you");
  const shake =
    fx && !after && load > 0.85 ? Math.sin(s.time * 47 + i) * 1.3 : 0;
  const since = s.time - st.hit;
  const pulse = fx && since < 0.35 ? 1 - since / 0.35 : 0;
  const p = [inPort(n), outPort(n)];

  if (n.src) {
    return (
      <g className={cx("pw-node", gone && "pw-gone")}>
        <rect
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={Math.max(0, r - 1)}
          className="pw-card"
        />
        <circle
          cx={n.x + 17}
          cy={n.y + n.h / 2}
          r={11 + (1 - pulse) * 6}
          style={{ fill: "none", stroke: TOOL[tool], opacity: pulse * 0.8 }}
        />
        <Tile tool={tool} x={n.x + 8} y={n.y + n.h / 2 - 9} />
        <text x={n.x + 33} y={n.y + n.h / 2 + 4} className="pw-title">
          {pick(n.title, P)}
        </text>
        <circle cx={p[1].x} cy={p[1].y} r={4} className="pw-port" />
      </g>
    );
  }

  const progress = st.busy ? 1 - st.busy.left / (st.busy.total || 1) : 0;
  const per = 7;
  const edge = ok
    ? "var(--ft-ok)"
    : hot
      ? `color-mix(in srgb, ${HOT} ${Math.round(hot * 100)}%, var(--pw-edge))`
      : undefined;

  return (
    <g
      className={cx("pw-node", gone && "pw-gone")}
      transform={shake ? `translate(${shake.toFixed(2)} 0)` : undefined}
    >
      {glow > 0 && (hot > 0 || ok) && (
        <rect
          x={n.x - 6}
          y={n.y - 6}
          width={n.w + 12}
          height={n.h + 12}
          rx={r ? r + 4 : 0}
          className="pw-heat"
          style={{
            fill: ok ? "var(--ft-ok)" : HOT,
            opacity: (ok ? 0.16 : hot * 0.3) * glow,
          }}
        />
      )}
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={r}
        className="pw-card"
        style={
          edge
            ? { stroke: edge, strokeWidth: 1.5 + (ok ? 0.5 : hot * 1.5) }
            : undefined
        }
      />
      <path
        d={headPath(n.x, n.y, n.w, HEAD, r)}
        className="pw-head"
      />
      <Tile tool={tool} x={n.x + 6} y={n.y + 4} />
      <text x={n.x + 30} y={n.y + 17} className="pw-title">
        {pick(n.title, P)}
      </text>
      {pile.length > 0 && (
        <g>
          <rect
            x={n.x + n.w - 20}
            y={n.y - 8}
            width={24}
            height={14}
            rx={7}
            style={{
              fill: hot
                ? `color-mix(in srgb, ${HOT} ${Math.round(40 + hot * 60)}%, var(--pw-muted))`
                : "var(--pw-muted)",
            }}
          />
          <text x={n.x + n.w - 8} y={n.y + 2.5} className="pw-count">
            {pile.length}
          </text>
        </g>
      )}

      <Figure who={who} c={spot(n)} s={s} n={n} st={st} />

      {who !== "you" && n.hold === undefined && (
        <g>
          <rect
            x={n.x + 48}
            y={n.y + 36}
            width={n.w - 58}
            height={3}
            rx={1.5}
            className="pw-track"
          />
          <rect
            x={n.x + 48}
            y={n.y + 36}
            width={(n.w - 58) * Math.max(0, Math.min(1, progress))}
            height={3}
            rx={1.5}
            style={{ fill: who === "agent" ? "var(--ft-ok)" : TOOL[tool] }}
          />
        </g>
      )}

      {pile.slice(0, per * 3).map((h, k) => {
        const at = {
          x: n.x + 54 + (k % per) * 10.5,
          y: n.y + 52 + Math.floor(k / per) * 12,
        };
        return (
          <g key={h.item.id}>
            <Token item={h.item} p={at} s={0.7} />
            {h.total > 0 && (
              <circle
                cx={at.x}
                cy={at.y}
                r={5.2}
                className="pw-timer"
                style={{ strokeDasharray: `${(h.left / h.total) * 33} 33` }}
              />
            )}
          </g>
        );
      })}

      {s.rings
        .filter((g) => fx && g.at === n.id)
        .map((g) => {
          const c = spot(n);
          return (
            <circle
              key={g.id}
              cx={c.x}
              cy={c.y}
              r={14 + (g.t / SETTLE) * 18}
              className="pw-settle"
              style={{ opacity: 0.8 * (1 - g.t / SETTLE) }}
            />
          );
        })}

      <circle cx={p[0].x} cy={p[0].y} r={4 + pulse * 2.5} className="pw-port" />
      <circle cx={p[1].x} cy={p[1].y} r={4} className="pw-port" />
    </g>
  );
}

function Canvas({ grid }: { grid: string }) {
  const rx = useLook().theme.shape.frame;
  return (
    <>
      <defs>
        <pattern
          id={`${grid}-minor`}
          width={22}
          height={22}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={1} cy={1} r={1} className="pw-grid-dot" />
        </pattern>
        <filter
          id={`${grid}-blur`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id={`${grid}-sweep`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--ft-ok)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--ft-ok)", stopOpacity: 0.28 }} />
        </linearGradient>
      </defs>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={rx}
        className="pw-canvas"
      />
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={rx}
        fill={`url(#${grid}-minor)`}
      />
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={rx}
        className="pw-frame"
      />
    </>
  );
}

function Scene({ G, s }: { G: Graph; s: Sim }) {
  const { fx } = useLook();
  const uid = "pw" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const canvas = useMemo(() => <Canvas grid={uid} />, [uid]);
  const after = s.phase === "after";
  const load = new Map<number, number>();
  for (const m of s.moving) load.set(m.wire, (load.get(m.wire) ?? 0) + 1);
  const order = G.wires
    .map((_, i) => i)
    .sort(
      (a, b) => +on(G.wires[a].when, s.phase) - +on(G.wires[b].when, s.phase),
    );
  // The sweep still turns before into after at every level; only its line is an effect.
  const sweeping = fx && after && s.clock < SWEEP;
  const sweepX = (s.clock / SWEEP) * W;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cx("pw block h-auto w-full", after && "pw-after")}
      aria-hidden="true"
    >
      {canvas}

      {order.map((i) => {
        const w = G.wires[i];
        const live = on(w.when, s.phase);
        const n = load.get(i) ?? 0;
        const tone =
          after && live && !G.byId[w.from].src
            ? "var(--ft-ok)"
            : w.back
              ? AMBER
              : "var(--ft-flow)";
        return (
          <g
            key={i}
            className={cx(
              "pw-wire",
              !live && "pw-wire-off",
              w.back && "pw-wire-back",
            )}
          >
            <path d={w.path.d} className="pw-wire-base" />
            {live && n > 0 && (
              <path
                d={w.path.d}
                className="pw-wire-load"
                style={{
                  stroke: tone,
                  strokeWidth: 2 + Math.min(4, n * 0.9),
                  opacity: 0.18 + Math.min(0.3, n * 0.06),
                }}
              />
            )}
            {live && (
              <path
                d={w.path.d}
                className="pw-wire-flow"
                style={{ stroke: tone }}
              />
            )}
          </g>
        );
      })}

      {G.nodes.map((n, i) => (
        <Card key={n.id} n={n} s={s} i={i} />
      ))}

      {s.drops.map((d) => {
        const t = d.t;
        return (
          <g
            key={d.id}
            style={{ opacity: 1 - t / DROP }}
            transform={
              fx
                ? `rotate(${t * 160} ${d.x - 8 - t * 18} ${d.y + t * t * 110})`
                : undefined
            }
          >
            <Token item={d} p={{ x: d.x - 8 - t * 18, y: d.y + t * t * 110 }} />
          </g>
        );
      })}

      {s.moving.map((m) => {
        const w = G.wires[m.wire];
        const p = pointAt(w.path, m.t);
        return (
          <g key={m.id}>
            {(fx ? [0.05, 0.1] : []).map((lag, k) => {
              const q = pointAt(w.path, m.t - lag * (300 / w.path.len));
              return (
                <circle
                  key={k}
                  cx={q.x}
                  cy={q.y}
                  r={2.4 - k * 0.7}
                  style={{
                    fill: m.paced ? "var(--ft-ok)" : ITEM[m.kind],
                    opacity: 0.35 - k * 0.15,
                  }}
                />
              );
            })}
            <Token item={m} p={p} s={1.25} back={w.back && !m.paced} />
          </g>
        );
      })}

      {sweeping && (
        <g>
          <rect
            x={Math.max(0, sweepX - 160)}
            y={1}
            width={Math.min(160, sweepX)}
            height={H - 2}
            fill={`url(#${uid}-sweep)`}
          />
          <line
            x1={sweepX}
            y1={1}
            x2={sweepX}
            y2={H - 1}
            className="pw-sweep"
          />
        </g>
      )}
    </svg>
  );
}

export function ProcessWorldView({
  world,
  className,
  theme,
  motion,
}: {
  world: ProcessWorld;
  className?: string;
  /** A flow theme id. Defaults to the nearest FlowThemeProvider, then IssueSolved. */
  theme?: string;
  /** Overrides the theme's motion level. Reduced motion always wins. */
  motion?: MotionLevel;
}) {
  const look = useFlowLook(theme, motion);
  const still_ = look.motion === "still";
  const G = useMemo(() => graphOf(world), [world]);
  const sim = useRef<Sim | null>(null);
  // The same on the server and in the browser; warmed up after mount.
  if (!sim.current) sim.current = fresh(G);
  const [, setFrame] = useState(0);
  const box = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    sim.current = still(G, WARM);
  }, [G]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [still_]);

  useEffect(() => {
    if (still_ || !onScreen) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(G, sim.current!, dt);
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still_, onScreen, G]);

  const stills = useMemo(
    () =>
      still_
        ? [still(G, LENGTH.before - 1), still(G, LENGTH.before + 7)]
        : null,
    [still_, G],
  );

  return (
    <LookProvider value={look}>
      <FlowThemeStyle theme={look.theme} />
      {stills ? (
        <figure className={cx("grid gap-8", className)} {...lookAttrs(look)}>
          <Scene G={G} s={stills[0]} />
          <Scene G={G} s={stills[1]} />
        </figure>
      ) : (
        <figure ref={box} className={className} {...lookAttrs(look)}>
          <Scene G={G} s={sim.current!} />
        </figure>
      )}
    </LookProvider>
  );
}
