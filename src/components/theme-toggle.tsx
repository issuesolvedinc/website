"use client";

import { useEffect } from "react";

/*
  Light or dark, top right. The first visit follows the system; a press picks the other theme and remembers it.
  The script in the layout applies the saved choice before the page paints. Both icons are drawn and CSS shows the
  one for the theme you would switch to (globals.css), so the server and the browser always render the same.
*/
const KEY = "theme";

function current(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  // The layout script applies the saved theme before paint; this applies it again in case React redrew the page.
  useEffect(() => {
    try {
      const t = localStorage.getItem(KEY);
      if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    } catch {}
  }, []);
  return (
    <button
      type="button"
      aria-label="Change theme"
      className="theme-toggle inline-flex size-11 items-center justify-center text-fg transition-opacity duration-[var(--duration)] hover:opacity-70"
      onClick={() => {
        const next = current() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {}
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        className="theme-sun size-5"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        className="theme-moon size-5"
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}

/** Runs before paint: applies a saved theme. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
