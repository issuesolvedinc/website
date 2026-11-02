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
];

const contrast: React.ReactNode[][] = [
  [<span key="p"><Code>--fg</Code> on <Code>--bg</Code></span>, "16.91:1", "16.04:1"],
  [<span key="p"><Code>--fg-muted</Code> on <Code>--bg</Code></span>, "6.48:1", "7.34:1"],
  [<span key="p"><Code>--fg-muted</Code> on <Code>--fill</Code></span>, "5.78:1", "6.20:1"],
  [<span key="p"><Code>--error</Code> on <Code>--bg</Code></span>, "7.58:1", "7.08:1"],
  [<span key="p"><Code>--error</Code> on <Code>--fill</Code></span>, "6.76:1", "5.98:1"],
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
            <Wordmark className="w-40" decorative />
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
            Set in Courier Prime Bold and outlined, so it never depends on a font loading. Black and white only. It
            takes the current text color.
          </Text>
          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((t) => (
              <Panel key={t} theme={t}>
                <Wordmark className="w-full max-w-72" />
              </Panel>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-8">
            <Wordmark className="w-24" decorative />
            <Wordmark className="w-40" decorative />
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
            Ink, paper, and three grays. The red is for error states and nothing else. Components use the semantic
            tokens below, which flip between light and dark.
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
              columns={["Offering", "What it means"]}
              rows={[
                ["Workflow delivery", "We take the way your team already works and build it into a workflow."],
                ["Cloud platform", "We build and run the backend your apps need."],
              ]}
            />
          </Demo>

          <Demo name="Note">
            <Note title="Note">We maintain what we build and fix it when something breaks.</Note>
            <Note title="Error" tone="error">
              Something went wrong. The red is reserved for messages like this one.
            </Note>
          </Demo>

          <Demo name="Numbered list">
            <NumberedList
              items={[
                { title: "One point of contact.", text: "You talk to IssueSolved, not to a chain of people or tools." },
                { title: "Your work stays yours.", text: "Each client's work is kept separate and never shared." },
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
            No decorative motion. Links and buttons change color or underline over <Code>--duration</Code>, 150ms, and that drops
            to 0ms when the system asks for reduced motion. Animated process flows are planned for later and will
            follow the same rule.
          </Text>
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
