import { Container, Label, NumberedList, Note, ProcessFlow, Rule, Section, Table, Text, TextLink, Wordmark } from "@/components";

// All copy comes from the Core Identity note, sections 1, 3, 4 and 8.
// "Fixed price for the build" is left out until it is confirmed.

const EMAIL = "contact@issuesolved.ca";

export default function Home() {
  return (
    <>
      <header>
        <Container className="pb-16 pt-16 md:pb-24 md:pt-24">
          <h1>
            <Wordmark className="w-full max-w-[34rem]" />
          </h1>
          <p className="mt-10 max-w-[var(--measure)] text-pretty text-xl md:text-2xl">
            IssueSolved builds and runs the AI workflows, automations, and cloud backends that fit how your business
            already works.
          </p>
        </Container>
      </header>

      <main>
        <Section id="how-it-works" number="01" title="How it works">
          <Text>
            You deal with one company and one contact. You already have the knowledge, the skills, and the tools. We
            turn the way your team works into a workflow that runs from start to finish, and we keep it running. The
            complexity stays with us.
          </Text>
          <ProcessFlow
            className="pt-2"
            caption="Client, then IssueSolved, then the work behind it"
            steps={[
              { title: "Client", detail: "Your team, your knowledge, your tools." },
              { title: "IssueSolved", detail: "One contact. We build it and keep it working.", weight: "strong" },
              {
                title: "The work behind it",
                detail: "Workflows, automations, and cloud backends.",
                weight: "quiet",
              },
            ]}
          />
        </Section>

        <Section id="what-we-do" number="02" title="Cloud and AI platform engineering">
          <Table
            caption="Our three offerings"
            columns={["Offering", "What it means"]}
            rows={[
              [
                "Workflow delivery",
                "We take the way your team already works and build it into a workflow that runs end to end.",
              ],
              ["Tailored automations", "We automate the repeated steps that are specific to your business."],
              ["Cloud platform", "We build and run the backend your apps need."],
            ]}
          />
          <Note title="Across all three">
            We keep what we build working. We maintain it and fix it when something breaks.
          </Note>
        </Section>

        <Section id="how-we-work" number="03" title="How we work">
          <NumberedList
            items={[
              {
                title: "Every delivery comes with a process flow diagram.",
                text: "You see how your workflow runs, step by step.",
              },
              { title: "We keep it working.", text: "Maintenance and debugging are part of what we deliver." },
              { title: "One point of contact.", text: "You talk to IssueSolved, not to a chain of people or tools." },
              { title: "Your work stays yours.", text: "Each client's work is kept separate and never shared." },
            ]}
          />
        </Section>

        <Section id="contact" number="04" title="Contact">
          <Text>Write to us by email.</Text>
          <p className="text-xl md:text-2xl">
            <TextLink href={`mailto:${EMAIL}`} className="break-words">
              {EMAIL}
            </TextLink>
          </p>
        </Section>
      </main>

      <footer>
        <Container className="pb-12">
          <Rule />
          <Label as="p" className="pt-6">
            &copy; {new Date().getFullYear()} IssueSolved Inc.
          </Label>
        </Container>
      </footer>
    </>
  );
}
