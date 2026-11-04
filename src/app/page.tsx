import { Label, TextLink, Wordmark } from "@/components";
import { FlowPanel, InlineFlow } from "@/components/home/flow-panel";
import { OfficeWorld } from "@/components/home/office-world";
import { HEADLINE } from "@/content/headline";
import { showcaseFlows } from "@/content/example-flows";
import {
  stepLabel,
  orderSteps,
  type FlowDefinition,
} from "@/lib/flow/definition";

// The headline is the only line on the site that says what IssueSolved does (identity note, change of 2026-11-05).
// Everything else from the change of 2026-11-04 holds: no services list, no offerings, no promises. Under the
// headline, a small office in black and white plays on its own: work (in blue) piles up at one person,
// then an agent joins and the pile goes down. Nothing to click.
// The example flows follow in direction B: a running flow beside the page follows the reader.

const EMAIL = "contact@issuesolved.ca";

export default function Home() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-[var(--gutter)] pt-6">
        <span className="flex items-center gap-4">
          <Wordmark className="w-36" />
          <Label>Process flows</Label>
        </span>
        <TextLink href={`mailto:${EMAIL}`} className="font-mono text-sm">
          {EMAIL}
        </TextLink>
      </header>

      <section
        aria-labelledby="headline"
        className="px-[var(--gutter)] pb-16 pt-14 md:pb-24 md:pt-20"
      >
        <h1
          id="headline"
          className="max-w-[52rem] text-pretty text-3xl font-semibold md:text-[3.5rem] md:leading-[1.05]"
        >
          {HEADLINE}
        </h1>
        <div className="mt-10 md:mt-14">
          <OfficeWorld className="max-w-[60rem]" />
        </div>
      </section>

      <div className="border-t border-rule lg:grid lg:grid-cols-[minmax(22rem,34rem)_minmax(0,1fr)]">
        <aside
          data-theme="dark"
          className="hidden border-r border-rule bg-bg text-fg lg:block"
        >
          <div className="sticky top-0 h-screen overflow-hidden">
            <FlowPanel flows={showcaseFlows} />
          </div>
        </aside>

        <div className="min-w-0">
          <main className="px-[var(--gutter)]">
            <section
              aria-labelledby="intro"
              className="max-w-[44rem] py-16 md:py-24"
            >
              <h2
                id="intro"
                className="text-pretty text-2xl font-semibold md:text-[2.5rem] md:leading-[1.1]"
              >
                People and AI agents, one step at a time.
              </h2>
              <p className="mt-6 max-w-[var(--measure)] text-lg text-fg-muted">
                Four example flows from engineering work. Each one shows who
                does a step, who checks it, and where it goes next.
              </p>
            </section>

            {showcaseFlows.map((flow, i) => (
              <FlowSection key={flow.id} flow={flow} number={i + 1} />
            ))}

            <section
              aria-labelledby="contact"
              className="border-t border-rule py-16 md:py-24"
            >
              <h2 id="contact" className="text-2xl font-semibold">
                Contact
              </h2>
              <p className="mt-4 text-xl md:text-2xl">
                <TextLink href={`mailto:${EMAIL}`} className="break-words">
                  {EMAIL}
                </TextLink>
              </p>
            </section>
          </main>

          <footer className="px-[var(--gutter)] pb-10">
            <Label as="p" className="border-t border-rule pt-6">
              &copy; {new Date().getFullYear()} IssueSolved Inc.
            </Label>
          </footer>
        </div>
      </div>
    </>
  );
}

/** One example flow: its steps as text, and on smaller screens the diagram itself. */
function FlowSection({
  flow,
  number,
}: {
  flow: FlowDefinition;
  number: number;
}) {
  const steps = orderSteps(flow);
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const loops = flow.edges.filter((e) => e.kind === "loop");
  const headingId = `${flow.id}-title`;
  return (
    <section
      data-flow-id={flow.id}
      aria-labelledby={headingId}
      className="border-t border-rule py-14 md:py-20"
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Label as="p">{String(number).padStart(2, "0")}</Label>
        <h2 id={headingId} className="text-2xl font-semibold md:text-3xl">
          {flow.title}
        </h2>
        {flow.example && (
          <span className="border border-accent-fg px-1.5 font-mono text-xs text-accent-fg">
            Example
          </span>
        )}
      </div>

      <div className="mt-8">
        <InlineFlow flow={flow} />
      </div>

      <ol className="mt-8 grid max-w-[44rem] gap-0 lg:mt-0">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-4 last:border-b-0"
          >
            <span className="pt-1 font-mono text-xs text-fg-muted">
              {i + 1}
            </span>
            <span>
              <span
                className={
                  s.kind === "agent"
                    ? "block font-mono text-xs text-accent-fg"
                    : "block font-mono text-xs text-fg-muted"
                }
              >
                {stepLabel(s)}
              </span>
              <span className="block text-lg font-semibold">{s.title}</span>
              {s.detail && (
                <span className="block text-fg-muted">{s.detail}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {loops.map((e) => (
        <p key={e.id} className="mt-4 max-w-[44rem] text-fg-muted">
          {e.label ? `${e.label}: ` : ""}the{" "}
          {stepLabel(byId.get(e.from)!).toLowerCase()} sends it back to the step
          &ldquo;{byId.get(e.to)?.title}&rdquo;.
        </p>
      ))}
    </section>
  );
}
