import { cx } from "@/lib/cx";
import { NODE_KIND_LABEL, type FlowDefinition, type FlowNode } from "@/lib/flow/definition";

/** The flow as a numbered list: every step, then where it leads. Real HTML for screen readers and search engines. */
export function FlowSteps({ flow, steps, className }: { flow: FlowDefinition; steps: FlowNode[]; className?: string }) {
  const title = new Map(flow.nodes.map((n) => [n.id, n.title]));
  return (
    <div className={className}>
      <p>
        {flow.example ? "Example flow" : "Flow"}: {flow.title}. {steps.length} steps.
      </p>
      <ol className={cx("list-decimal")}>
        {steps.map((s) => {
          const next = flow.edges.filter((e) => e.from === s.id);
          return (
            <li key={s.id}>
              {NODE_KIND_LABEL[s.kind]}: {s.title}.{s.detail ? ` ${s.detail}.` : ""}
              {next.map((e) => (
                <span key={e.id}>
                  {" "}
                  {e.label ? `${e.label}: ` : ""}
                  {e.kind === "loop" ? "back to" : "then"} {title.get(e.to)}.
                </span>
              ))}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
