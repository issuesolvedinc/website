"use client";

import "@xyflow/react/dist/base.css";
import "./agent-flow.css";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { cx } from "@/lib/cx";
import {
  NODE_KIND_LABEL,
  countRanks,
  layoutFlow,
  orderSteps,
  type FlowDefinition,
  type FlowDirection,
  type FlowNode,
} from "@/lib/flow/definition";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";
import { FlowSteps } from "./flow-steps";
import { KindIcon } from "./kind-icon";

export type AgentFlowProps = {
  flow: FlowDefinition;
  /** "auto" runs left to right when the steps fit across at a readable size, and top to bottom otherwise. */
  direction?: FlowDirection | "auto";
  /**
   * Pan, zoom and view buttons on wide screens. Steps are never editable. On phones the flow always fits and
   * stays put, so a swipe scrolls the page instead of getting caught in the diagram.
   */
  interactive?: boolean;
  /** Lights travel along the arrows. Always off when the system asks for reduced motion. */
  animated?: boolean;
  /** Height of the canvas. Defaults to a height that fits the flow in its direction. */
  height?: number | string;
  className?: string;
};

type StepData = { step: FlowNode; direction: FlowDirection };
type LinkData = { label?: string; loop: boolean; animated: boolean };
type StepNode = Node<StepData, "step">;
type LinkEdge = Edge<LinkData, "link">;

const NODE_WIDTH = 216;
const RANK_GAP = 280;
/** Below this zoom the step text gets too small to read, so auto turns the flow on its side. */
const MIN_ACROSS_ZOOM = 0.72;
const FIT = { padding: 0.12, maxZoom: 1.1 };

/** A flow of agent steps drawn with React Flow, styled from the design tokens, with a text version for screen readers. */
export function AgentFlow(props: AgentFlowProps) {
  return (
    <ReactFlowProvider>
      <AgentFlowCanvas {...props} />
    </ReactFlowProvider>
  );
}

function AgentFlowCanvas({ flow, direction = "auto", interactive = true, animated = true, height, className }: AgentFlowProps) {
  const narrow = useMediaQuery("(max-width: 40rem)");
  const reduced = usePrefersReducedMotion();
  const frame = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const ranks = countRanks(flow);
  const across = (ranks - 1) * RANK_GAP + NODE_WIDTH;
  const fitsAcross = !narrow && width * (1 - 2 * FIT.padding) >= across * MIN_ACROSS_ZOOM;
  const dir: FlowDirection = direction === "auto" ? (fitsAcross ? "horizontal" : "vertical") : direction;
  const moving = animated && !reduced;
  const explore = interactive && !narrow;
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const box = useRef<HTMLDivElement>(null);

  const { nodes, edges } = useMemo(() => {
    const at = layoutFlow(flow, { direction: dir, rankGap: dir === "horizontal" ? RANK_GAP : 150 });
    const nodes: StepNode[] = flow.nodes.map((n) => ({
      id: n.id,
      type: "step",
      position: at.get(n.id) ?? { x: 0, y: 0 },
      data: { step: n, direction: dir },
      ariaLabel: `${NODE_KIND_LABEL[n.kind]}: ${n.title}${n.detail ? `. ${n.detail}` : ""}`,
      width: NODE_WIDTH,
    }));
    const edges: LinkEdge[] = flow.edges.map((e) => {
      const loop = e.kind === "loop";
      return {
        id: e.id,
        source: e.from,
        target: e.to,
        type: "link",
        sourceHandle: loop ? "loop-out" : "out",
        targetHandle: loop ? "loop-in" : "in",
        data: { label: e.label, loop, animated: moving },
        focusable: false,
      };
    });
    return { nodes, edges };
  }, [flow, dir, moving]);

  // Fit again when the box changes size or the direction flips.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => fitView({ ...FIT, duration: 0 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitView, dir]);

  const autoHeight = dir === "horizontal" ? 320 : ranks * 150 + 40;

  return (
    <figure ref={frame} className={cx("agent-flow", className)}>
      <div className="flex items-baseline justify-between gap-4 pb-3">
        <figcaption className="text-sm font-semibold text-fg">{flow.title}</figcaption>
        {flow.example && <span className="af-tag">Example</span>}
      </div>
      <div
        ref={box}
        className="af-canvas relative"
        style={{ height: height ?? autoHeight }}
        role="group"
        aria-label={`${flow.title}, diagram. The steps are also listed as text below.`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={FIT}
          minZoom={0.3}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesFocusable
          edgesFocusable={false}
          panOnDrag={explore}
          zoomOnScroll={false}
          zoomOnPinch={explore}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          preventScrolling={false}
          disableKeyboardA11y={!explore}
          proOptions={{ hideAttribution: true }}
          ariaLabelConfig={{
            "node.a11yDescription.default": "A step in the flow. Use the arrow keys to move the view.",
            "node.a11yDescription.keyboardDisabled": "A step in the flow.",
          }}
        />
        {explore && (
          <div className="af-controls" role="group" aria-label="Diagram view">
            <button type="button" onClick={() => zoomIn({ duration: 150 })} aria-label="Zoom in">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
            </button>
            <button type="button" onClick={() => zoomOut({ duration: 150 })} aria-label="Zoom out">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" /></svg>
            </button>
            <button type="button" onClick={() => fitView({ ...FIT, duration: 200 })} aria-label="Fit the flow">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /></svg>
            </button>
          </div>
        )}
      </div>
      <FlowSteps flow={flow} steps={orderSteps(flow)} className="sr-only" />
    </figure>
  );
}

function StepView({ data }: NodeProps<StepNode>) {
  const { step, direction } = data;
  const across = direction === "horizontal";
  return (
    <div className={cx("af-node", `af-${step.kind}`)}>
      <Handle id="in" type="target" position={across ? Position.Left : Position.Top} className="af-handle" isConnectable={false} />
      <Handle id="out" type="source" position={across ? Position.Right : Position.Bottom} className="af-handle" isConnectable={false} />
      <Handle id="loop-in" type="target" position={across ? Position.Bottom : Position.Left} className="af-handle" isConnectable={false} />
      <Handle id="loop-out" type="source" position={across ? Position.Bottom : Position.Left} className="af-handle" isConnectable={false} />
      <span className="af-kind">
        <KindIcon kind={step.kind} />
        {NODE_KIND_LABEL[step.kind]}
      </span>
      <span className="af-title">{step.title}</span>
      {step.detail && <span className="af-detail">{step.detail}</span>}
    </div>
  );
}

function LinkView({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<LinkEdge>) {
  const loop = data?.loop ?? false;
  const [path, labelX, labelY] = loop
    ? getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, offset: 36, borderRadius: 12 })
    : getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} className={cx("af-edge", loop && "af-edge-loop")} />
      {data?.animated && (
        <circle r="3.5" className="af-spark">
          <animateMotion dur={loop ? "3.2s" : "2.4s"} repeatCount="indefinite" path={path} />
        </circle>
      )}
      {data?.label && (
        <EdgeLabelRenderer>
          <span className="af-edge-label" style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {data.label}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { step: StepView };
const edgeTypes = { link: LinkView };
