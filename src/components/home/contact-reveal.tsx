"use client";

import { useState } from "react";
import { Button } from "@/components/button";

/*
  The one call to action. The address is not on the page until someone asks for it: the button puts it together,
  opens their mail app, and shows it as a link for anyone without one.
*/
const parts = ["contact", "issuesolved.ca"];

export function ContactReveal() {
  const [address, setAddress] = useState<string | null>(null);
  if (address)
    return (
      <a
        href={`mailto:${address}`}
        className="font-mono text-sm text-fg underline underline-offset-4"
      >
        {address}
      </a>
    );
  return (
    <Button
      onClick={() => {
        const a = parts.join("@");
        setAddress(a);
        window.location.href = `mailto:${a}`;
      }}
    >
      Contact us
    </Button>
  );
}
