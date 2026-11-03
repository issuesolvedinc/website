import type { FlowNodeKind } from "@/lib/flow/definition";

/** A 14px line icon for each kind of step. Takes the current text color. */
export function KindIcon({ kind }: { kind: FlowNodeKind }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="af-icon">
      {kind === "input" && <path d="M2 8h9M8 4.5 11.5 8 8 11.5M13.5 3v10" />}
      {kind === "agent" && (
        <>
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.5v2.3M8 12.2v2.3M1.5 8h2.3M12.2 8h2.3M3.4 3.4l1.6 1.6M11 11l1.6 1.6M3.4 12.6 5 11M11 5l1.6-1.6" />
        </>
      )}
      {kind === "tool" && <path d="M10.5 2.5a3 3 0 0 0-3.6 3.9L2.5 10.8l2.7 2.7 4.4-4.4a3 3 0 0 0 3.9-3.6l-1.9 1.9-1.9-.5-.5-1.9z" />}
      {kind === "approval" && (
        <>
          <circle cx="8" cy="5" r="2.5" />
          <path d="M3 14c.6-2.8 2.6-4.2 5-4.2M9.5 12.2l1.6 1.6 3-3.3" />
        </>
      )}
      {kind === "output" && <path d="M2.5 8.5 6 12l7.5-8" />}
    </svg>
  );
}
