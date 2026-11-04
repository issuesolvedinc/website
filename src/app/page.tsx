import { Wordmark } from "@/components";
import { ContactReveal } from "@/components/home/contact-reveal";
import { OfficeWorld } from "@/components/home/office-world";
import { HEADLINE } from "@/content/headline";

// A placeholder, one page from top to bottom: the wordmark, one short line, one process flow that plays on its
// own, and one call to action. The headline is the only line that says what IssueSolved does (identity note,
// change of 2026-11-05); no services, offerings or promises. The contact address stays off the page until
// someone presses the call to action.

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[90rem] flex-col px-[var(--gutter)]">
      <header className="pt-6">
        <Wordmark className="w-32" />
      </header>

      <main className="flex flex-1 flex-col justify-center gap-10 py-12 md:gap-12 md:py-16">
        <h1 className="text-base font-semibold md:text-xl">{HEADLINE}</h1>
        <OfficeWorld />
        <div>
          <ContactReveal />
        </div>
      </main>
    </div>
  );
}
