# IssueSolved brand guide

The one place to design from. Written for people and for agents: every rule is stated plainly, every value is exact, and anything not yet approved by the founder is tagged **(proposed)**.

Last updated 2026-11-05. It lives in the website repo for now. It moves to the unified codebase once the founder decides where that is.

## Read in this order

| File | What it holds |
|---|---|
| [logo.md](logo.md) | The mark, the wordmark, the lockup, clear space, minimum size, colour versions, what not to do |
| [colour.md](colour.md) | The brand colours, the site tokens, contrast ratios |
| [type.md](type.md) | Faces, weights, the type scale, the headline style |
| [tokens.md](tokens.md) | Spacing, layout, corners, glass, focus, where the code lives |
| [flow-and-motion.md](flow-and-motion.md) | The flow grammar in short, the motion rules |
| [voice.md](voice.md) | How IssueSolved writes, the banned words, what never to claim |
| [print.md](print.md) | The business card and how to print it |

Files: everything is in [assets/](assets/).

## Ten rules to start from

1. Process flow is the spine. Draw services, projects and status as flows.
2. The mark is navy, a white cut, emerald and an orange dot. Use the files, never redraw it.
3. Light and dark are both designed. Use the dark versions on dark grounds.
4. One type family on screen: DM Sans. DM Mono for small labels inside flows.
5. Orange is the accent for shapes. It is never small text on a light ground.
6. Blue means work moving, green means connected and done, red means errors only.
7. Every flow works still. Reduced motion is always respected.
8. Plain words. No em dashes, none of the banned words, say it once.
9. Claim only what is true today: no invented clients, numbers or quotes.
10. The name appears once per surface. The mark can carry the brand elsewhere.

## Sources

- Tokens in code: `src/styles/tokens.css`, mapped in `src/app/globals.css`.
- The mark in code: `src/components/mark.tsx`, the favicon `src/app/icon.svg`.
- The wordmark in code: `src/components/wordmark.tsx` and the `.wordmark` rules in `src/app/globals.css`.
- The flow engine and its full grammar: the `dynamic-process-flow` skill.
- The voice check: `npm run check:voice` (`scripts/check-voice.mjs`).
- Identity and voice decisions: the Core Identity note in the vault. When this guide and that note disagree, the note wins, and this guide is updated.
