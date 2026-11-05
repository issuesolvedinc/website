"use client";

import { Fragment, useEffect, useState } from "react";
import { HEADLINE, HEADLINE_BOLD, HEADLINE_LINES } from "@/content/headline";

/*
  The headline on two lines. The first is typed in once when the page opens, with a caret on the newest letter.
  When it is done, the second line ripples in: each letter rises out of a soft blur, one after another, and the caret
  moves to its end and keeps blinking. Every letter is in the HTML from the start (hidden until shown), so search
  engines and screen readers get the whole line. A counter drives the typing (per-letter CSS delays proved unreliable
  in Chrome), and the ripple is a transition on a class, not an animation. With reduced motion, or without
  JavaScript, both lines are simply there.
*/
const START = 250;
const STEP = 26;
const RIPPLE = 22; // ms between letters of the second line
const [TYPED, REVEALED] = HEADLINE_LINES;

export function TypedHeadline({ className }: { className?: string }) {
  const [n, setN] = useState(0);
  const [shown, setShown] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(TYPED.length);
      setShown(true);
      setSettled(true);
      return;
    }
    let timer: ReturnType<typeof setInterval>;
    let after: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setN((v) => {
          if (v + 1 >= TYPED.length) {
            clearInterval(timer);
            after = setTimeout(() => setShown(true), 180);
          }
          return Math.min(v + 1, TYPED.length);
        });
      }, STEP);
    }, START);
    return () => {
      clearTimeout(start);
      clearTimeout(after);
      clearInterval(timer);
    };
  }, []);

  // The caret moves to the end of the second line once its last letter has risen.
  useEffect(() => {
    if (!shown || settled) return;
    const t = setTimeout(() => setSettled(true), REVEALED.length * RIPPLE + 450);
    return () => clearTimeout(t);
  }, [shown, settled]);

  const line = (text: string, typed: boolean) => {
    let k = 0;
    const last = text.length - 1;
    const letters = (part: string) =>
      [...part].map((ch) => {
        const i = k++;
        let cls: string | undefined;
        if (typed) {
          cls = i >= n ? "typed-wait" : i === n - 1 && !settled ? "typed-caret" : undefined;
        } else {
          cls = i === last && settled ? "rp typed-caret typed-end" : "rp";
        }
        return (
          <span key={i} className={cls} style={typed ? undefined : ({ "--i": i } as React.CSSProperties)}>
            {ch}
          </span>
        );
      });
    const words = text.split(" ");
    return words.map((word, w) => {
      const bare = word.replace(/[.,]$/, "");
      const tail = word.slice(bare.length);
      return (
        <Fragment key={w}>
          {HEADLINE_BOLD.includes(bare) ? (
            <strong className={`font-semibold hl-${bare.toLowerCase()}`}>{letters(bare)}</strong>
          ) : (
            letters(bare)
          )}
          {tail && letters(tail)}
          {w < words.length - 1 && letters(" ")}
        </Fragment>
      );
    });
  };

  return (
    <h1 className={className} aria-label={HEADLINE}>
      <noscript>
        <style>{".typed-wait{visibility:visible}.ripple .rp{opacity:1;transform:none;filter:none}"}</style>
      </noscript>
      <span aria-hidden="true" className="hl-line">
        {line(TYPED, true)}
      </span>
      <span aria-hidden="true" className={shown ? "hl-line ripple ripple-on" : "hl-line ripple"}>
        {line(REVEALED, false)}
      </span>
    </h1>
  );
}
