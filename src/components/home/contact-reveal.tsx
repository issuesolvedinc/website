"use client";

import { useState } from "react";
import { Button } from "@/components/button";

/*
  The one call to action. The address is not on the page until someone asks for it: the button puts it together,
  opens their mail app, and shows it as a link for anyone without one. On hover or focus a check slides in.
*/
const parts = ["contact", "issuesolved.ca"];

export function ContactReveal() {
  const [address, setAddress] = useState<string | null>(null);
  if (address)
    return (
      <a
        href={`mailto:${address}`}
        className="text-sm text-fg underline underline-offset-4"
      >
        {address}
      </a>
    );
  return (
    <Button
      className="group"
      onClick={() => {
        const a = parts.join("@");
        setAddress(a);
        window.location.href = `mailto:${a}`;
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-0 text-accent opacity-0 transition-all duration-[var(--duration)] group-hover:mr-2 group-hover:w-4 group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:w-4 group-focus-visible:opacity-100"
      >
        <path d="M3 8.5 6.5 12 13 4.5" />
      </svg>
      Contact
    </Button>
  );
}
