"use client";

import { useState } from "react";
import { AgentFlow } from "@/components/agent-flow/agent-flow";
import { MainFlow } from "@/components/home/main-flow";
import { ProcessWorldView } from "@/components/home/process-world";
import { invoices } from "@/content/process-worlds";
import { cx } from "@/lib/cx";
import { FLOW_DEFINITION_VERSION, type FlowDefinition } from "@/lib/flow/definition";
import { DEFAULT_FLOW_THEME, FLOW_THEMES, MOTION_LEVELS, type MotionLevel } from "@/lib/flow/theme";
import { FlowThemeProvider } from "./flow-theme";

/*
  The theme switcher, for the design system page only: the same flows under every theme, so the founder can
  compare. One value changes the look of all three engines below it. Light and dark follow the page toggle.
*/

const sample: FlowDefinition = {
  version: FLOW_DEFINITION_VERSION,
  id: "supplier-invoice",
  title: "Supplier invoice",
  example: true,
  nodes: [
    { id: "in", kind: "input", title: "Invoice arrives", detail: "By email" },
    { id: "read", kind: "agent", title: "Reads and matches it", detail: "Against the order" },
    { id: "ok", kind: "approval", role: "Manager", title: "Approves", detail: "Or sends it back" },
    { id: "pay", kind: "person", role: "Bookkeeper", title: "Releases payment", queue: 3 },
    { id: "out", kind: "output", title: "Paid and filed" },
  ],
  edges: [
    { id: "e1", from: "in", to: "read", pace: "steady" },
    { id: "e2", from: "read", to: "ok", pace: "slow" },
    { id: "e3", from: "ok", to: "pay", label: "Approved" },
    { id: "e4", from: "ok", to: "read", label: "Changes", kind: "loop" },
    { id: "e5", from: "pay", to: "out" },
  ],
};

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; name: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            "min-h-11 border px-4 text-sm transition-colors duration-[var(--duration)]",
            o.value === value ? "border-fg font-semibold text-fg" : "border-rule text-fg-muted hover:text-fg",
          )}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function FlowThemeLab() {
  const [theme, setTheme] = useState(DEFAULT_FLOW_THEME);
  const [motion, setMotion] = useState<MotionLevel | "theme">("theme");
  const current = FLOW_THEMES.find((t) => t.id === theme)!;
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <Choice
          label="Theme"
          options={FLOW_THEMES.map((t) => ({ value: t.id, name: t.name }))}
          value={theme}
          onChange={setTheme}
        />
        <Choice
          label="Motion"
          options={[
            { value: "theme" as const, name: `As the theme (${current.motion})` },
            ...MOTION_LEVELS.map((m) => ({ value: m, name: m[0].toUpperCase() + m.slice(1) })),
          ]}
          value={motion}
          onChange={setMotion}
        />
        <p className="text-sm text-fg-muted" aria-live="polite">
          {current.name}: {current.description}
        </p>
      </div>
      <FlowThemeProvider theme={theme} motion={motion === "theme" ? undefined : motion}>
        <div className="grid gap-10">
          <MainFlow />
          <ProcessWorldView world={invoices} />
          <AgentFlow flow={sample} running />
        </div>
      </FlowThemeProvider>
    </div>
  );
}
