"use client";

import { useState } from "react";
import { Button } from "@/components/button";

/*
  The one call to action. Contact opens a short form; it posts to the Netlify form "waitlist", declared for
  Netlify in public/__forms.html. If sending fails, the address is shown instead, so nobody is left without a way
  to reach us. On hover or focus a check slides into the button.
*/
const FORM = "waitlist";
const parts = ["contact", "issuesolved.ca"];

type State = "closed" | "open" | "sending" | "sent" | "failed";

const field =
  "w-full border border-fg/30 bg-transparent px-3 py-2 text-base text-fg placeholder:text-fg-muted focus-visible:border-fg";

function Check() {
  return (
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
  );
}

export function ContactReveal() {
  const [state, setState] = useState<State>("closed");

  if (state === "closed")
    return (
      <Button className="group" onClick={() => setState("open")}>
        <Check />
        Contact
      </Button>
    );

  if (state === "sent")
    return (
      <p role="status" className="text-center">
        Thank you. We will reply soon.
      </p>
    );

  const address = parts.join("@");

  return (
    <form
      name={FORM}
      method="POST"
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        const body = new URLSearchParams(new FormData(e.currentTarget) as unknown as Record<string, string>);
        try {
          const res = await fetch("/__forms.html", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          });
          setState(res.ok ? "sent" : "failed");
        } catch {
          setState("failed");
        }
      }}
    >
      <input type="hidden" name="form-name" value={FORM} />
      <p hidden>
        <label>
          Leave empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" required autoComplete="email" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea name="message" required rows={4} className={field} />
      </label>
      {state === "failed" && (
        <p role="alert" className="text-sm">
          That did not go through. Write to us at{" "}
          <a href={`mailto:${address}`} className="underline underline-offset-4">
            {address}
          </a>
          .
        </p>
      )}
      <Button type="submit" className="group self-center" disabled={state === "sending"}>
        <Check />
        {state === "sending" ? "Sending" : "Send"}
      </Button>
    </form>
  );
}
