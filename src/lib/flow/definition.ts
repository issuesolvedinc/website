/*
  The flow definition: one shape for every agent or process flow diagram.
  Plain data and pure functions, no React and no DOM, so the ai-workflows repo can copy this file as is
  and draw client process flows with the same engine as the website.
*/

export const FLOW_DEFINITION_VERSION = 1;

/**
 * What a step is. Each kind has its own look in the diagram.
 * "person" is a team member doing the work; "approval" is a team member deciding whether the flow goes on.
 */
export type FlowNodeKind = "input" | "agent" | "person" | "tool" | "approval" | "output";

export type FlowNode = {
  id: string;
  kind: FlowNodeKind;
  title: string;
  /** One short line under the title. */
  detail?: string;
  /** Who does the step, for example "Engineer" or "Project manager". Shown in place of the kind's name. */
  role?: string;
  /** Fixed position in diagram units. Leave it out and layoutFlow places the node. */
  position?: { x: number; y: number };
};

export type FlowEdge = {
  id: string;
  from: string;
  to: string;
  /** A word or two on the arrow, for example the answer that leads this way. */
  label?: string;
  /** "loop" goes back to an earlier step, for example when a reviewer asks for changes. */
  kind?: "next" | "loop";
};

export type FlowDefinition = {
  version: typeof FLOW_DEFINITION_VERSION;
  id: string;
  title: string;
  /** True when the flow illustrates the idea and is not real client work. Shown as an Example tag. */
  example?: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export type FlowDirection = "horizontal" | "vertical";

export const NODE_KIND_LABEL: Record<FlowNodeKind, string> = {
  input: "Input",
  agent: "Agent",
  person: "Person",
  tool: "Tool",
  approval: "Approval",
  output: "Output",
};

/** The name shown on a step: its role when it has one, else its kind. */
export function stepLabel(node: FlowNode): string {
  return node.role ?? NODE_KIND_LABEL[node.kind];
}

/** Returns the problems in a definition. An empty list means it can be drawn. */
export function validateFlow(def: FlowDefinition): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const n of def.nodes) {
    if (ids.has(n.id)) problems.push(`Two nodes share the id "${n.id}".`);
    ids.add(n.id);
  }
  for (const e of def.edges) {
    if (!ids.has(e.from)) problems.push(`Edge "${e.id}" starts at a missing node "${e.from}".`);
    if (!ids.has(e.to)) problems.push(`Edge "${e.id}" ends at a missing node "${e.to}".`);
  }
  return problems;
}

/** Edges that move the flow forward. Loops are drawn but do not decide the order. */
const forward = (def: FlowDefinition) => def.edges.filter((e) => e.kind !== "loop");

/**
 * The rank of each node: the length of the longest forward path that reaches it.
 * Nodes on a cycle that is not marked as a loop keep the rank they had when the cycle was found.
 */
export function rankNodes(def: FlowDefinition): Map<string, number> {
  const rank = new Map(def.nodes.map((n) => [n.id, 0]));
  const edges = forward(def);
  for (let pass = 0; pass < def.nodes.length; pass++) {
    let moved = false;
    for (const e of edges) {
      const next = (rank.get(e.from) ?? 0) + 1;
      if (next > (rank.get(e.to) ?? 0) && next < def.nodes.length) {
        rank.set(e.to, next);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return rank;
}

/** The steps in reading order: by rank, then in the order they are defined. Used for the text version. */
export function orderSteps(def: FlowDefinition): FlowNode[] {
  const rank = rankNodes(def);
  const index = new Map(def.nodes.map((n, i) => [n.id, i]));
  return [...def.nodes].sort(
    (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0) || (index.get(a.id) ?? 0) - (index.get(b.id) ?? 0),
  );
}

export type LayoutOptions = {
  direction?: FlowDirection;
  /** Distance between ranks, in diagram units. */
  rankGap?: number;
  /** Distance between nodes that share a rank. */
  laneGap?: number;
};

/** Places every node without a fixed position. Ranks run left to right, or top to bottom when vertical. */
export function layoutFlow(def: FlowDefinition, options: LayoutOptions = {}): Map<string, { x: number; y: number }> {
  const { direction = "horizontal", rankGap = direction === "horizontal" ? 280 : 150, laneGap = direction === "horizontal" ? 130 : 260 } =
    options;
  const rank = rankNodes(def);
  const lanes = new Map<number, string[]>();
  for (const n of def.nodes) {
    const r = rank.get(n.id) ?? 0;
    lanes.set(r, [...(lanes.get(r) ?? []), n.id]);
  }
  const out = new Map<string, { x: number; y: number }>();
  for (const n of def.nodes) {
    if (n.position) {
      out.set(n.id, n.position);
      continue;
    }
    const r = rank.get(n.id) ?? 0;
    const lane = lanes.get(r) ?? [n.id];
    const offset = (lane.indexOf(n.id) - (lane.length - 1) / 2) * laneGap;
    out.set(n.id, direction === "horizontal" ? { x: r * rankGap, y: offset } : { x: offset, y: r * rankGap });
  }
  return out;
}

/** How many ranks the flow has. Lets a container size itself before the diagram draws. */
export function countRanks(def: FlowDefinition): number {
  let max = 0;
  for (const r of rankNodes(def).values()) max = Math.max(max, r);
  return def.nodes.length ? max + 1 : 0;
}
