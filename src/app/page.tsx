import { Wordmark } from "@/components";
import { ContactReveal } from "@/components/home/contact-reveal";
import { MainFlow } from "@/components/home/main-flow";
import { Year } from "@/components/year";
import { HEADLINE } from "@/content/headline";

// A placeholder, one page from top to bottom: the wordmark, one short line, the main map (the same work now and
// with IssueSolved, playing on its own), one call to action in the middle, and the copyright line. The headline is
// the only line that says what IssueSolved does (identity note, change of 2026-11-05); no services, offerings or
// promises. The contact address stays off the page until someone presses the call to action.

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[90rem] flex-col px-[var(--gutter)]">
      <header className="pt-6">
        <Wordmark className="text-lg" />
      </header>

      <main className="flex flex-1 flex-col justify-center gap-10 py-12 md:gap-12 md:py-16">
        <h1 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">{HEADLINE}</h1>
        <MainFlow />
        <div className="flex justify-center">
          <ContactReveal />
        </div>
      </main>

      <footer className="pb-6 text-sm text-fg-muted">
        © <Year built={new Date().getFullYear()} /> IssueSolved
      </footer>
    </div>
  );
}
