"use client";

import "./process-world.css";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ItemKind, Tool } from "@/content/process-worlds";
import { cx } from "@/lib/cx";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import {
  AMBER,
  Glyph,
  HOT,
  ITEM,
  TOOL,
  Tile,
  Token,
  lane,
  octo,
  pathOf,
  pointAt,
  type P2,
  type Path,
} from "./process-world";

/*
  The main map: the same work, two ways, on one canvas, at the same time. The same inputs feed both lanes on the
  left. Before ends on a big running clock, after on a big check.

  Before, how most companies run today. Work pours in fast from email, contracts, requests and calls. It all lands
  in one backlog, so the pile grows, the card heats up and things fall off. What gets through crawls on: steps sit
  idle with nothing to do (a warning pulses on them), two systems are not connected (the same thing is typed in
  again by hand), invoices and the CRM are islands, and the calls go straight to the team. The backlog owner is
  worn out; the team is out of time (a clock keeps running).

  After, the same inputs into a connected line. An agent orchestrates everything and passes on one thing at a
  time. People and agents take turns along one straight track; every desk checks the work as it passes (check,
  check, check, the checks in the brand orange), ripples spread as work arrives, the records land in the
  connected systems, and a happy team finishes on a big check. Then it loops. Every few seconds a green sweep
  crosses the whole map, left to right.
*/

const W = 1320;
const H = 600;
const NW = 132;
const NH = 92;
const HEAD = 26;
const SW = 112;
const SH = 44;

const FAST = 210; // pixels a second: work coming in
const SLOW = 75; // after the bottleneck
/** Inbox to backlog: slower than the inputs, still well above the connected line. */
const MID = 130;
const CAP = 21;
const REKEY = 2.6; // seconds a record waits to be typed in again between two systems that are not connected
const GAP: [number, number] = [0.45, 1.2];
/** Seconds without work before a step shows its warning. */
const IDLE_WARN = 1.2;

// The connected line: one ticket every PACE seconds, at one speed, a short check at each step.
const PACE = 1.35;
const V = 90;
const DWELL = 0.7;
/** The big circle each lane ends on. */
const END_R = 26;
/** The green sweep: every SWEEP_EVERY seconds it crosses the map in SWEEP_DUR. */
const SWEEP_EVERY = 9;
const SWEEP_DUR = 2.4;
const TRAIL = 160;
/** Unread mail and unpaid invoices: the count climbs to 1700, holds, then starts again. */
const INV_RISE = 10;
const INV_HOLD = 3;
const INV_REST = 2;
const INV_MAX = 1700;
function climb(time: number) {
  const t = time % (INV_RISE + INV_HOLD + INV_REST);
  if (t >= INV_RISE + INV_HOLD) return 0;
  if (t >= INV_RISE) return INV_MAX;
  return Math.max(
    1,
    Math.floor(1 + (INV_MAX - 1) * Math.pow(t / INV_RISE, 2.2)),
  );
}
/** How long a ripple ring takes to spread and fade. */
const RIPPLE = 0.7;
/** 1 the moment something happens, easing to 0 over a third of a second. */
const ease = (t: number) => (t >= 0 && t < 0.35 ? 1 - t / 0.35 : 0);
// Starts the map 40 s in, so the slow inbox has already filled the backlog.
const WARM = 40;

type Kind = "source" | "person" | "system" | "team" | "agent" | "end";
type Node = {
  id: string;
  x: number;
  y: number;
  title: string;
  tool: Tool;
  kind: Kind;
  serve?: number;
  item?: ItemKind;
  every?: number;
  /** Nobody sends it anything. */
  isolated?: boolean;
  /** Takes this many items at a time (one by default). */
  batch?: number;
};

const SRC_Y = [200, 256, 312, 368];
const source = (
  id: string,
  i: number,
  title: string,
  tool: Tool,
  item: ItemKind,
  every: number,
): Node => ({
  id,
  x: 24,
  y: SRC_Y[i],
  title,
  tool,
  kind: "source",
  item,
  every,
});
const NODES: Node[] = [
  source("email", 0, "Email", "email", "mail", 3.2),
  source("contracts", 1, "Contracts", "contract", "contract", 4.4),
  source("requests", 2, "Requests", "form", "form", 4.8),
  source("phone", 3, "Phone", "phone", "call", 5.6),
  // Before.
  {
    id: "inbox",
    x: 190,
    y: 70,
    title: "Inbox",
    tool: "email",
    kind: "person",
    serve: 10,
    batch: 21,
  },
  {
    id: "backlog",
    x: 395,
    y: 70,
    title: "Backlog",
    tool: "backlog",
    kind: "person",
    serve: 1.7,
  },
  {
    id: "entry",
    x: 600,
    y: 22,
    title: "Data entry",
    tool: "sheet",
    kind: "person",
    serve: 0.55,
  },
  {
    id: "invoices",
    x: 600,
    y: 168,
    title: "Invoices",
    tool: "billing",
    kind: "person",
    isolated: true,
  },
  {
    id: "ledger",
    x: 805,
    y: 22,
    title: "Accounting",
    tool: "ledger",
    kind: "system",
    serve: 0.25,
  },
  {
    id: "crm",
    x: 805,
    y: 168,
    title: "Clients",
    tool: "crm",
    kind: "system",
    isolated: true,
  },
  {
    id: "team",
    x: 1010,
    y: 70,
    title: "Team",
    tool: "team",
    kind: "team",
    serve: 1.8,
  },
  // After.
  {
    id: "orchestrate",
    x: 190,
    y: 400,
    title: "Sort and route",
    tool: "agent",
    kind: "agent",
  },
  {
    id: "check",
    x: 395,
    y: 400,
    title: "Review",
    tool: "approval",
    kind: "person",
  },
  {
    id: "records",
    x: 600,
    y: 400,
    title: "Records",
    tool: "agent",
    kind: "agent",
  },
  {
    id: "signoff",
    x: 805,
    y: 400,
    title: "Sign-off",
    tool: "approval",
    kind: "person",
  },
  { id: "crew", x: 1010, y: 400, title: "Team", tool: "team", kind: "team" },
  // Where each lane ends: a running clock above, a check below.
  {
    id: "late",
    x: 1212,
    y: 116 - END_R,
    title: "",
    tool: "wait",
    kind: "end",
  },
  {
    id: "done",
    x: 1212,
    y: 440 - END_R,
    title: "",
    tool: "approval",
    kind: "end",
  },
];
const BY: Record<string, Node> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);
const LINE = ["orchestrate", "check", "records", "signoff", "crew"];
const ON_LINE = new Set(LINE);
/** The straight track runs through the line's cards at this height, above the person or agent. */
const LINE_PORT = 40;

const isSrc = (n: Node) => n.kind === "source";
const isEnd = (n: Node) => n.kind === "end";
/** Sources are small pills, the ends big circles, the steps cards. */
const isPill = isSrc;
const size = (n: Node) =>
  isPill(n)
    ? { w: SW, h: SH }
    : isEnd(n)
      ? { w: END_R * 2, h: END_R * 2 }
      : { w: NW, h: NH };
const portY = (n: Node) =>
  n.y +
  (isPill(n)
    ? SH / 2
    : isEnd(n)
      ? END_R
      : ON_LINE.has(n.id)
        ? LINE_PORT
        : HEAD + 20);
const inP = (n: Node): P2 => ({ x: n.x, y: portY(n) });
const outP = (n: Node): P2 => ({ x: n.x + size(n).w, y: portY(n) });
const spot = (n: Node): P2 => ({
  x: n.x + 26,
  y: n.y + (ON_LINE.has(n.id) ? 66 : 60),
});

type WireDef = {
  from: string;
  to: string;
  w?: number;
  copy?: boolean;
  speed: number;
  broken?: boolean;
  /** Run along this height instead of straight across. */
  at?: number;
  back?: boolean;
  /** Drawn but never used. */
  idle?: boolean;
};
const WIRE_DEFS: WireDef[] = [
  ...["email", "contracts", "requests"].flatMap((s) => [
    { from: s, to: "inbox", speed: FAST },
    { from: s, to: "orchestrate", speed: FAST, copy: true },
  ]),
  { from: "phone", to: "inbox", w: 0.5, speed: FAST },
  { from: "phone", to: "team", w: 0.5, speed: FAST, at: 292 },
  { from: "phone", to: "orchestrate", speed: FAST, copy: true },
  { from: "inbox", to: "backlog", speed: MID },
  { from: "backlog", to: "inbox", w: 0.2, speed: 100, at: 10, back: true },
  { from: "backlog", to: "entry", w: 0.8, speed: SLOW },
  { from: "entry", to: "ledger", speed: SLOW, broken: true },
  { from: "ledger", to: "team", speed: SLOW },
  { from: "team", to: "late", speed: SLOW },
  { from: "invoices", to: "crm", speed: SLOW, broken: true, idle: true },
];
type Wire = WireDef & { path: Path };
const WIRES: Wire[] = WIRE_DEFS.map((d) => {
  const a = outP(BY[d.from]);
  const b = inP(BY[d.to]);
  return {
    ...d,
    path: pathOf(d.at === undefined ? octo(a, b) : lane(a, b, d.at, 0)),
  };
});
const OUT: Record<string, number[]> = {};
WIRES.forEach((w, i) => (OUT[w.from] ??= []).push(i));

/*
  The connected line, worked out once. Every card on it has a desk on one straight track; a ticket stops at each
  desk for DWELL, gets its check, and rolls on to the next at one speed. The steps are STEP seconds apart and the
  tickets PACE seconds apart, so the checks ripple left to right: check, check, check.
*/
const DESK = (i: number): P2 => {
  const n = BY[LINE[i]];
  return { x: n.x + 98, y: n.y + LINE_PORT };
};
const HOP = DESK(1).x - DESK(0).x;
const STEP = HOP / V + DWELL;
const LAST = LINE.length - 1;
/** When a ticket leaves desk `i`, counted from its start. */
const LEAVES = (i: number) => i * STEP + DWELL;
/** From the team's desk out to the check. */
const FINAL = pathOf([DESK(LAST), ...octo(outP(BY.crew), inP(BY.done))]);
const FINAL_DUR = FINAL.len / V;
/** When a ticket reaches the check. */
const END = LEAVES(LAST) + FINAL_DUR;
const LOOP = pathOf(lane(outP(BY.done), inP(BY.orchestrate), 574, 0));
const LOOP_DUR = LOOP.len / 500;

type Where = { p: P2; desk?: number; prog: number; final?: boolean };
function where(age: number): Where | null {
  if (age < 0 || age >= END) return null;
  if (age >= LEAVES(LAST)) {
    const f = (age - LEAVES(LAST)) / FINAL_DUR;
    return { p: pointAt(FINAL, f), prog: f, final: true };
  }
  const i = Math.floor(age / STEP);
  const r = age - i * STEP;
  if (r < DWELL) return { p: DESK(i), desk: i, prog: r / DWELL };
  const f = (r - DWELL) / (STEP - DWELL);
  const a = DESK(i);
  return { p: { x: a.x + HOP * f, y: a.y }, prog: f };
}
/** Seconds since the latest moment that happens at `offset` past each ticket's start. */
const since = (time: number, offset: number) => {
  const k = Math.floor((time - offset) / PACE);
  return k < 0 ? Infinity : time - (k * PACE + offset);
};

// ---------- Today's flow: queues ----------

type Item = { id: number; kind: ItemKind };
type Moving = Item & {
  wire: number;
  t: number;
  stall: number;
  keyed: boolean;
  /** Seconds before it sets off: a batch leaves one item after another. */
  delay: number;
};
type NState = {
  queue: Item[];
  busy: { items: Item[]; left: number; total: number } | null;
  spawn: number;
  hit: number;
  idle: number;
};
type Sim = {
  time: number;
  nextId: number;
  moving: Moving[];
  nodes: Record<string, NState>;
  rings: { id: number; t: number }[];
  drops: (Item & P2 & { t: number })[];
};

const fresh = (): Sim => ({
  time: 0,
  nextId: 1,
  moving: [],
  nodes: Object.fromEntries(
    NODES.map((n, i) => [
      n.id,
      { queue: [], busy: null, spawn: 0.1 + (i % 4) * 0.3, hit: -9, idle: 0 },
    ]),
  ),
  rings: [],
  drops: [],
});

function step(s: Sim, dt: number) {
  s.time += dt;
  const send = (item: Item, wi: number, delay = 0) =>
    s.moving.push({ ...item, wire: wi, t: 0, stall: 0, keyed: false, delay });
  const route = (from: string, item: Item, delay = 0) => {
    const outs = (OUT[from] ?? []).filter((wi) => !WIRES[wi].idle);
    const main = outs.filter((wi) => !WIRES[wi].copy);
    if (main.length) {
      let r =
        Math.random() * main.reduce((sum, wi) => sum + (WIRES[wi].w ?? 1), 0);
      let chosen = main[main.length - 1];
      for (const wi of main) {
        r -= WIRES[wi].w ?? 1;
        if (r <= 0) {
          chosen = wi;
          break;
        }
      }
      send(item, chosen, delay);
    }
    for (const wi of outs)
      if (WIRES[wi].copy) send({ ...item, id: s.nextId++ }, wi);
  };
  const arrive = (id: string, item: Item) => {
    const n = BY[id];
    const st = s.nodes[id];
    st.hit = s.time;
    if (n.kind === "end") return;
    if (n.kind === "agent") s.rings.push({ id: item.id, t: 0 });
    else if (st.queue.length >= CAP) s.drops.push({ ...item, ...inP(n), t: 0 });
    else st.queue.push(item);
  };

  s.moving = s.moving.filter((m) => {
    const w = WIRES[m.wire];
    if (m.delay > 0) {
      m.delay -= dt;
      return true;
    }
    if (m.stall > 0) {
      m.stall -= dt;
      return true;
    }
    m.t += (w.speed * dt) / w.path.len;
    if (w.broken && !m.keyed && m.t >= 0.5) {
      m.t = 0.5;
      m.keyed = true;
      m.stall = REKEY;
    }
    if (m.t < 1) return true;
    arrive(w.to, { id: m.id, kind: m.kind });
    return false;
  });

  for (const n of NODES) {
    const st = s.nodes[n.id];
    if (n.kind === "source") {
      st.spawn -= dt;
      if (st.spawn <= 0) {
        st.hit = s.time;
        route(n.id, { id: s.nextId++, kind: n.item! });
        st.spawn = n.every! * (GAP[0] + Math.random() * (GAP[1] - GAP[0]));
      }
      continue;
    }
    if (n.serve === undefined) continue;
    if (st.busy) {
      st.busy.left -= dt;
      if (st.busy.left <= 0) {
        const { items } = st.busy;
        st.busy = null;
        const gap = Math.min(0.9, (n.serve * 0.8) / items.length);
        items.forEach((item, k) => route(n.id, item, k * gap));
      }
    }
    if (!st.busy && st.queue.length)
      st.busy = {
        items: st.queue.splice(0, n.batch ?? 1),
        left: n.serve,
        total: n.serve,
      };
    if (st.busy || st.queue.length) st.idle = -1;
    else if (st.idle < 0) st.idle = s.time;
  }
  s.rings = s.rings.filter((r) => (r.t += dt) < 0.6);
  s.drops = s.drops.filter((d) => (d.t += dt) < 1);
}

function still(seconds: number) {
  const s = fresh();
  for (let t = 0; t < seconds; t += 1 / 30) step(s, 1 / 30);
  return s;
}

// ---------- Drawing ----------

/** Width of a count bubble, so four digits and a plus still fit. */
const badge = (count: number | string) =>
  Math.max(24, 10 + String(count).length * 6);

function Shell({
  n,
  children,
  dim,
  heat = 0,
  ok,
  count,
  shake = 0,
  pulse = 0,
}: {
  n: Node;
  children?: React.ReactNode;
  dim?: boolean;
  heat?: number;
  ok?: boolean;
  count?: number | string;
  shake?: number;
  /** 1 the moment work arrives, easing to 0: the input port swells. */
  pulse?: number;
}) {
  const { w, h } = size(n);
  const edge = ok
    ? "var(--ok)"
    : heat
      ? `color-mix(in srgb, ${HOT} ${Math.round(heat * 100)}%, var(--pw-edge))`
      : undefined;
  const pin = isSrc(n) ? [outP(n)] : [inP(n), outP(n)];
  return (
    <g
      className={cx("pw-node", dim && "pw-idle")}
      transform={shake ? `translate(${shake.toFixed(2)} 0)` : undefined}
    >
      {(heat > 0 || ok) && (
        <rect
          x={n.x - 6}
          y={n.y - 6}
          width={w + 12}
          height={h + 12}
          rx={14}
          className="pw-heat"
          style={{
            fill: ok ? "var(--ok)" : HOT,
            opacity: ok ? 0.12 : heat * 0.3,
          }}
        />
      )}
      <rect
        x={n.x}
        y={n.y}
        width={w}
        height={h}
        rx={isPill(n) ? 9 : 10}
        className="pw-card"
        style={
          edge
            ? { stroke: edge, strokeWidth: ok ? 1.75 : 1.5 + heat * 1.5 }
            : undefined
        }
      />
      {isPill(n) ? (
        <>
          <Tile tool={n.tool} x={n.x + 8} y={n.y + h / 2 - 9} />
          <text x={n.x + 33} y={n.y + h / 2 + 4} className="pw-title">
            {n.title}
          </text>
        </>
      ) : (
        <>
          <path
            d={`M${n.x} ${n.y + HEAD} V${n.y + 10} A10 10 0 0 1 ${n.x + 10} ${n.y} H${n.x + w - 10} A10 10 0 0 1 ${n.x + w} ${n.y + 10} V${n.y + HEAD} Z`}
            className="pw-head"
          />
          <Tile tool={n.tool} x={n.x + 6} y={n.y + 4} />
          <text x={n.x + 30} y={n.y + 17} className="pw-title">
            {n.title}
          </text>
        </>
      )}
      {children}
      {!!count && (
        <g>
          <rect
            x={n.x + w + 4 - badge(count)}
            y={n.y - 8}
            width={badge(count)}
            height={14}
            rx={7}
            style={{
              fill: heat
                ? `color-mix(in srgb, ${HOT} ${Math.round(40 + heat * 60)}%, var(--pw-muted))`
                : "var(--pw-muted)",
            }}
          />
          <text
            x={n.x + w + 4 - badge(count) / 2}
            y={n.y + 2.5}
            className="pw-count"
          >
            {count}
          </text>
        </g>
      )}
      {pin.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4 + (pin.length === 2 && i === 0 ? pulse * 2.5 : 0)}
          className="pw-port"
        />
      ))}
    </g>
  );
}

const Disc = ({ c, tool }: { c: P2; tool: Tool }) => (
  <circle
    cx={c.x}
    cy={c.y}
    r={14}
    style={{ fill: `color-mix(in srgb, ${TOOL[tool]} 18%, transparent)` }}
  />
);

function Person({
  c,
  mood,
  time,
  bob,
  crew,
  clock,
  rate = 9,
}: {
  c: P2;
  mood: "busy" | "worn" | "idle" | "glad";
  time: number;
  bob?: number;
  /** A team: a second person beside. */
  crew?: boolean;
  /** Out of time: a clock that keeps running, instead of the z. */
  clock?: boolean;
  /** How fast the typing dots bounce. */
  rate?: number;
}) {
  if (mood === "worn")
    return (
      <g>
        {crew && (
          <g
            transform={`translate(${c.x - 9} ${c.y - 3}) scale(0.6)`}
            className="pw-ink"
            style={{ opacity: 0.5 }}
          >
            <circle cx={5} cy={-1} r={6.5} />
            <path d="M-13 16 Q-12 2 0 5 Q12 8 13 16 Z" />
          </g>
        )}
        <g
          transform={`translate(${c.x + (crew ? 3 : 0)} ${c.y}) scale(0.85)`}
          className="pw-ink"
        >
          <circle cx={5} cy={-1} r={6.5} />
          <path d="M-13 16 Q-12 2 0 5 Q12 8 13 16 Z" />
        </g>
        {clock && <Clock p={{ x: c.x + 15, y: c.y - 17 }} time={time} />}
        {!clock &&
          [0, 0.5].map((k) => {
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
  return (
    <g>
      <g
        className={mood === "idle" ? "pw-muted-ink" : "pw-ink"}
        transform={`translate(${c.x} ${c.y - (bob ?? 0)})`}
      >
        <circle cx={0} cy={-4.5} r={4.6} />
        <path d="M-8.5 9.5 A8.5 8.5 0 0 1 8.5 9.5 Z" />
      </g>
      {mood === "idle" && (
        // Nothing to do: a thought with nothing in it.
        <g transform={`translate(${c.x + 15} ${c.y - 15})`}>
          <rect
            x={-9}
            y={-6}
            width={18}
            height={11}
            rx={5.5}
            className="pw-bubble"
          />
          {[0, 1, 2].map((k) => (
            <circle
              key={k}
              cx={-4.5 + k * 4.5}
              cy={-0.5}
              r={1.1}
              className="pw-dots"
            />
          ))}
        </g>
      )}
      {mood === "busy" &&
        [0, 1, 2].map((k) => (
          <circle
            key={k}
            cx={c.x - 5 + k * 5}
            cy={c.y + 21 - Math.max(0, Math.sin(time * rate - k * 0.8)) * 2.5}
            r={1.5}
            className="pw-dots"
          />
        ))}
    </g>
  );
}

function Agent({ c, time }: { c: P2; time: number }) {
  const spin = (time * 140) % 360;
  return (
    <g>
      <circle cx={c.x} cy={c.y} r={19} className="pw-orbit" />
      {(["mail", "contract", "form"] as ItemKind[]).map((k, i) => {
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

function Clock({ p, time }: { p: P2; time: number }) {
  const m = (time * 150) % 360;
  const h = (time * 12.5) % 360;
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <circle r={7} className="pw-clock" />
      <path
        d="M0 0 V-3.2"
        className="pw-clock-hand"
        transform={`rotate(${h.toFixed(1)})`}
      />
      <path
        d="M0 0 V-5"
        className="pw-clock-hand"
        style={{ stroke: HOT }}
        transform={`rotate(${m.toFixed(1)})`}
      />
      <circle r={1.1} className="pw-ink" />
    </g>
  );
}

/** The team, happy: two smiling faces; the front one hops when work reaches them. */
function Happy({ c, hop }: { c: P2; hop: number }) {
  const face = (x: number, y: number, s: number, o: number) => (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}
      style={o < 1 ? { opacity: o } : undefined}
    >
      <circle r={10} className="pw-face" />
      <circle cx={-3.4} cy={-2.4} r={1.5} className="pw-ink" />
      <circle cx={3.4} cy={-2.4} r={1.5} className="pw-ink" />
      <path d="M-5.2 2.2 Q0 8 5.2 2.2" className="pw-smile" />
    </g>
  );
  return (
    <>
      {face(c.x + 19, c.y + 4 - hop * 0.5, 0.72, 0.6)}
      {face(c.x - 1, c.y - hop, 1, 1)}
    </>
  );
}

/** Nothing reaches this step: a warning that keeps pulsing. */
function Warn({ n, time }: { n: Node; time: number }) {
  const beat = 1 + 0.14 * Math.max(0, Math.sin(time * 5.5));
  const f = (time / 1.4) % 1;
  const x = n.x + NW - 15;
  const y = n.y + 13.5;
  const tri = "M0 -7.2 L7.6 6 H-7.6 Z";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={tri}
        className="pw-warn-halo"
        transform={`scale(${(1 + f * 1.1).toFixed(3)})`}
        style={{ opacity: (1 - f) * 0.7 }}
      />
      <g transform={`scale(${beat.toFixed(3)})`}>
        <path d={tri} style={{ fill: AMBER }} strokeLinejoin="round" />
        <path d="M0 -3 V1.4" className="pw-tick" />
        <circle cy={3.6} r={0.95} style={{ fill: "#fff" }} />
      </g>
    </g>
  );
}

/** Where the old way ends: a big clock that keeps running. A ring spreads when work finally gets there. */
function EndClock({ n, time, hit }: { n: Node; time: number; hit: number }) {
  const c = { x: n.x + END_R, y: n.y + END_R };
  const m = (time * 150) % 360;
  const h = (time * 12.5) % 360;
  return (
    <g>
      {hit < RIPPLE * 1.4 && (
        <circle
          cx={c.x}
          cy={c.y}
          r={END_R + (hit / (RIPPLE * 1.4)) * 22}
          className="pw-end-ring"
          style={{ stroke: HOT, opacity: 0.7 * (1 - hit / (RIPPLE * 1.4)) }}
        />
      )}
      <g transform={`translate(${c.x} ${c.y})`}>
        <circle r={END_R} className="pw-end-clock" />
        {Array.from({ length: 12 }, (_, k) => (
          <path
            key={k}
            d={`M0 ${-(END_R - 3)} V${-(END_R - (k % 3 ? 6 : 8))}`}
            className="pw-clock-hand"
            transform={`rotate(${k * 30})`}
          />
        ))}
        <path
          d="M0 0 V-11"
          className="pw-clock-hand pw-hand-big"
          transform={`rotate(${h.toFixed(1)})`}
        />
        <path
          d="M0 0 V-18"
          className="pw-clock-hand pw-hand-big"
          style={{ stroke: HOT }}
          transform={`rotate(${m.toFixed(1)})`}
        />
        <circle r={2.4} className="pw-ink" />
      </g>
      <circle cx={n.x} cy={c.y} r={4} className="pw-port" />
    </g>
  );
}

/** Where the connected line ends: a big green check. It swells and a ring spreads as each ticket lands. */
function EndCheck({ n, t }: { n: Node; t: number }) {
  const c = { x: n.x + END_R, y: n.y + END_R };
  const bump = t < 0.4 ? Math.sin((t / 0.4) * Math.PI) * 0.08 : 0;
  return (
    <g>
      <circle
        cx={c.x}
        cy={c.y}
        r={END_R + 7}
        className="pw-heat"
        style={{ fill: "var(--ok)", opacity: 0.18 }}
      />
      {t < RIPPLE * 1.4 && (
        <circle
          cx={c.x}
          cy={c.y}
          r={END_R + (t / (RIPPLE * 1.4)) * 22}
          className="pw-end-ring"
          style={{
            stroke: "var(--ok)",
            opacity: 0.7 * (1 - t / (RIPPLE * 1.4)),
          }}
        />
      )}
      <g transform={`translate(${c.x} ${c.y}) scale(${(1 + bump).toFixed(3)})`}>
        <circle r={END_R} style={{ fill: "var(--ok)" }} />
        <path
          d="M-10.5 0.5 L-3.5 7.5 L11 -7.5"
          className="pw-tick pw-tick-big"
        />
      </g>
      <circle cx={n.x} cy={c.y} r={4} className="pw-port" />
      <circle cx={n.x + END_R * 2} cy={c.y} r={4} className="pw-port" />
    </g>
  );
}

function Pile({ n, items }: { n: Node; items: Item[] }) {
  return (
    <>
      {items.slice(0, 21).map((it, k) => (
        <Token
          key={it.id}
          item={it}
          p={{
            x: n.x + 54 + (k % 7) * 10.5,
            y: n.y + 52 + Math.floor(k / 7) * 12,
          }}
          s={0.7}
        />
      ))}
    </>
  );
}

function Bar({ n, prog, color }: { n: Node; prog: number; color: string }) {
  return (
    <g>
      <rect
        x={n.x + 48}
        y={n.y + 36}
        width={NW - 58}
        height={3}
        rx={1.5}
        className="pw-track"
      />
      <rect
        x={n.x + 48}
        y={n.y + 36}
        width={(NW - 58) * Math.max(0, Math.min(1, prog))}
        height={3}
        rx={1.5}
        style={{ fill: color }}
      />
    </g>
  );
}

function Scene({ s }: { s: Sim }) {
  const uid = "mf" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const time = s.time;
  const load = new Map<number, number>();
  for (const m of s.moving)
    if (m.delay <= 0) load.set(m.wire, (load.get(m.wire) ?? 0) + 1);

  // Today: one card per step, from the queues.
  const today = NODES.filter((n) => n.y < 290 && !isPill(n) && !isEnd(n)).map(
    (n, i) => {
      const st = s.nodes[n.id];
      const pile = n.batch
        ? [...(st.busy?.items ?? []), ...st.queue]
        : st.queue;
      const ld = Math.min(1, pile.length / CAP);
      // The inbox runs a few seconds ahead of the invoices, so the two counts never match.
      const piled =
        n.id === "invoices"
          ? climb(time)
          : n.id === "inbox"
            ? climb(time + 6.5)
            : 0;
      const heat = piled
        ? (piled / INV_MAX) * (n.id === "inbox" ? 0.45 : 0.6)
        : ld > 0.3
          ? (ld - 0.3) / 0.7
          : 0;
      const idle = n.isolated || (st.idle >= 0 && time - st.idle > IDLE_WARN);
      const c = spot(n);
      const prog = st.busy ? 1 - st.busy.left / st.busy.total : 0;
      let figure: React.ReactNode;
      if (n.kind === "system") figure = <Disc c={c} tool={n.tool} />;
      else if (n.kind === "team" || n.id === "backlog")
        figure = (
          <Person
            c={c}
            mood="worn"
            time={time}
            crew={n.kind === "team"}
            clock={n.kind === "team"}
          />
        );
      else
        figure = (
          <Person
            c={c}
            mood={idle ? "idle" : "busy"}
            time={time}
            rate={n.id === "inbox" ? 4 : 9}
          />
        );
      return (
        <Shell
          key={n.id}
          n={n}
          dim={idle}
          heat={heat}
          count={
            piled ? (piled >= INV_MAX ? `${INV_MAX}+` : piled) : pile.length
          }
          shake={ld > 0.85 ? Math.sin(time * 24 + i) * 0.7 : 0}
          pulse={ease(time - st.hit)}
        >
          {n.kind !== "system" && <Disc c={c} tool={n.tool} />}
          {figure}
          {n.kind === "system" && (
            <g
              transform={`translate(${c.x - 9} ${c.y - 9})`}
              className="pw-glyph"
              style={{ color: TOOL[n.tool] }}
            >
              <Glyph tool={n.tool} />
            </g>
          )}
          {n.kind !== "team" && <Bar n={n} prog={prog} color={TOOL[n.tool]} />}
          <Pile n={n} items={pile} />
          {idle && n.kind !== "team" && n.id !== "backlog" && (
            <Warn n={n} time={time} />
          )}
        </Shell>
      );
    },
  );

  // Connected: tickets on one straight track, checked at every desk.
  const tickets: React.ReactNode[] = [];
  const dwelling: Record<number, number> = {};
  for (
    let k = Math.max(0, Math.ceil((time - END) / PACE));
    k <= Math.floor(time / PACE);
    k++
  ) {
    const w = where(time - k * PACE);
    if (!w) continue;
    let scale = 1.25;
    let fade = 1;
    if (w.desk !== undefined) {
      dwelling[w.desk] = w.prog;
      // Made at the first desk, handed over at the last.
      if (w.desk === 0) scale *= Math.min(1, 0.3 + w.prog * 1.6);
    }
    if (w.final && w.prog > 0.8) {
      // Into the check.
      const f = (w.prog - 0.8) / 0.2;
      scale *= 1 - f * 0.5;
      fade = 1 - f;
    }
    tickets.push(
      <g key={k} style={fade < 1 ? { opacity: fade } : undefined}>
        <Token item={{ id: k, kind: "mail", paced: true }} p={w.p} s={scale} />
      </g>,
    );
  }
  const reached = since(time, LAST * STEP);
  const hop = reached < 0.4 ? Math.sin((reached / 0.4) * Math.PI) * 4 : 0;
  const handed = since(time, END);
  const sweepT = time % SWEEP_EVERY;
  const sweepX = sweepT < SWEEP_DUR ? (sweepT / SWEEP_DUR) * (W + TRAIL) : null;

  const line = LINE.map((id, i) => {
    const n = BY[id];
    const c = spot(n);
    const d = DESK(i);
    const prog = dwelling[i];
    const active = prog !== undefined;
    let figure: React.ReactNode;
    if (n.kind === "agent") figure = <Agent c={c} time={time} />;
    else if (n.kind === "team") figure = <Happy c={c} hop={hop} />;
    else
      figure = (
        <>
          <Disc c={c} tool={n.tool} />
          <Person c={c} mood={active ? "busy" : "glad"} time={time} />
        </>
      );
    const left = since(time, LEAVES(i));
    // The ripple: the port swells as a ticket comes in, a ring spreads as it lands on the desk.
    const inAt =
      i === 0
        ? time - s.nodes[id].hit
        : since(time, i * STEP - (d.x - n.x) / V);
    const landed = since(time, i * STEP);
    return (
      <Shell key={id} n={n} ok pulse={ease(inAt)}>
        <path d={`M${n.x} ${d.y} H${n.x + NW}`} className="pw-track-line" />
        <rect
          x={d.x - 13}
          y={d.y - 11}
          width={26}
          height={22}
          rx={6}
          className="pw-desk"
        />
        {landed < RIPPLE && (
          <circle
            cx={d.x}
            cy={d.y}
            r={13 + (landed / RIPPLE) * 18}
            className="pw-settle"
            style={{ opacity: 0.8 * (1 - landed / RIPPLE) }}
          />
        )}
        {active && (
          <circle
            cx={d.x}
            cy={d.y}
            r={14}
            pathLength={1}
            className="pw-check-ring"
            style={{ strokeDasharray: `${prog.toFixed(3)} 1` }}
          />
        )}
        {figure}
        {n.kind !== "agent" && left < 1.6 && (
          // The person's own check, on their avatar, after the work leaves.
          <g
            transform={`translate(${c.x + 11} ${c.y + 9})`}
            style={{ opacity: 1 - Math.max(0, left - 1.2) / 0.4 }}
          >
            <circle r={5.5} style={{ fill: "var(--pw-check)" }} />
            <path d="M-2.4 0.2 L-0.6 1.9 L2.6 -1.6" className="pw-tick" />
          </g>
        )}
        {id === "orchestrate" &&
          s.rings.map((r) => (
            <circle
              key={r.id}
              cx={c.x}
              cy={c.y}
              r={14 + (r.t / 0.6) * 18}
              className="pw-settle"
              style={{ opacity: 0.8 * (1 - r.t / 0.6) }}
            />
          ))}
      </Shell>
    );
  });

  const rec = BY.records;
  const chips = (["ledger", "crm"] as Tool[]).map((tool, i) => {
    const x = rec.x + 22 + i * 64;
    const y = rec.y + NH + 18;
    return (
      <g key={tool}>
        <path d={`M${x + 22} ${rec.y + NH} V${y}`} className="pw-link" />
        <rect
          x={x}
          y={y}
          width={44}
          height={30}
          rx={8}
          className="pw-card"
          style={{ stroke: "var(--ok)" }}
        />
        <Tile tool={tool} x={x + 13} y={y + 6} />
      </g>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pw pw-main block h-auto w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`${uid}-dot`}
          width={22}
          height={22}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={1} cy={1} r={1} className="pw-grid-dot" />
        </pattern>
        <linearGradient id={`${uid}-sweep`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--ok)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--ok)" stopOpacity="0.28" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={16} />
        </clipPath>
      </defs>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={16}
        className="pw-canvas"
      />
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={16}
        fill={`url(#${uid}-dot)`}
      />
      <rect
        x={1}
        y={1}
        width={W - 2}
        height={286}
        rx={15}
        style={{ fill: HOT, opacity: 0.025 }}
      />
      <rect
        x={1}
        y={300}
        width={W - 2}
        height={H - 301}
        rx={15}
        style={{ fill: "var(--ok)", opacity: 0.04 }}
      />
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={16}
        className="pw-frame"
      />
      <text x={24} y={46} className="pw-lane">
        Today
      </text>
      <text x={24} y={H - 30} className="pw-lane">
        With IssueSolved
      </text>

      {WIRES.map((w, i) => {
        const n = load.get(i) ?? 0;
        const tone =
          BY[w.to].y > 290 ? "var(--flow)" : w.back ? AMBER : "var(--flow)";
        const len = w.path.len;
        return (
          <g
            key={i}
            className={cx(
              "pw-wire",
              w.back && "pw-wire-back",
              w.idle && "pw-wire-idle",
            )}
          >
            <path
              d={w.path.d}
              className="pw-wire-base"
              style={
                w.broken
                  ? { strokeDasharray: `${len / 2 - 16} 32 ${len}` }
                  : undefined
              }
            />
            {n > 0 && (
              <path
                d={w.path.d}
                className="pw-wire-load"
                style={{
                  stroke: tone,
                  strokeWidth: 2 + Math.min(4, n * 0.9),
                  opacity: 0.16 + Math.min(0.3, n * 0.06),
                  strokeDasharray: w.broken
                    ? `${len / 2 - 16} 32 ${len}`
                    : undefined,
                }}
              />
            )}
            {!w.broken && !w.idle && (
              <path
                d={w.path.d}
                className={cx(
                  "pw-wire-flow",
                  w.speed === SLOW && "pw-wire-slow",
                  w.speed === MID && "pw-wire-mid",
                )}
                style={{ stroke: tone }}
              />
            )}
          </g>
        );
      })}

      {LINE.slice(0, -1).map((id, i) => {
        const d = `M${outP(BY[id]).x} ${DESK(i).y} H${inP(BY[LINE[i + 1]]).x}`;
        return (
          <g key={id} className="pw-wire">
            <path d={d} className="pw-pipe" />
            <path
              d={d}
              className="pw-wire-flow pw-wire-steady"
              style={{ stroke: "var(--ok)" }}
            />
          </g>
        );
      })}
      <g className="pw-wire">
        <path d={FINAL.d} className="pw-pipe" />
        <path
          d={FINAL.d}
          className="pw-wire-flow pw-wire-steady"
          style={{ stroke: "var(--ok)" }}
        />
      </g>
      <path d={LOOP.d} className="pw-loop" />
      {chips}

      {NODES.filter(isSrc).map((n) => {
        const t = time - s.nodes[n.id].hit;
        const pulse = t < 0.35 ? 1 - t / 0.35 : 0;
        return (
          <Shell key={n.id} n={n}>
            <circle
              cx={n.x + 17}
              cy={n.y + SH / 2}
              r={11 + (1 - pulse) * 6}
              style={{
                fill: "none",
                stroke: TOOL[n.tool],
                opacity: pulse * 0.8,
              }}
            />
          </Shell>
        );
      })}
      {today}
      {line}
      <EndClock n={BY.late} time={time} hit={time - s.nodes.late.hit} />
      <EndCheck n={BY.done} t={handed} />

      {/* Waiting to be typed in again, between two systems that are not connected. */}
      {s.moving
        .filter((m) => m.stall > 0)
        .map((m) => {
          const p = pointAt(WIRES[m.wire].path, 0.5);
          return (
            <g
              key={m.id}
              style={{ opacity: 0.45 + 0.45 * Math.abs(Math.sin(time * 5)) }}
            >
              <Token item={m} p={p} s={1.1} />
            </g>
          );
        })}
      {s.drops.map((d) => {
        const t = d.t;
        const p = { x: d.x - 8 - t * 18, y: d.y + t * t * 110 };
        return (
          <g
            key={d.id}
            style={{ opacity: 1 - t }}
            transform={`rotate(${t * 160} ${p.x} ${p.y})`}
          >
            <Token item={d} p={p} />
          </g>
        );
      })}
      {s.moving
        .filter((m) => m.stall <= 0 && m.delay <= 0)
        .map((m) => {
          const w = WIRES[m.wire];
          return (
            <Token
              key={m.id}
              item={m}
              p={pointAt(w.path, m.t)}
              s={1.2}
              back={w.back}
            />
          );
        })}

      {tickets}
      {handed < LOOP_DUR && (
        <circle
          cx={pointAt(LOOP, handed / LOOP_DUR).x}
          cy={pointAt(LOOP, handed / LOOP_DUR).y}
          r={3.5}
          style={{ fill: "var(--ok)" }}
        />
      )}
      {sweepX !== null && (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect
            x={sweepX - TRAIL}
            y={0}
            width={TRAIL}
            height={H}
            fill={`url(#${uid}-sweep)`}
          />
          <line x1={sweepX} x2={sweepX} y1={0} y2={H} className="pw-sweep" />
        </g>
      )}
    </svg>
  );
}

const DESCRIPTION =
  "Today work piles up across inboxes and systems; with IssueSolved it moves along one line, checked at each step, and your team gets time back.";

export function MainFlow({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const sim = useRef<Sim>(fresh());
  const [, setFrame] = useState(0);
  const box = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    sim.current = still(WARM);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !onScreen) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(sim.current, dt);
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onScreen]);

  const frozen = useMemo(() => (reduced ? still(WARM) : null), [reduced]);

  return (
    <figure ref={box} className={className}>
      <figcaption className="sr-only">{DESCRIPTION}</figcaption>
      {/* Below a laptop the map keeps a readable size and scrolls sideways inside its own frame. */}
      <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="min-w-[66rem] lg:min-w-0">
          <Scene s={frozen ?? sim.current} />
        </div>
      </div>
    </figure>
  );
}
