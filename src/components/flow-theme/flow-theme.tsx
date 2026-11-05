"use client";

import { createContext, useContext } from "react";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import {
  DEFAULT_FLOW_THEME,
  effectiveMotion,
  flowTheme,
  flowThemeCss,
  type FlowTheme,
  type MotionLevel,
} from "@/lib/flow/theme";

/*
  The React side of flow themes. A page picks a theme for every flow inside it with FlowThemeProvider, or one flow
  takes a theme prop. Each engine calls useFlowLook at its root, puts lookAttrs on its outer element and renders
  FlowThemeStyle once; React hoists the style into the head and keeps one copy per theme.
*/

type Choice = { theme?: string; motion?: MotionLevel };

const ChoiceContext = createContext<Choice>({});

/** Sets the theme, and optionally a motion level that overrides the theme's, for every flow inside. */
export function FlowThemeProvider({
  theme,
  motion,
  children,
}: Choice & { children: React.ReactNode }) {
  return <ChoiceContext.Provider value={{ theme, motion }}>{children}</ChoiceContext.Provider>;
}

/** What an engine draws with: the theme, the motion it really gets, and whether the extra effects run. */
export type FlowLook = {
  theme: FlowTheme;
  motion: MotionLevel;
  /** True only at "animated": ripples, sweep, shake, marching wires, moving figures. */
  fx: boolean;
};

/** The look for one flow: its own props first, then the nearest provider, then the default theme. */
export function useFlowLook(theme?: string, motion?: MotionLevel): FlowLook {
  const choice = useContext(ChoiceContext);
  const reduced = usePrefersReducedMotion();
  const t = flowTheme(theme ?? choice.theme ?? DEFAULT_FLOW_THEME);
  const m = effectiveMotion(motion ?? choice.motion ?? t.motion, reduced);
  return { theme: t, motion: m, fx: m === "animated" };
}

/** The data attributes the theme's CSS and the motion rules hang on. */
export const lookAttrs = (look: FlowLook) => ({
  "data-flow-theme": look.theme.id,
  "data-flow-motion": look.motion,
});

/** The theme's CSS variables. Safe to render many times: React keeps one per theme. */
export function FlowThemeStyle({ theme }: { theme: FlowTheme }) {
  return (
    <style href={`flow-theme-${theme.id}`} precedence="default">
      {flowThemeCss(theme)}
    </style>
  );
}

/** Inside an engine: the look its drawing parts read (corner sizes, effects on or off). */
const LookContext = createContext<FlowLook>({
  theme: flowTheme(DEFAULT_FLOW_THEME),
  motion: "animated",
  fx: true,
});

export const LookProvider = LookContext.Provider;
export const useLook = () => useContext(LookContext);
