# Type

## Faces

| Face | Where | Weights | License |
|---|---|---|---|
| DM Sans | Everything on screen: the wordmark, the headline, body, buttons, the flows' lane labels | Light 300, regular 400, semibold 600, italic 600 for Solved. Optical sizes on. | SIL Open Font License 1.1 |
| DM Mono | Small titles inside flow cards and office flows | 400, 500 | SIL Open Font License 1.1 |
| Source Serif 4 | Loaded, used only by the older `Heading` component and the `/design-system` page. Not on the home page. | 400, 600 | SIL Open Font License 1.1 |

All load through `next/font/google` and are self hosted in the build. Fallbacks: `ui-sans-serif, system-ui`, then `ui-monospace`.

**(proposed)** Retire Source Serif 4 and the typewriter `Label` once the remaining components move to DM Sans, so the site has one family plus its mono.

## Scale

A 1.25 ratio from an 18 px body. Tailwind classes:

| Class | Size | Line height |
|---|---|---|
| `text-3xl` | 3rem, 48 px | 1.1 |
| `text-2xl` | 2.25rem, 36 px | 1.2 |
| `text-xl` | 1.75rem, 28 px | 1.3 |
| `text-lg` | 1.375rem, 22 px | 1.45 |
| `text-base` | 1.125rem, 18 px | 1.6 |
| `text-sm` | 0.9375rem, 15 px | 1.5 |
| `text-xs` | 0.8125rem, 13 px | 1.4 |

Reading text never runs past `--measure` (38rem).

## The headline style

The live headline, on two lines:

> Transform your Business with AI,
> Reclaim your Time.

- The line is DM Sans light 300, tracking -0.02em, `text-lg`, `text-xl` from md up.
- The key words are semibold 600: **Transform** in orange, **Business** in navy, **Reclaim** in emerald, **AI** and **Time** in the text colour.
- The first line types in letter by letter with an orange caret. The second ripples in, left to right. Under reduced motion both show at once.

Use the same pattern (light line, a few semibold words in the brand colours) for any short statement in the brand voice. Never more than three coloured words per line.

## Rules

- Sentence case for headings, buttons and labels. No ALL CAPS styling, no `text-transform: uppercase` in new work **(proposed)**. The old typewriter `Label` still uses uppercase.
- Tabular figures for any number in a table or a flow count.
- Brand words keep their capitals: IssueSolved, one word, capital I and S.
