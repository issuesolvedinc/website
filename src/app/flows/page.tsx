import type { Metadata } from "next";
import { MainFlow } from "@/components/home/main-flow";
import { ProcessWorldView } from "@/components/home/process-world";
import { PROCESS_WORLDS } from "@/content/process-worlds";

// Temporary: the main map first, then the reference processes. Not linked anywhere.
export const metadata: Metadata = { title: "Flows", robots: { index: false } };

export default function Flows() {
  return (
    <main className="mx-auto flex max-w-[90rem] flex-col gap-14 px-[var(--gutter)] py-12">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-sm">Main</h2>
        <MainFlow />
      </section>
      {PROCESS_WORLDS.map((world, i) => (
        <section key={world.key} className="flex flex-col gap-3">
          <h2 className="font-mono text-sm">
            {String.fromCharCode(65 + i)}. {world.name}
          </h2>
          <ProcessWorldView world={world} />
        </section>
      ))}
    </main>
  );
}
