# Voice

Trust over excitement. Simplicity over cleverness. Stability over trend. Say it once.

These rules apply to every word: page copy, flows, documents, code comments, commit messages.

## Rules

- No em dashes. Use a period, a comma or a colon.
- No exclamation marks.
- None of the banned words below.
- Speak as IssueSolved, never as a chatbot. No "I", no "As an AI".
- Say it once. Cut any line that could go with nothing lost.
- Plain words a person would say aloud to the person next to them.
- Do not claim results, clients or numbers that are not real yet. No client names, no testimonials, no stats, no "trusted by".
- The name is IssueSolved, one word. No tagline after it.
- Name things by what a person does or gets, not by how the system works.

## Banned words

leverage, seamless, cutting edge, unlock, empower, revolutionize, revolutionise, robust, synergy, state of the art, game changing.

In the website repo the list in `scripts/check-voice.mjs` is the source of truth, and the check runs before every commit:

```bash
npm run check:voice
```

It scans the code and `DESIGN.md`, not this guide, which is why the list can be written here. Any repo that holds brand text should run the same check.

## Plain way to say it

| Instead of | Say |
|---|---|
| Seamless end to end automation | A workflow that runs from start to finish, and that we keep running |
| We leverage cutting edge AI | We build AI into the work your team already does |
| Trusted by leading firms | (say nothing until it is true) |

## Words in use

- Headline: "Transform your Business with AI, / Reclaim your Time."
- Services row, one node per word: Process flow / Implementation, Cloud and On premise / Deployment, AI / Transformation.
- Get started row: Define your priorities, Assess your environment, Transform.
- People at the end of a flow: the Team.
- Contact: a form, with the email link.

## Where care goes

Spend warmth where something went wrong, was lost, or is being waited on. Everywhere else, care means getting out of the way.
