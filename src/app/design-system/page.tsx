import type { Metadata } from "next";
import {
  Button,
  Container,
  Heading,
  Label,
  Note,
  NumberedList,
  ProcessFlow,
  Rule,
  Section,
  Table,
  Text,
  TextLink,
  Wordmark,
} from "@/components";
import { AgentFlow } from "@/components/agent-flow/agent-flow";
import { FlowThemeLab } from "@/components/flow-theme/flow-theme-lab";
import { BackgroundBeams } from "@/components/effects/background-beams";
import { BackgroundBeamsWithCollision } from "@/components/effects/background-beams-with-collision";
import { BackgroundLines } from "@/components/effects/background-lines";
import { drawingReviewFlow, rfiFlow } from "@/content/example-flows";
import { FLOW_THEMES } from "@/lib/flow/theme";

export const metadata: Metadata = {
  title: "Design system | IssueSolved",
  description: "Tokens and components for the IssueSolved website.",
  robots: { index: false, follow: false },
};

const themes = ["light", "dark"] as const;

/** Token and class names, set in the typewriter face so a double hyphen never reads as a dash. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="whitespace-nowrap font-mono text-[0.9em] font-normal">{children}</code>;
}

const colors = [
  { token: "--bg", use: "Page background", light: "#f7f5f0", dark: "#141414" },
  { token: "--fg", use: "Text, ink, strong rules", light: "#141414", dark: "#f2efe8" },
  { token: "--fg-muted", use: "Secondary text and labels", light: "#5c5852", dark: "#a8a39a" },
  { token: "--rule", use: "Thin rules and quiet borders, never text", light: "#b3ada2", dark: "#4a4843" },
  { token: "--fill", use: "Note boxes and hover fills", light: "#ece8e0", dark: "#242422" },
  { token: "--error", use: "Error states only", light: "#8c2f1f", dark: "#e08a78" },
  { token: "--accent", use: "Shapes and moving lights. Never text on a light ground", light: "#ff9a00", dark: "#ff9a00" },
  { token: "--accent-fg", use: "The accent when it is text", light: "#9a5300", dark: "#ff9a00" },
  { token: "--glass", use: "Frosted surfaces over an effect, with a 10px blur", light: "paper at 72%", dark: "night at 68%" },
  { token: "--glass-edge", use: "The edge of a frosted surface", light: "ink at 14%", dark: "chalk at 16%" },
];

const contrast: React.ReactNode[][] = [
  [<span key="p"><Code>--fg</Code> on <Code>--bg</Code></span>, "16.91:1", "16.04:1"],
  [<span key="p"><Code>--fg-muted</Code> on <Code>--bg</Code></span>, "6.48:1", "7.34:1"],
  [<span key="p"><Code>--fg-muted</Code> on <Code>--fill</Code></span>, "5.78:1", "6.20:1"],
  [<span key="p"><Code>--error</Code> on <Code>--bg</Code></span>, "7.58:1", "7.08:1"],
  [<span key="p"><Code>--error</Code> on <Code>--fill</Code></span>, "6.76:1", "5.98:1"],
  [<span key="p"><Code>--accent-fg</Code> on <Code>--bg</Code></span>, "5.34:1", "8.66:1"],
  [<span key="p"><Code>--accent-fg</Code> on <Code>--fill</Code></span>, "4.76:1", "7.31:1"],
];

const flowKinds: React.ReactNode[][] = [
  [<Code key="k">input</Code>, "What starts the flow: an email, a file, a request. Ink edge."],
  [<Code key="k">agent</Code>, "An AI step that reads, sorts or drafts. Accent edge, the only orange step."],
  [<Code key="k">person</Code>, "A team member doing the work. Ink edge on the fill color. Its role, such as Engineer, names it."],
  [<Code key="k">tool</Code>, "A system the agent looks things up in. Dashed edge."],
  [<Code key="k">approval</Code>, "A person who checks before the flow goes on. Heavy left edge."],
  [<Code key="k">output</Code>, "What the flow hands back. Filled with ink."],
];

const typeScale = [
  { name: "text-3xl", size: "3rem / 48px", className: "text-3xl" },
  { name: "text-2xl", size: "2.25rem / 36px", className: "text-2xl" },
  { name: "text-xl", size: "1.75rem / 28px", className: "text-xl" },
  { name: "text-lg", size: "1.375rem / 22px", className: "text-lg" },
  { name: "text-base", size: "1.125rem / 18px", className: "text-base" },
  { name: "text-sm", size: "0.9375rem / 15px", className: "text-sm" },
  { name: "text-xs", size: "0.8125rem / 13px", className: "text-xs" },
];

const spacing = [
  ["--space-1", "0.25rem"],
  ["--space-2", "0.5rem"],
  ["--space-3", "0.75rem"],
  ["--space-4", "1rem"],
  ["--space-6", "1.5rem"],
  ["--space-8", "2rem"],
  ["--space-12", "3rem"],
  ["--space-16", "4rem"],
  ["--space-24", "6rem"],
];

function Panel({ theme, children }: { theme: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div data-theme={theme} className="border border-rule bg-bg p-5 text-fg">
      <Label as="p" className="mb-4">
        {theme}
      </Label>
      {children}
    </div>
  );
}

function Demo({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-rule pt-6">
      <Label as="p" tone="default">
        {name}
      </Label>
      {children}
    </div>
  );
}

export default function DesignSystem() {
  return (
    <>
      <header>
        <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
          <TextLink href="/" className="inline-block">
            <Wordmark className="text-xl" decorative />
            <span className="sr-only">IssueSolved home</span>
          </TextLink>
          <Heading level={1} className="mt-10">
            Design system
          </Heading>
          <Text className="mt-4" muted>
            Every token and component used on the IssueSolved website. The rules behind them are in DESIGN.md at the
            root of the repository.
          </Text>
        </Container>
      </header>

      <main>
        <Section id="wordmark" number="00" title="Wordmark">
          <Text>
            Set in DM Sans SemiBold, the site's sans. Black and white only. It takes the current text color.
          </Text>
          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((t) => (
              <Panel key={t} theme={t}>
                <Wordmark className="text-3xl" />
              </Panel>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-8">
            <Wordmark className="text-base" decorative />
            <Wordmark className="text-xl" decorative />
            <div className="flex items-end gap-3">
              <img src="/icon.svg" alt="Favicon" width={32} height={32} />
              <Label>Favicon</Label>
            </div>
          </div>
          <Text variant="small" muted>
            Files: <TextLink href="/brand/wordmark-black.svg">wordmark-black.svg</TextLink>,{" "}
            <TextLink href="/brand/wordmark-white.svg">wordmark-white.svg</TextLink>,{" "}
            <TextLink href="/icon.svg">icon.svg</TextLink>. Keep clear space of at least the height of the capital I on
            every side. Do not recolor, stretch, outline, or add effects.
          </Text>
        </Section>

        <Section id="color" number="01" title="Color">
          <Text>
            Ink, paper, and three grays, plus the orange accent for shapes and moving light. The red is for error
            states and nothing else. Components use the semantic tokens below, which flip between light and dark.
          </Text>
          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((t) => (
              <Panel key={t} theme={t}>
                <ul className="space-y-3">
                  {colors.map((c) => (
                    <li key={c.token} className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-4">
                      <span
                        className="block h-10 border border-rule"
                        style={{ background: `var(${c.token})` }}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block font-mono text-sm">
                          {c.token} {t === "light" ? c.light : c.dark}
                        </span>
                        <span className="block text-sm text-fg-muted">{c.use}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
          <Table
            caption="Text contrast, WCAG 2 ratio"
            captionVisible
            columns={["Pair", "Light", "Dark"]}
            rows={contrast}
          />
        </Section>

        <Section id="type" number="02" title="Type">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label as="p">Serif: Source Serif 4</Label>
              <p className="mt-2 text-2xl">Headings and reading text</p>
              <p className="mt-1 text-fg-muted">Regular 400, semibold 600. Optical sizes on.</p>
            </div>
            <div>
              <Label as="p">Typewriter: Courier Prime</Label>
              <p className="mt-2 font-mono text-2xl">Labels and details</p>
              <p className="mt-1 text-fg-muted">Regular 400. Uppercase at text-xs with 0.08em tracking.</p>
            </div>
          </div>
          <ul className="divide-y divide-rule border-y border-rule">
            {typeScale.map((s) => (
              <li key={s.name} className="grid gap-1 py-4 md:grid-cols-[10rem_minmax(0,1fr)] md:items-baseline md:gap-6">
                <Label>
                  {s.name}, {s.size}
                </Label>
                <span className={`${s.className} truncate`}>Workflows that run</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="spacing" number="03" title="Spacing">
          <Text>A 4px base. The tokens match Tailwind&apos;s spacing scale, so <Code>p-4</Code> is <Code>--space-4</Code>.</Text>
          <ul className="space-y-3">
            {spacing.map(([token, value]) => (
              <li key={token} className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-4">
                <Label>
                  {token} {value}
                </Label>
                <span className="block h-4 bg-fg" style={{ width: `var(${token})` }} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="layout" number="04" title="Layout and grid">
          <Text>
            Wide margins and two columns, like a typed document. On wide screens the section number sits in a left
            column and the content in the right. On phones they stack.
          </Text>
          <Table
            columns={["Token", "Value", "Use"]}
            rows={[
              [<Code key="t">--page-max</Code>, "68rem", "Outer width of the page"],
              [<Code key="t">--measure</Code>, "38rem", "Longest line of reading text"],
              [<Code key="t">--label-col</Code>, "11rem", "Section number column, 48rem and up"],
              [<Code key="t">--gutter</Code>, "1rem, 3rem from 48rem", "Page side margin"],
              [<Code key="t">--rule-width</Code>, "1px", "Thin rules"],
              [<Code key="t">--rule-width-strong</Code>, "2px", "Strong rules and table heads"],
            ]}
          />
          <div className="grid gap-3 border border-dashed border-rule p-3 md:grid-cols-[var(--label-col)_minmax(0,1fr)]">
            <div className="bg-fill p-3">
              <Label>Label column</Label>
            </div>
            <div className="bg-fill p-3">
              <Label>Content column, text held to the measure</Label>
            </div>
          </div>
        </Section>

        <Section id="rules" number="05" title="Rules">
          <Demo name="Rule">
            <Rule />
          </Demo>
          <Demo name="Rule strong">
            <Rule strong />
          </Demo>
        </Section>

        <Section id="components" number="06" title="Components">
          <Demo name="Label">
            <div className="flex flex-wrap gap-6">
              <Label tone="default">Default</Label>
              <Label>Muted</Label>
              <Label tone="error">Error</Label>
            </div>
          </Demo>

          <Demo name="Heading">
            <Heading level={2} size={1}>
              Level 1 size
            </Heading>
            <Heading level={3} size={2}>
              Level 2 size
            </Heading>
            <Heading level={3}>Level 3 size</Heading>
          </Demo>

          <Demo name="Text">
            <Text variant="lead">Lead text. One line that sets up a section.</Text>
            <Text>
              Body text. We take the way your team already works and build it into a workflow that runs end to end.
            </Text>
            <Text variant="small" muted>
              Small muted text, for notes under other content.
            </Text>
          </Demo>

          <Demo name="Link">
            <Text>
              Links are always underlined, like <TextLink href="#components">this one</TextLink>. The underline
              thickens on hover.
            </Text>
          </Demo>

          <Demo name="Button">
            <div className="flex flex-wrap gap-4">
              <Button href="#components">Primary</Button>
              <Button href="#components" variant="secondary">
                Secondary
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Demo>

          <Demo name="Section">
            <Text>
              Every numbered block on this page is a Section: a thin rule, the number in the typewriter face, then the
              title and content.
            </Text>
          </Demo>

          <Demo name="Table">
            <Table
              caption="Example table"
              columns={["Step", "Who does it"]}
              rows={[
                ["Drafts comments", "An agent, against the firm's checklist."],
                ["Checks the comments", "An engineer, who approves or sends them back."],
              ]}
            />
          </Demo>

          <Demo name="Note">
            <Note title="Note">A note sits apart from the text around it, on the fill color.</Note>
            <Note title="Error" tone="error">
              Something went wrong. The red is reserved for messages like this one.
            </Note>
          </Demo>

          <Demo name="Numbered list">
            <NumberedList
              items={[
                { title: "A bold lead.", text: "Then the rest of the item in regular weight." },
                { title: "A second item.", text: "Numbers sit in the typewriter face." },
              ]}
            />
          </Demo>

          <Demo name="Process flow">
            <Text variant="small" muted>
              Three weights: normal, strong for IssueSolved, and quiet for the work behind it. Static for now.
            </Text>
            <ProcessFlow
              caption="Example flow"
              steps={[
                { title: "Client", detail: "Normal weight." },
                { title: "IssueSolved", detail: "Strong weight.", weight: "strong" },
                { title: "The work behind it", detail: "Quiet weight.", weight: "quiet" },
              ]}
            />
          </Demo>
        </Section>

        <Section id="motion" number="07" title="Motion">
          <Text>
            Links and buttons change color or underline over <Code>--duration</Code>, 150ms. The effects and the agent
            flow below move on their own. All of it stops when the system asks for reduced motion: the effects draw a
            still frame and the flow drops its moving lights. Effects also pause while they are off screen.
          </Text>
        </Section>

        <Section id="effects" number="08" title="Effects">
          <Text>
            The background effects from the first landing page, redrawn in the tokens. Each fills a positioned area
            behind its content and is hidden from screen readers. Import each one from its own file in{" "}
            <Code>src/components/effects</Code>.
          </Text>

          <Demo name="BackgroundBeams">
            <div className="grid gap-4 md:grid-cols-2">
              {themes.map((t) => (
                <div key={t} data-theme={t} className="relative h-64 overflow-hidden border border-rule bg-bg text-fg">
                  <BackgroundBeams />
                  <p className="relative p-5 font-mono text-xs text-fg-muted">{t}</p>
                </div>
              ))}
            </div>
            <Table
              caption="Props"
              captionVisible
              columns={["Prop", "Default", "What it does"]}
              rows={[
                [<Code key="p">count</Code>, "20", "Curves that carry a moving light, out of 58. Fewer is lighter on phones."],
                [<Code key="p">speed</Code>, "20", "Seconds for the slowest light to cross."],
                [<Code key="p">className</Code>, "", "Added to the layer. It fills its nearest positioned parent."],
              ]}
            />
          </Demo>

          <Demo name="BackgroundBeamsWithCollision">
            <div className="grid gap-4 md:grid-cols-2">
              {themes.map((t) => (
                <div key={t} data-theme={t} className="border border-rule bg-bg text-fg">
                  <BackgroundBeamsWithCollision className="h-64">
                    <p className="text-lg font-semibold">Lights meet the floor</p>
                  </BackgroundBeamsWithCollision>
                </div>
              ))}
            </div>
            <Table
              caption="Props"
              captionVisible
              columns={["Prop", "Default", "What it does"]}
              rows={[
                [<Code key="p">children</Code>, "", "Centred over the lights."],
                [<Code key="p">beams</Code>, "7 lights", "Each light: x in percent, duration, delay, repeatDelay, length in pixels."],
                [<Code key="p">className</Code>, "", "Sets the height. The first landing page used h-96 md:h-[40rem]."],
              ]}
            />
          </Demo>

          <Demo name="BackgroundLines">
            <div className="grid gap-4 md:grid-cols-2">
              {themes.map((t) => (
                <div key={t} data-theme={t} className="border border-rule bg-bg text-fg">
                  <BackgroundLines className="grid h-64 place-items-center">
                    <p className="text-lg font-semibold">From one point outward</p>
                  </BackgroundLines>
                </div>
              ))}
            </div>
            <Table
              caption="Props"
              captionVisible
              columns={["Prop", "Default", "What it does"]}
              rows={[
                [<Code key="p">children</Code>, "", "Drawn over the lines."],
                [<Code key="p">duration</Code>, "10", "Seconds for one run along a line."],
                [<Code key="p">layers</Code>, "1", "2 adds a thicker second stroke, as on the first landing page."],
                [<Code key="p">className</Code>, "", "Sets the size and layout of the area."],
              ]}
            />
          </Demo>
        </Section>

        <Section id="agent-flow" number="09" title="Agent flow">
          <Text>
            <Code>AgentFlow</Code> draws a flow definition with React Flow. The definition is plain data in{" "}
            <Code>src/lib/flow/definition.ts</Code>, a file with no React in it, so client process flow diagrams can
            use the same shape. Steps are never editable. Wide screens can pan and zoom; narrow boxes and phones get a top to bottom
            layout that fits and lets the page scroll. Every flow also renders its steps as a text list for screen
            readers.
          </Text>

          <Demo name="AgentFlow">
            {themes.map((t) => (
              <div key={t} data-theme={t} className="border border-rule bg-bg p-4 text-fg md:p-6">
                <AgentFlow flow={drawingReviewFlow} />
              </div>
            ))}
            <AgentFlow flow={rfiFlow} direction="vertical" interactive={false} />
            <Table caption="Step kinds" captionVisible columns={["Kind", "Meaning and look"]} rows={flowKinds} />
            <Table
              caption="Props"
              captionVisible
              columns={["Prop", "Default", "What it does"]}
              rows={[
                [<Code key="p">flow</Code>, "", "A FlowDefinition: nodes and edges as data. Edges of kind loop go back to an earlier step."],
                [<Code key="p">direction</Code>, "auto", "horizontal, vertical, or auto: across when every step fits at a readable size, down otherwise."],
                [<Code key="p">interactive</Code>, "true", "Pan, zoom and view buttons on wide screens. Off keeps the flow fixed."],
                [<Code key="p">animated</Code>, "true", "Lights travel along the arrows. Off with reduced motion."],
                [<Code key="p">height</Code>, "fits the flow", "Height of the canvas."],
                [<Code key="p">running</Code>, "false", "Lights one step at a time while on screen. Off with reduced motion."],
                [<Code key="p">caption</Code>, "true", "The title and Example tag above the canvas."],
                [<Code key="p">textList</Code>, "true", "The steps as a list for screen readers. Off only where the page shows them as text."],
              ]}
            />
            <Text variant="small" muted>
              Example flows carry <Code>example: true</Code> and show the Example tag. They describe generic
              engineering firm work, not a client.
            </Text>
          </Demo>
        </Section>

        <Section id="flow-themes" number="10" title="Flow themes">
          <Text>
            A flow theme sets how any flow looks and moves: colour, type, shapes, motion and density. It is plain data in{" "}
            <Code>src/lib/flow/theme.ts</Code>, kept apart from the flow definition, so the same flow draws under any
            theme by changing one value. Reduced motion always wins over the theme. Light and dark follow the page.
          </Text>
          <Table
            caption="Themes"
            captionVisible
            columns={["Theme", "Motion", "Density", "When to use it"]}
            rows={FLOW_THEMES.map((t) => [<Code key="t">{t.id}</Code>, t.motion, t.density, t.description])}
          />
          <Table
            caption="Motion levels"
            captionVisible
            columns={["Level", "What moves"]}
            rows={[
              [<Code key="m">still</Code>, "One frame. Nothing moves."],
              [<Code key="m">subtle</Code>, "The work: items travel, queues fill and drain, counts climb, clocks run."],
              [<Code key="m">animated</Code>, "The work, plus ripples, the sweep, the shake, marching wires and moving figures."],
            ]}
          />
          <Demo name="FlowThemeLab">
            <FlowThemeLab />
          </Demo>
        </Section>
      </main>

      <footer>
        <Container className="pb-12">
          <Rule />
          <p className="pt-6">
            <TextLink href="/" className="font-mono text-xs uppercase tracking-[0.08em]">
              Back to the site
            </TextLink>
          </p>
        </Container>
      </footer>
    </>
  );
}
