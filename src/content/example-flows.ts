import { FLOW_DEFINITION_VERSION, type FlowDefinition } from "@/lib/flow/definition";

/*
  Example flows for the site and the design system. They show the kind of work, for a generic engineering firm.
  Not client work, no real names, no figures. Every one is marked example: true and shows an Example tag.
*/

export const drawingReviewFlow: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "drawing-review",
  title: "Drawing review",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Drawing set arrives", detail: "By email or the project folder" },
    { id: "read", kind: "agent", title: "Reads the drawings", detail: "Against the firm's checklist" },
    { id: "std", kind: "tool", title: "Project standards", detail: "Looks up the rules that apply" },
    { id: "draft", kind: "agent", title: "Drafts comments", detail: "One line per issue, with the sheet" },
    { id: "check", kind: "approval", title: "Engineer checks", detail: "Approves or asks for changes" },
    { id: "out", kind: "output", title: "Comment sheet sent", detail: "Filed with the project" },
  ],
  edges: [
    { id: "e1", from: "in", to: "read" },
    { id: "e2", from: "read", to: "std" },
    { id: "e3", from: "std", to: "draft" },
    { id: "e4", from: "draft", to: "check" },
    { id: "e5", from: "check", to: "out", label: "Approved" },
    { id: "e6", from: "check", to: "draft", label: "Changes", kind: "loop" },
  ],
};

export const rfiFlow: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "rfi-triage",
  title: "Question from site",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Question from site", detail: "A request for information" },
    { id: "sort", kind: "agent", title: "Sorts the question", detail: "Which discipline, how urgent" },
    { id: "docs", kind: "tool", title: "Project documents", detail: "Finds the drawings and specs" },
    { id: "pm", kind: "approval", title: "Project manager", detail: "Reviews the draft answer" },
    { id: "out", kind: "output", title: "Answer on record", detail: "Sent and logged" },
  ],
  edges: [
    { id: "e1", from: "in", to: "sort" },
    { id: "e2", from: "sort", to: "docs" },
    { id: "e3", from: "docs", to: "pm" },
    { id: "e4", from: "pm", to: "out" },
  ],
};
