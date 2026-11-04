import { FLOW_DEFINITION_VERSION, type FlowDefinition } from "@/lib/flow/definition";

/*
  Example flows for the site and the design system: AI agents and team members working on generic engineering firm work.
  Not client work, no real names, no figures. Every one is marked example: true and shows an Example tag.
  The site names no services (identity note, change of 2026-11-04), so the flows show the work and say nothing about selling it.
*/

export const drawingReviewFlow: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "drawing-review",
  title: "Drawing review",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Drawing set arrives", detail: "By email or the project folder" },
    { id: "read", kind: "agent", title: "Reads the drawings", detail: "Against the firm's checklist" },
    { id: "std", kind: "tool", title: "Project standards", detail: "The rules that apply here" },
    { id: "draft", kind: "agent", title: "Drafts comments", detail: "One line per issue, with the sheet" },
    { id: "check", kind: "approval", role: "Engineer", title: "Checks the comments", detail: "Approves or sends them back" },
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
  id: "site-question",
  title: "Question from site",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Question from site", detail: "A request for information" },
    { id: "sort", kind: "agent", title: "Sorts the question", detail: "Which discipline, how urgent" },
    { id: "pm", kind: "person", role: "Project manager", title: "Assigns it", detail: "To the right engineer" },
    { id: "docs", kind: "tool", title: "Project documents", detail: "Drawings and specs" },
    { id: "answer", kind: "agent", title: "Drafts the answer", detail: "With the references" },
    { id: "eng", kind: "approval", role: "Engineer", title: "Signs off", detail: "Or rewrites it" },
    { id: "out", kind: "output", title: "Answer on record", detail: "Sent and logged" },
  ],
  edges: [
    { id: "e1", from: "in", to: "sort" },
    { id: "e2", from: "sort", to: "pm" },
    { id: "e3", from: "pm", to: "docs" },
    { id: "e4", from: "docs", to: "answer" },
    { id: "e5", from: "answer", to: "eng" },
    { id: "e6", from: "eng", to: "out" },
  ],
};

export const inspectionFlow: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "site-inspection",
  title: "Site inspection",
  example: true,
  nodes: [
    { id: "visit", kind: "person", role: "Field technician", title: "Walks the site", detail: "Photos and notes on a phone" },
    { id: "sortp", kind: "agent", title: "Sorts the photos", detail: "By area and by finding" },
    { id: "report", kind: "agent", title: "Writes the report draft", detail: "Findings in the firm's format" },
    { id: "rev", kind: "approval", role: "Reviewer", title: "Checks the findings", detail: "Asks for a second look if needed" },
    { id: "out", kind: "output", title: "Report issued", detail: "To the project team" },
  ],
  edges: [
    { id: "e1", from: "visit", to: "sortp" },
    { id: "e2", from: "sortp", to: "report" },
    { id: "e3", from: "report", to: "rev" },
    { id: "e4", from: "rev", to: "out", label: "Approved" },
    { id: "e5", from: "rev", to: "visit", label: "Revisit", kind: "loop" },
  ],
};

export const meetingFlow: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "project-meeting",
  title: "After the project meeting",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Meeting notes", detail: "Typed or recorded" },
    { id: "actions", kind: "agent", title: "Lists the actions", detail: "Who said they would do what" },
    { id: "pm", kind: "person", role: "Project manager", title: "Sets owners and dates", detail: "Fixes anything misheard" },
    { id: "remind", kind: "agent", title: "Follows up", detail: "Reminders before each date" },
    { id: "out", kind: "output", title: "Action log kept", detail: "Up to date for the next meeting" },
  ],
  edges: [
    { id: "e1", from: "in", to: "actions" },
    { id: "e2", from: "actions", to: "pm" },
    { id: "e3", from: "pm", to: "remind" },
    { id: "e4", from: "remind", to: "out" },
  ],
};

/** The flows on the home page, in order. */
export const showcaseFlows = [drawingReviewFlow, rfiFlow, inspectionFlow, meetingFlow];

