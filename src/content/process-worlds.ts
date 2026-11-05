/*
  Business processes for the home page flow, as data. Each one plays twice on a loop: before (people pass the
  work around in their tools, it waits, comes back to be fixed, and you get the pile at the end) and after (an
  agent takes the work in at the start and passes it on at a steady pace).

  The grid: a column of sources on the left (where the work comes from), then six columns and three rows of
  steps. A wire to an earlier column runs back along the top or the bottom of the canvas: rework.
  Nothing here is a claim; there are no results on the page.
*/

export type Phase = "before" | "after";
export type When = Phase | "both";
/** One value, or [before, after]. */
export type Both<T> = T | readonly [T, T];

/** The tool a step happens in: its colour and its icon. */
export type Tool =
  | "email"
  | "pdf"
  | "form"
  | "phone"
  | "chat"
  | "sheet"
  | "ledger"
  | "crm"
  | "billing"
  | "projects"
  | "calendar"
  | "approval"
  | "wait"
  | "docs"
  | "video"
  | "plans"
  | "contract"
  | "backlog"
  | "delivered"
  | "agent"
  | "you"
  | "team";
/** What travels on the wires. */
export type ItemKind =
  "mail" | "pdf" | "form" | "call" | "chat" | "plan" | "contract";
/** Who works the step: a person, the agent, you, or nobody (a system). */
export type Who = "person" | "agent" | "you" | "none";

export type ProcessNode = {
  id: string;
  /** -1 is the source column; then 0 to 5. */
  col: number;
  /** 0 to 2; in the source column, 0 to 3. */
  row: number;
  title: Both<string>;
  tool: Both<Tool>;
  who?: Both<Who>;
  /** The phase the node is in. Default both. */
  when?: When;
  /** Seconds per item, one at a time. */
  serve?: Both<number>;
  /** A waiting step: every item sits this long, side by side. */
  hold?: Both<number>;
  /** After: one item passed on every `pace` seconds; the rest is handled here. */
  pace?: number;
  /** A source: what it sends, and roughly how often. */
  spawn?: { item: ItemKind; every: number };
};

export type ProcessWire = {
  from: string;
  to: string;
  when?: When;
  /** Share of the items leaving `from` that take this wire. */
  w?: number;
  /** Also sends a copy: the same thing typed in again somewhere else. */
  copy?: boolean;
  /** Run along the top or the bottom of the canvas instead of straight across. */
  route?: "over" | "under";
};

export type ProcessWorld = {
  key: string;
  name: string;
  nodes: ProcessNode[];
  wires: ProcessWire[];
};

const source = (
  id: string,
  row: number,
  title: string,
  tool: Tool,
  item: ItemKind,
  every = 1,
): ProcessNode => ({
  id,
  col: -1,
  row,
  title,
  tool,
  spawn: { item, every },
});
const you: ProcessNode = {
  id: "you",
  col: 5,
  row: 1,
  title: "You",
  tool: "you",
  who: "you",
  serve: [2.0, 0.3],
};
/** Calls asking where things are: some go straight to you, before. */
const calls = (into: string): ProcessWire[] => [
  { from: "phone", to: into, w: 0.4 },
  { from: "phone", to: "you", when: "before", w: 0.6, route: "under" },
  { from: "phone", to: into, when: "after", w: 0.6 },
];

export const invoices: ProcessWorld = {
  key: "invoices",
  name: "Supplier invoices",
  nodes: [
    source("email", 0, "Email", "email", "mail", 0.8),
    source("scans", 1, "Scans", "pdf", "pdf", 1.1),
    source("portal", 2, "Portal", "form", "form", 1.3),
    source("phone", 3, "Phone", "phone", "call", 1.6),
    {
      id: "in",
      col: 0,
      row: 1,
      title: ["Inbox", "Intake"],
      tool: ["email", "agent"],
      who: ["person", "agent"],
      serve: [0.2, 0.06],
      pace: 0.6,
    },
    {
      id: "entry",
      col: 1,
      row: 1,
      title: "Data entry",
      tool: "sheet",
      who: "person",
      when: "before",
      serve: 0.35,
    },
    {
      id: "po",
      col: 2,
      row: 1,
      title: "PO match",
      tool: "docs",
      who: "person",
      when: "before",
      serve: 0.5,
    },
    {
      id: "ledger",
      col: 2,
      row: 2,
      title: "Accounting",
      tool: "ledger",
      serve: 0.15,
    },
    {
      id: "buyer",
      col: 3,
      row: 2,
      title: "Purchasing",
      tool: "chat",
      who: "person",
      when: "before",
      serve: 0.9,
    },
    {
      id: "wait",
      col: 3,
      row: 0,
      title: "Waiting",
      tool: "wait",
      when: "before",
      hold: 2.4,
    },
    {
      id: "approve",
      col: 4,
      row: 0,
      title: "Approval",
      tool: "approval",
      who: "person",
      serve: [1.8, 0.4],
    },
    you,
  ],
  wires: [
    { from: "email", to: "in" },
    { from: "scans", to: "in" },
    { from: "portal", to: "in" },
    ...calls("in"),
    { from: "in", to: "entry", when: "before" },
    { from: "entry", to: "po", when: "before" },
    { from: "entry", to: "ledger", when: "before", copy: true },
    { from: "po", to: "wait", when: "before", w: 0.65 },
    { from: "po", to: "buyer", when: "before", w: 0.35 },
    { from: "buyer", to: "po", when: "before" },
    { from: "wait", to: "approve", when: "before", w: 0.85 },
    { from: "wait", to: "in", when: "before", w: 0.15, route: "over" },
    { from: "approve", to: "you", w: 0.8 },
    { from: "approve", to: "entry", when: "before", w: 0.2, route: "over" },
    { from: "in", to: "approve", when: "after", w: 0.4 },
    { from: "in", to: "ledger", when: "after", w: 0.6 },
    { from: "ledger", to: "you", when: "after" },
  ],
};

export const onboarding: ProcessWorld = {
  key: "onboarding",
  name: "Client onboarding",
  nodes: [
    source("email", 0, "Email", "email", "mail", 0.8),
    source("forms", 1, "Web form", "form", "form", 1.1),
    source("docs", 2, "Documents", "pdf", "pdf", 1.2),
    source("phone", 3, "Phone", "phone", "call", 1.6),
    {
      id: "in",
      col: 0,
      row: 1,
      title: ["New clients", "Onboarding"],
      tool: ["email", "agent"],
      who: ["person", "agent"],
      serve: [0.2, 0.06],
      pace: 0.65,
    },
    {
      id: "lead",
      col: 1,
      row: 1,
      title: "Account lead",
      tool: "email",
      who: "person",
      when: "before",
      serve: 0.35,
    },
    {
      id: "client",
      col: 2,
      row: 0,
      title: "Client",
      tool: "wait",
      when: "before",
      hold: 2.6,
    },
    {
      id: "check",
      col: 2,
      row: 2,
      title: "Compliance",
      tool: "docs",
      who: "person",
      when: "before",
      serve: 1.6,
    },
    {
      id: "setup",
      col: 3,
      row: 1,
      title: "Setup",
      tool: "sheet",
      who: "person",
      when: "before",
      serve: 0.6,
    },
    { id: "crm", col: 4, row: 0, title: "CRM", tool: "crm", serve: 0.15 },
    {
      id: "billing",
      col: 4,
      row: 1,
      title: "Billing",
      tool: "billing",
      serve: 0.15,
    },
    {
      id: "projects",
      col: 4,
      row: 2,
      title: "Projects",
      tool: "projects",
      serve: 0.15,
    },
    you,
  ],
  wires: [
    { from: "email", to: "in" },
    { from: "forms", to: "in" },
    { from: "docs", to: "in" },
    ...calls("in"),
    { from: "in", to: "lead", when: "before" },
    { from: "lead", to: "client", when: "before", w: 0.45 },
    { from: "client", to: "lead", when: "before", route: "over" },
    { from: "lead", to: "check", when: "before", w: 0.55 },
    { from: "check", to: "lead", when: "before", w: 0.3, route: "under" },
    { from: "check", to: "setup", when: "before", w: 0.7 },
    { from: "setup", to: "crm", when: "before" },
    { from: "setup", to: "billing", when: "before", copy: true },
    { from: "setup", to: "projects", when: "before", copy: true },
    { from: "crm", to: "you" },
    { from: "billing", to: "you", when: "before" },
    { from: "projects", to: "you", when: "before" },
    { from: "in", to: "crm", when: "after" },
    { from: "in", to: "billing", when: "after", copy: true },
    { from: "in", to: "projects", when: "after", copy: true },
  ],
};

export const quotes: ProcessWorld = {
  key: "quotes",
  name: "Quote requests",
  nodes: [
    source("email", 0, "Email", "email", "mail", 0.8),
    source("forms", 1, "Web form", "form", "form", 1.1),
    source("drawings", 2, "Drawings", "pdf", "pdf", 1.3),
    source("phone", 3, "Phone", "phone", "call", 1.5),
    {
      id: "in",
      col: 0,
      row: 1,
      title: ["Requests", "Quoting"],
      tool: ["email", "agent"],
      who: ["person", "agent"],
      serve: [0.2, 0.06],
      pace: 0.7,
    },
    {
      id: "sales",
      col: 1,
      row: 1,
      title: "Sales",
      tool: "crm",
      who: "person",
      when: "before",
      serve: 0.35,
    },
    {
      id: "eng",
      col: 2,
      row: 0,
      title: "Engineering",
      tool: "docs",
      who: "person",
      when: "before",
      serve: 1.0,
    },
    {
      id: "suppliers",
      col: 2,
      row: 2,
      title: "Suppliers",
      tool: "wait",
      when: "before",
      hold: 2.4,
    },
    {
      id: "estimate",
      col: 3,
      row: 1,
      title: "Estimator",
      tool: "sheet",
      who: "person",
      serve: [1.5, 0.35],
    },
    {
      id: "approve",
      col: 4,
      row: 0,
      title: "Approval",
      tool: "approval",
      who: "person",
      when: "before",
      serve: 1.6,
    },
    {
      id: "customer",
      col: 4,
      row: 2,
      title: "Customer",
      tool: "email",
      hold: [2.0, 0.9],
    },
    you,
  ],
  wires: [
    { from: "email", to: "in" },
    { from: "forms", to: "in" },
    { from: "drawings", to: "in" },
    ...calls("in"),
    { from: "in", to: "sales", when: "before" },
    { from: "sales", to: "eng", when: "before", w: 0.5 },
    { from: "sales", to: "suppliers", when: "before", w: 0.5 },
    { from: "eng", to: "sales", when: "before", w: 0.3, route: "over" },
    { from: "eng", to: "estimate", when: "before", w: 0.7 },
    { from: "suppliers", to: "estimate", when: "before" },
    { from: "estimate", to: "approve", when: "before", w: 0.65 },
    { from: "estimate", to: "customer", w: 0.35 },
    { from: "approve", to: "you", when: "before", w: 0.7 },
    { from: "approve", to: "estimate", when: "before", w: 0.3, route: "over" },
    {
      from: "customer",
      to: "estimate",
      when: "before",
      w: 0.6,
      route: "under",
    },
    { from: "customer", to: "you", w: 0.4 },
    { from: "in", to: "estimate", when: "after" },
  ],
};

export const hiring: ProcessWorld = {
  key: "hiring",
  name: "Hiring",
  nodes: [
    source("boards", 0, "Job boards", "form", "form", 0.8),
    source("email", 1, "Email", "email", "mail", 1.0),
    source("referrals", 2, "Referrals", "chat", "chat", 1.4),
    source("phone", 3, "Phone", "phone", "call", 1.6),
    {
      id: "in",
      col: 0,
      row: 1,
      title: ["Applicants", "Screening"],
      tool: ["form", "agent"],
      who: ["person", "agent"],
      serve: [0.2, 0.06],
      pace: 0.75,
    },
    {
      id: "recruiter",
      col: 1,
      row: 1,
      title: "Recruiter",
      tool: "email",
      who: "person",
      when: "before",
      serve: 0.32,
    },
    {
      id: "lead",
      col: 2,
      row: 0,
      title: "Hiring lead",
      tool: "chat",
      who: "person",
      serve: [1.7, 0.45],
    },
    {
      id: "sched",
      col: 2,
      row: 2,
      title: "Scheduling",
      tool: "calendar",
      when: "before",
      hold: 2.4,
    },
    {
      id: "panel",
      col: 3,
      row: 1,
      title: "Interviews",
      tool: "video",
      who: "person",
      serve: [0.9, 0.45],
    },
    {
      id: "offer",
      col: 4,
      row: 0,
      title: "Offer",
      tool: "approval",
      who: "person",
      serve: [1.5, 0.4],
    },
    you,
  ],
  wires: [
    { from: "boards", to: "in" },
    { from: "email", to: "in" },
    { from: "referrals", to: "in" },
    ...calls("in"),
    { from: "in", to: "recruiter", when: "before" },
    { from: "recruiter", to: "lead", when: "before", w: 0.6 },
    { from: "recruiter", to: "sched", when: "before", w: 0.4 },
    { from: "lead", to: "recruiter", when: "before", w: 0.35, route: "over" },
    { from: "lead", to: "panel", w: 0.65 },
    { from: "sched", to: "panel", when: "before", w: 0.75 },
    { from: "sched", to: "recruiter", when: "before", w: 0.25, route: "under" },
    { from: "panel", to: "offer", w: 0.6 },
    { from: "panel", to: "lead", when: "before", w: 0.4, route: "over" },
    { from: "offer", to: "you", w: 0.75 },
    { from: "offer", to: "panel", when: "before", w: 0.25, route: "over" },
    { from: "in", to: "lead", when: "after" },
  ],
};

export const PROCESS_WORLDS = [invoices, onboarding, quotes, hiring];
