/*
  Flow themes: how a flow looks and moves, kept apart from what it says.
  Plain data and pure functions, no React and no DOM, like definition.ts, so the ai-workflows repo can copy this
  file as is. A flow definition never names a theme: the page that draws it picks one, and any flow draws under any
  theme by changing that one value.

  A theme sets colour, type, shapes, motion and density. Colours are CSS colours; page tokens such as var(--fg)
  follow light and dark by themselves, so most themes only list the few colours that change in the dark. The
  engines read the colours as CSS variables (--ft-*) and the rest as data.
*/

export const FLOW_THEME_VERSION = 1;

/**
 * How much a flow moves. "still" draws one frame. "subtle" moves the work (items travel, queues fill and drain,
 * clocks run) and nothing else. "animated" adds the ripples, the sweep, the shake, marching wires and the figures.
 * Reduced motion always turns any level into "still".
 */
export type MotionLevel = "still" | "subtle" | "animated";

export const MOTION_LEVELS: MotionLevel[] = ["still", "subtle", "animated"];

/** How close steps sit in a flow that is laid out for you. Maps with a fixed layout, like the main map, keep theirs. */
export type Density = "comfortable" | "compact";

export type FlowColors = {
  /** The canvas, its grid dots and its outer frame. */
  canvas: string;
  grid: string;
  frame: string;
  /** A card, its header band and its edge. */
  card: string;
  cardHead: string;
  edge: string;
  /** A quiet wire, and the track under a progress bar. */
  wire: string;
  track: string;
  /** People, ports, clock hands and other line work. */
  ink: string;
  /** Count bubbles at rest and quiet figures. */
  muted: string;
  /** Glyphs, ticks and counts drawn on a coloured tile, a ticket or a bubble. */
  onColor: string;
  /** The paper of a work item: an envelope, a scan, a form. */
  paper: string;
  /** Work moving. */
  flow: string;
  /** The connected line: borders, pipe, rings, desks, tickets, the big check. */
  ok: string;
  /** The small check badge on people on the main map. */
  check: string;
  /** Work sent back. Always drawn dashed as well, so it reads without colour. */
  rework: string;
  /** The warning triangle on a step nothing reaches. */
  warn: string;
  /** Heat and overload. */
  hot: string;
  /** The moving light and agent edge in AgentFlow. */
  accent: string;
  /** The accent when it is text. */
  accentText: string;
  /** One colour per tool, by tool name. */
  tools: Record<string, string>;
  /** One colour per kind of travelling work, by item name. */
  items: Record<string, string>;
};

export type FlowType = {
  /** Card titles, counts and lane labels. */
  sans: string;
  /** Step titles and details in AgentFlow. */
  text: string;
  /** Small labels in AgentFlow: the kind of step, counts, arrow labels. */
  label: string;
  /** Card title size, in canvas pixels. */
  title: number;
  /** Lane label size and weight, in canvas pixels. */
  lane: number;
  laneWeight: number;
};

export type FlowShape = {
  /** Corner radius of a card. Pills, chips and desks follow it. 0 is square. */
  radius: number;
  /** Corner radius of the canvas. */
  frame: number;
  /** Corner radius of a tool tile, as a share of its size. */
  tile: number;
  /** Line weight of cards and quiet wires, 1 as drawn today. */
  line: number;
  /** Strength of the soft halos around hot cards and the connected line: 1 as drawn today, 0 for none. */
  glow: number;
};

export type FlowTheme = {
  version: typeof FLOW_THEME_VERSION;
  id: string;
  name: string;
  /** One line on when to use it. */
  description: string;
  /** Light colours, and only what changes in the dark. */
  colors: { light: FlowColors; dark?: Partial<FlowColors> };
  type: FlowType;
  shape: FlowShape;
  motion: MotionLevel;
  density: Density;
};

/** Everything a new theme may change from the one it starts from. */
export type FlowThemeChange = {
  id: string;
  name: string;
  description: string;
  colors?: { light?: Partial<FlowColors>; dark?: Partial<FlowColors> };
  type?: Partial<FlowType>;
  shape?: Partial<FlowShape>;
  motion?: MotionLevel;
  density?: Density;
};

const TOOL_NAMES = [
  "email",
  "pdf",
  "form",
  "phone",
  "chat",
  "sheet",
  "ledger",
  "crm",
  "billing",
  "projects",
  "calendar",
  "approval",
  "wait",
  "docs",
  "video",
  "plans",
  "contract",
  "backlog",
  "delivered",
  "agent",
  "you",
  "team",
] as const;

const ITEM_NAMES = ["mail", "pdf", "form", "call", "chat", "plan", "contract"] as const;

/** The same colour for every tool or item, for themes without colour. */
const all = (names: readonly string[], color: string) => Object.fromEntries(names.map((n) => [n, color]));

/** Today's site: ink and paper, colour on the tools and on the work, green for the connected line. */
export const ISSUESOLVED_THEME: FlowTheme = {
  version: FLOW_THEME_VERSION,
  id: "issuesolved",
  name: "IssueSolved",
  description: "The site as it is: tool colours, blue work, green connected line, orange checks, full motion.",
  colors: {
    light: {
      canvas: "color-mix(in srgb, var(--fg) 2.5%, var(--bg))",
      grid: "color-mix(in srgb, var(--fg) 16%, transparent)",
      frame: "color-mix(in srgb, var(--fg) 18%, transparent)",
      card: "color-mix(in srgb, var(--bg) 45%, white)",
      cardHead: "color-mix(in srgb, var(--fg) 3%, transparent)",
      edge: "color-mix(in srgb, var(--fg) 16%, transparent)",
      wire: "color-mix(in srgb, var(--fg) 32%, transparent)",
      track: "color-mix(in srgb, var(--fg) 8%, transparent)",
      ink: "var(--fg)",
      muted: "color-mix(in srgb, var(--fg) 45%, var(--bg))",
      onColor: "#fff",
      paper: "#fff",
      flow: "var(--flow)",
      ok: "var(--ok)",
      check: "var(--orange)",
      rework: "#e79c00",
      warn: "#e79c00",
      hot: "#e5484d",
      accent: "var(--accent)",
      accentText: "var(--accent-fg)",
      tools: {
        email: "#2f6feb",
        pdf: "#e5484d",
        form: "#6e56cf",
        phone: "#12a594",
        chat: "#8e4ec6",
        sheet: "#1f9d55",
        ledger: "#0d9488",
        crm: "#f76b15",
        billing: "#0091ff",
        projects: "#3e63dd",
        calendar: "#e54666",
        approval: "#e79c00",
        wait: "#8d8d86",
        docs: "#a1724e",
        video: "#0ea5e9",
        plans: "#6e56cf",
        contract: "#d6409f",
        backlog: "#3e63dd",
        delivered: "var(--orange)",
        agent: "var(--fg)",
        you: "var(--fg)",
        team: "var(--fg)",
      },
      items: {
        mail: "#2f6feb",
        pdf: "#e5484d",
        form: "#6e56cf",
        call: "#12a594",
        chat: "#8e4ec6",
        plan: "#6e56cf",
        contract: "#d6409f",
      },
    },
    dark: { card: "color-mix(in srgb, var(--bg) 90%, white)" },
  },
  type: {
    sans: "var(--font-sans)",
    text: "var(--font-serif)",
    label: "var(--font-mono)",
    title: 11,
    lane: 20,
    laneWeight: 600,
  },
  shape: { radius: 10, frame: 16, tile: 0.28, line: 1, glow: 1 },
  motion: "animated",
  density: "comfortable",
};

/**
 * Formal and print: ink on paper, no colour at all. Meaning that colour carried elsewhere is kept by shape:
 * rework stays dashed, warnings keep their triangle, tickets are filled and work items are outlined.
 */
export const BLACK_AND_WHITE_THEME: FlowTheme = {
  version: FLOW_THEME_VERSION,
  id: "black-and-white",
  name: "Black and White",
  description: "Formal documents and print: ink and paper only, square corners, firmer lines, calm motion.",
  colors: {
    light: {
      canvas: "var(--bg)",
      grid: "color-mix(in srgb, var(--fg) 12%, transparent)",
      frame: "color-mix(in srgb, var(--fg) 45%, transparent)",
      card: "var(--bg)",
      cardHead: "color-mix(in srgb, var(--fg) 6%, transparent)",
      edge: "color-mix(in srgb, var(--fg) 55%, transparent)",
      wire: "color-mix(in srgb, var(--fg) 50%, transparent)",
      track: "color-mix(in srgb, var(--fg) 12%, transparent)",
      ink: "var(--fg)",
      muted: "color-mix(in srgb, var(--fg) 55%, var(--bg))",
      onColor: "var(--bg)",
      paper: "var(--bg)",
      flow: "var(--fg)",
      ok: "var(--fg)",
      check: "var(--fg)",
      rework: "var(--fg-muted)",
      warn: "var(--fg)",
      hot: "var(--fg)",
      accent: "var(--fg)",
      accentText: "var(--fg)",
      tools: all(TOOL_NAMES, "var(--fg)"),
      items: all(ITEM_NAMES, "var(--fg)"),
    },
  },
  type: ISSUESOLVED_THEME.type,
  shape: { radius: 0, frame: 0, tile: 0, line: 1.25, glow: 0 },
  motion: "subtle",
  density: "compact",
};

/** Makes a new theme from an existing one, changing only what is given. Client themes start here. */
export function extendTheme(base: FlowTheme, change: FlowThemeChange): FlowTheme {
  const light = { ...base.colors.light, ...change.colors?.light };
  if (change.colors?.light?.tools) light.tools = { ...base.colors.light.tools, ...change.colors.light.tools };
  if (change.colors?.light?.items) light.items = { ...base.colors.light.items, ...change.colors.light.items };
  const dark = base.colors.dark || change.colors?.dark ? { ...base.colors.dark, ...change.colors?.dark } : undefined;
  return {
    version: FLOW_THEME_VERSION,
    id: change.id,
    name: change.name,
    description: change.description,
    colors: { light, dark },
    type: { ...base.type, ...change.type },
    shape: { ...base.shape, ...change.shape },
    motion: change.motion ?? base.motion,
    density: change.density ?? base.density,
  };
}

/** The IssueSolved look with no motion: for screenshots, slides and pages where nothing should move. */
export const STILL_THEME: FlowTheme = extendTheme(ISSUESOLVED_THEME, {
  id: "still",
  name: "Still",
  description: "The IssueSolved look as one still frame: slides, screenshots, quiet pages.",
  motion: "still",
});

export const FLOW_THEMES: FlowTheme[] = [ISSUESOLVED_THEME, BLACK_AND_WHITE_THEME, STILL_THEME];

export const DEFAULT_FLOW_THEME = ISSUESOLVED_THEME.id;

/** A theme by id. Unknown ids fall back to the default, so a flow always draws. */
export function flowTheme(id: string | undefined): FlowTheme {
  return FLOW_THEMES.find((t) => t.id === id) ?? ISSUESOLVED_THEME;
}

/** The motion a flow really gets. Reduced motion always wins over the theme. */
export function effectiveMotion(level: MotionLevel, reducedMotion: boolean): MotionLevel {
  return reducedMotion ? "still" : level;
}

/** Spacing for flows that are laid out for you: a factor on the gap between steps, and the padding in a step. */
export const DENSITY: Record<Density, { gap: number; pad: string }> = {
  comfortable: { gap: 1, pad: "0.7rem 0.85rem 0.8rem" },
  compact: { gap: 0.82, pad: "0.45rem 0.6rem 0.5rem" },
};

const UNSAFE = /[{};<>]|\/\*/;

/** Returns the problems in a theme. An empty list means it can be used. */
export function validateTheme(theme: FlowTheme): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9-]+$/.test(theme.id)) problems.push(`Theme id "${theme.id}" must be lower case letters, digits and hyphens.`);
  const check = (where: string, colors: Partial<FlowColors> | undefined) => {
    for (const [key, value] of Object.entries(colors ?? {})) {
      const values = typeof value === "string" ? [value] : Object.values(value ?? {});
      for (const v of values) if (UNSAFE.test(v)) problems.push(`${where} colour "${key}" has a character CSS cannot take.`);
    }
  };
  check("Light", theme.colors.light);
  check("Dark", theme.colors.dark);
  for (const name of TOOL_NAMES) if (!theme.colors.light.tools[name]) problems.push(`No colour for the tool "${name}".`);
  for (const name of ITEM_NAMES) if (!theme.colors.light.items[name]) problems.push(`No colour for the item "${name}".`);
  for (const f of [theme.type.sans, theme.type.text, theme.type.label])
    if (UNSAFE.test(f)) problems.push(`Font "${f}" has a character CSS cannot take.`);
  if (theme.shape.radius < 0 || theme.shape.frame < 0 || theme.shape.tile < 0 || theme.shape.tile > 0.5)
    problems.push("Corner sizes must be 0 or more, and the tile share at most 0.5.");
  if (theme.shape.line <= 0) problems.push("Line weight must be above 0.");
  if (theme.shape.glow < 0 || theme.shape.glow > 1) problems.push("Glow must be between 0 and 1.");
  return problems;
}

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

function colorVars(colors: Partial<FlowColors>): string {
  const out: string[] = [];
  for (const [key, value] of Object.entries(colors)) {
    if (key === "tools" || key === "items") {
      const prefix = key === "tools" ? "tool" : "item";
      for (const [name, c] of Object.entries(value as Record<string, string>)) out.push(`--ft-${prefix}-${name}:${c}`);
    } else out.push(`--ft-${kebab(key)}:${value}`);
  }
  return out.join(";");
}

/**
 * The CSS for one theme, scoped to [data-flow-theme="<id>"]. Light first, then the dark changes for a page that
 * follows the system and for one forced dark with data-theme, as the site's tokens do.
 */
export function flowThemeCss(theme: FlowTheme): string {
  const problems = validateTheme(theme);
  if (problems.length) throw new Error(`Flow theme "${theme.id}": ${problems.join(" ")}`);
  const sel = `[data-flow-theme="${theme.id}"]`;
  const { type, shape } = theme;
  const rest = [
    `--ft-sans:${type.sans}`,
    `--ft-text:${type.text}`,
    `--ft-label:${type.label}`,
    `--ft-title-size:${type.title}px`,
    `--ft-lane-size:${type.lane}px`,
    `--ft-lane-weight:${type.laneWeight}`,
    `--ft-line:${shape.line}`,
    `--ft-pad:${DENSITY[theme.density].pad}`,
  ].join(";");
  let css = `${sel}{${colorVars(theme.colors.light)};${rest}}`;
  if (theme.colors.dark && Object.keys(theme.colors.dark).length) {
    const dark = colorVars(theme.colors.dark);
    css += `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) ${sel}{${dark}}}`;
    css += `[data-theme="dark"] ${sel},${sel}[data-theme="dark"]{${dark}}`;
  }
  return css;
}
