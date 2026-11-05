"use client";

import { useEffect, useState } from "react";
import { HEADLINE, HEADLINE_BOLD } from "@/content/headline";

/*
  The headline, typed in once when the page opens, with a caret on the newest letter that keeps blinking at the end.
  Every letter is in the HTML from the start (hidden until typed), so search engines and screen readers get the whole
  line. One counter drives it: per-letter CSS delays proved unreliable in Chrome, which stopped applying them partway.
  With reduced motion, or without JavaScript, the line is simply there.
*/
const START = 250;
const STEP = 26;

export function TypedHeadline({ className }: { className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(HEADLINE.length);
      return;
    }
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setN((v) => {
          if (v + 1 >= HEADLINE.length) clearInterval(timer);
          return Math.min(v + 1, HEADLINE.length);
        });
      }, STEP);
    }, START);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, []);

  let k = 0;
  const words = HEADLINE.split(" ");
  const letters = (text: string) =>
    [...text].map((ch) => {
      const i = k++;
      const cls = i >= n ? "typed-wait" : i === n - 1 ? (n === HEADLINE.length ? "typed-caret typed-end" : "typed-caret") : undefined;
      return (
        <span key={i} className={cls}>
          {ch}
        </span>
      );
    });

  return (
    <h1 className={className} aria-label={HEADLINE}>
      <noscript>
        <style>{".typed-wait{visibility:visible}"}</style>
      </noscript>
      <span aria-hidden="true">
        {words.map((word, w) => {
          const bare = word.replace(/[.,]$/, "");
          const tail = word.slice(bare.length);
          return (
            <span key={w}>
              {HEADLINE_BOLD.includes(bare) ? <strong className="font-semibold">{letters(bare)}</strong> : letters(bare)}
              {tail && letters(tail)}
              {w < words.length - 1 && letters(" ")}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
