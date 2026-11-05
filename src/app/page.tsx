import { Wordmark } from "@/components";
import { ContactReveal } from "@/components/home/contact-reveal";
import { MainFlow } from "@/components/home/main-flow";
import { ServiceRows } from "@/components/home/service-rows";
import { TypedHeadline } from "@/components/home/typed-headline";
import { ThemeToggle } from "@/components/theme-toggle";
import { Year } from "@/components/year";

// A placeholder, one page from top to bottom: the wordmark, one short line, the main map (the same work now and
// with IssueSolved, playing on its own), the services and how to get started as small flows, one call to action in the middle, and the copyright line. Each part is its own band: the services sit on the fill colour between hairlines, so the page changes block as it scrolls. The headline is
// the only line that says what IssueSolved does (identity note, change of 2026-11-05); no services, offerings or
// promises. The contact address stays off the page until someone presses the call to action.

// One container width for every band; the bands themselves run edge to edge.
const wrap = "mx-auto w-full max-w-[90rem] px-[var(--gutter)]";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className={wrap}>
        <header className="flex items-center justify-between pt-6">
          <Wordmark className="text-base" />
          <ThemeToggle />
        </header>
      </div>

      <main className="flex flex-1 flex-col">
        <section className={`${wrap} flex flex-col gap-10 py-12 md:gap-12 md:py-16`}>
          <TypedHeadline className="text-lg font-light tracking-[-0.02em] md:text-xl" />
          <MainFlow />
        </section>

        <div className="border-y border-rule bg-fill">
          <div className={`${wrap} py-14 md:py-20`}>
            <ServiceRows />
          </div>
        </div>

        <div className={`${wrap} flex justify-center py-14 md:py-20`}>
          <ContactReveal />
        </div>
      </main>

      <div className={wrap}>
        <footer className="border-t border-rule py-6 text-sm text-fg-muted">
          © <Year built={new Date().getFullYear()} /> IssueSolved
        </footer>
      </div>
    </div>
  );
}
