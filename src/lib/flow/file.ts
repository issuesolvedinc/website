/*
  The flow note: how a flow is kept as a plain file, so the same file opens in the website, the web apps and an
  Obsidian vault (the way Excalidraw keeps drawings in .excalidraw.md notes). Plain data and pure functions, no
  React and no DOM, like definition.ts and theme.ts.

  A flow note is a markdown file, named <name>.flow.md:

    ---
    flow-file: 1
    flow-id: "supplier-invoice"
    flow-title: "Supplier invoice"
    flow-theme: "issuesolved"
    flow-motion: "subtle"            (only when it overrides the theme)
    ---
    Any markdown the person writes: notes, links to other notes. Kept as it is.

    ```flow-definition
    { the FlowDefinition or FlowChange, as JSON }
    ```

    ```flow-theme
    { a whole FlowTheme, as JSON: only for a theme that is not built in, such as a client theme }
    ```

  The JSON blocks are the truth. The front matter repeats the id, title and theme so a vault can search and list
  flows; other front matter keys are kept as they are. Values in the front matter are JSON strings, which YAML
  reads as plain strings. Writing a note and reading it back gives the same flow and theme.
*/

import { FLOW_DEFINITION_VERSION, validateFlow, unsharedNodes, type FlowChange, type FlowDefinition } from "./definition";
import { FLOW_THEME_VERSION, MOTION_LEVELS, flowTheme, validateTheme, type FlowTheme, type MotionLevel } from "./theme";

export const FLOW_FILE_VERSION = 1;

/** The code block languages. An Obsidian plugin draws a "flow-definition" block as the live flow. */
export const FLOW_BLOCK = "flow-definition";
export const THEME_BLOCK = "flow-theme";

export type FlowNote = {
  flow: FlowDefinition | FlowChange;
  /** A built-in theme's id, or a whole theme kept in the note. */
  theme: string | FlowTheme;
  /** Overrides the theme's motion level. Reduced motion still wins when it is drawn. */
  motion?: MotionLevel;
};

export const isChange = (flow: FlowDefinition | FlowChange): flow is FlowChange => "before" in flow;

const OURS = ["flow-file", "flow-id", "flow-title", "flow-theme", "flow-motion"];
const FRONT = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const block = (lang: string) => new RegExp("(?:^|\\n)```" + lang + "[ \\t]*\\r?\\n([\\s\\S]*?)\\r?\\n```[ \\t]*(?=\\r?\\n|$)", "g");

/** A theme is kept in the note when it is not one of the built-in themes, or differs from it. */
function keepsTheme(theme: string | FlowTheme): theme is FlowTheme {
  if (typeof theme === "string") return false;
  return JSON.stringify(flowTheme(theme.id)) !== JSON.stringify(theme);
}

function frontMatter(note: FlowNote, others: string[]): string {
  const flow = note.flow;
  const themeId = typeof note.theme === "string" ? note.theme : note.theme.id;
  const lines = [
    `flow-file: ${FLOW_FILE_VERSION}`,
    `flow-id: ${JSON.stringify(flow.id)}`,
    `flow-title: ${JSON.stringify(flow.title)}`,
    `flow-theme: ${JSON.stringify(themeId)}`,
    ...(note.motion ? [`flow-motion: ${JSON.stringify(note.motion)}`] : []),
    ...others,
  ];
  return `---\n${lines.join("\n")}\n---\n`;
}

function blocks(note: FlowNote): string {
  let out = "```" + FLOW_BLOCK + "\n" + JSON.stringify(note.flow, null, 2) + "\n```\n";
  if (keepsTheme(note.theme)) out += "\n```" + THEME_BLOCK + "\n" + JSON.stringify(note.theme, null, 2) + "\n```\n";
  return out;
}

/** Splits a note into its front matter lines that are not ours, and its markdown without our blocks. */
function strip(text: string): { others: string[]; body: string } {
  const m = FRONT.exec(text);
  const others = m ? m[1].split(/\r?\n/).filter((line) => !OURS.includes(line.split(":")[0].trim())) : [];
  let body = m ? text.slice(m[0].length) : text;
  body = body.replace(block(FLOW_BLOCK), "").replace(block(THEME_BLOCK), "");
  return { others: others.filter((l) => l.trim() !== ""), body: body.replace(/\s+$/, "") };
}

/** A new flow note. `body` is markdown placed above the flow, such as notes or links. */
export function writeFlowNote(note: FlowNote, body = ""): string {
  const text = body.trim() ? body.replace(/\s+$/, "") + "\n\n" : "";
  return frontMatter(note, []) + text + blocks(note);
}

/** The same note with a new flow, theme or motion. Everything the person wrote, and front matter not ours, stays. */
export function updateFlowNote(text: string, note: FlowNote): string {
  const { others, body } = strip(text);
  return frontMatter(note, others) + (body.trim() ? body + "\n\n" : "") + blocks(note);
}

export type ReadResult = { note: FlowNote | null; problems: string[] };

/** Reads a flow note. A note with problems returns them, and no flow when it cannot be drawn. */
export function readFlowNote(text: string): ReadResult {
  const problems: string[] = [];
  const fm = new Map<string, string>();
  const m = FRONT.exec(text);
  if (m)
    for (const line of m[1].split(/\r?\n/)) {
      const at = line.indexOf(":");
      if (at < 0) continue;
      const key = line.slice(0, at).trim();
      const raw = line.slice(at + 1).trim();
      if (!OURS.includes(key)) continue;
      try {
        fm.set(key, raw.startsWith('"') ? JSON.parse(raw) : raw);
      } catch {
        problems.push(`Front matter "${key}" is not a readable value.`);
      }
    }
  if (fm.has("flow-file") && Number(fm.get("flow-file")) > FLOW_FILE_VERSION)
    problems.push(`The note is flow file version ${fm.get("flow-file")}; this reader knows ${FLOW_FILE_VERSION}.`);

  const flows = [...text.matchAll(block(FLOW_BLOCK))];
  if (flows.length !== 1) return { note: null, problems: [...problems, `Expected one ${FLOW_BLOCK} block, found ${flows.length}.`] };
  let flow: FlowDefinition | FlowChange;
  try {
    flow = JSON.parse(flows[0][1]);
  } catch {
    return { note: null, problems: [...problems, `The ${FLOW_BLOCK} block is not valid JSON.`] };
  }
  const defs = isChange(flow) ? [flow.before, flow.after] : [flow];
  for (const def of defs) {
    if (def.version > FLOW_DEFINITION_VERSION)
      problems.push(`Flow "${def.id}" is definition version ${def.version}; this reader knows ${FLOW_DEFINITION_VERSION}.`);
    problems.push(...validateFlow(def));
  }
  if (isChange(flow)) {
    const loose = unsharedNodes(flow);
    if (loose.length) problems.push(`Before and after do not share these steps: ${loose.join(", ")}.`);
  }

  let theme: string | FlowTheme = String(fm.get("flow-theme") ?? flowTheme(undefined).id);
  const themes = [...text.matchAll(block(THEME_BLOCK))];
  if (themes.length > 1) problems.push(`Expected at most one ${THEME_BLOCK} block, found ${themes.length}.`);
  if (themes.length) {
    try {
      const t: FlowTheme = JSON.parse(themes[0][1]);
      if (t.version > FLOW_THEME_VERSION) problems.push(`Theme "${t.id}" is version ${t.version}; this reader knows ${FLOW_THEME_VERSION}.`);
      const bad = validateTheme(t);
      if (bad.length) problems.push(...bad);
      else theme = t;
    } catch {
      problems.push(`The ${THEME_BLOCK} block is not valid JSON.`);
    }
  } else if (flowTheme(theme).id !== theme) problems.push(`Theme "${theme}" is not built in; the flow draws in the default theme.`);

  const motion = fm.get("flow-motion") as MotionLevel | undefined;
  if (motion !== undefined && !MOTION_LEVELS.includes(motion)) problems.push(`Motion "${motion}" is not still, subtle or animated.`);

  return { note: { flow, theme, ...(motion && MOTION_LEVELS.includes(motion) ? { motion } : {}) }, problems };
}
