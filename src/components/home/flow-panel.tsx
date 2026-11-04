"use client";

import { useEffect, useState } from "react";
import { AgentFlow } from "@/components/agent-flow/agent-flow";
import { BackgroundBeams } from "@/components/effects/background-beams";
import type { FlowDefinition } from "@/lib/flow/definition";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * The running flow beside the page on wide screens. It shows the flow whose section is in the middle of the
 * screen and lights its steps one by one. The page already lists every step as text, so this is decoration
 * for screen readers and stays out of the accessibility tree.
 */
export function FlowPanel({ flows }: { flows: FlowDefinition[] }) {
  const wide = useMediaQuery("(min-width: 64rem)");
  const [activeId, setActiveId] = useState<string | undefined>(flows[0]?.id);

  useEffect(() => {
    if (!wide) return;
    const sections = document.querySelectorAll<HTMLElement>("[data-flow-id]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveId(e.target.getAttribute("data-flow-id") ?? undefined);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [wide]);

  const flow = flows.find((f) => f.id === activeId) ?? flows[0];
  if (!wide || !flow) return null;

  return (
    <div aria-hidden="true" className="relative flex h-full flex-col">
      <BackgroundBeams count={10} />
      <div className="relative flex-1 px-6 pb-6 pt-20 xl:px-10">
        <AgentFlow key={flow.id} flow={flow} direction="vertical" interactive={false} running textList={false} height="calc(100vh - 9.5rem)" />
      </div>
    </div>
  );
}

/** The same flow drawn inside its section on phones and tablets, where there is no room for the side panel. */
export function InlineFlow({ flow }: { flow: FlowDefinition }) {
  const wide = useMediaQuery("(min-width: 64rem)");
  if (wide) return null;
  return (
    <div aria-hidden="true" className="lg:hidden">
      <AgentFlow flow={flow} interactive={false} running textList={false} caption={false} />
    </div>
  );
}
