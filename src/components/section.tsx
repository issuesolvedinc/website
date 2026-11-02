import { Container } from "./container";
import { Heading } from "./heading";
import { Label } from "./label";
import { Rule } from "./rule";

type SectionProps = {
  id: string;
  /** Shown in the typewriter face, like a clause number in a typed document. */
  number: string;
  title: string;
  children: React.ReactNode;
};

/** A numbered page section: a rule, the number in the left column, the title and content on the right. */
export function Section({ id, number, title, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-8">
      <Container>
        <Rule />
        <div className="grid gap-3 py-12 md:grid-cols-[var(--label-col)_minmax(0,1fr)] md:gap-8 md:py-16">
          <Label as="p" size="sm" className="pt-1 md:pt-2">
            {number}
          </Label>
          <div>
            <Heading level={2} id={headingId}>
              {title}
            </Heading>
            <div className="mt-6 space-y-6">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
