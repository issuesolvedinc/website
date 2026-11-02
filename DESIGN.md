# IssueSolved design system

The rules, tokens, and components for the IssueSolved website. The live specimen is at `/design-system`. The source of truth for identity and voice is the Core Identity note in the vault (`03 Brand/Core Identity (draft).md`). When this file and the note disagree, the note wins.

## Principles

- Trust over excitement. Simplicity over cleverness. Stability over trend.
- An old typewriter feel, carried through a clean modern execution. A page should read like a well typed document.
- Black and white. A few warm grays. No gradients, no neon, no shadows, no rounded corners, no stock photos.
- No decorative motion. Color and underline changes on links and buttons are the only motion.
- Claim only what is true today.

## Voice

These rules apply to every word: page copy, code comments, commit messages, and docs.

- No em dashes. Use a period, a comma, or a colon.
- No AI marketing words. The banned list is in `scripts/check-voice.mjs` and in section 6 of the identity note. It is kept out of this file so this file passes its own check.
- Speak as IssueSolved, never as a chatbot.
- Say it once.
- Do not claim results, clients, or numbers that are not real yet. No client names, no testimonials, no stats.

Examples of the plain way to say it:

- A workflow that runs from start to finish, and that we keep running.
- We build AI into the work your team already does.
- Where a claim is not true yet, say nothing.

Check before every commit:

```bash
npm run check:voice
```

## Tokens

All tokens live in `src/styles/tokens.css`. Tailwind maps them in `src/app/globals.css`. Components use the semantic tokens, never the palette.

### Color

Themes follow the system setting. `data-theme="light"` or `data-theme="dark"` on any element forces a theme for that element and its children.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f5f0` paper | `#141414` night | Page background |
| `--fg` | `#141414` ink | `#f2efe8` chalk | Text, ink, strong rules |
| `--fg-muted` | `#5c5852` | `#a8a39a` | Secondary text and labels |
| `--rule` | `#b3ada2` | `#4a4843` | Thin rules and quiet borders. Never text. |
| `--fill` | `#ece8e0` | `#242422` | Note boxes and hover fills |
| `--error` | `#8c2f1f` | `#e08a78` | Error states only. Nothing else is ever red. |

Text contrast, WCAG 2 ratio. Every text pair is at least 4.5:1.

| Pair | Light | Dark |
|---|---|---|
| `--fg` on `--bg` | 16.91:1 | 16.04:1 |
| `--fg-muted` on `--bg` | 6.48:1 | 7.34:1 |
| `--fg-muted` on `--fill` | 5.78:1 | 6.20:1 |
| `--error` on `--bg` | 7.58:1 | 7.08:1 |
| `--error` on `--fill` | 6.76:1 | 5.98:1 |

### Type

- Serif, Source Serif 4, for headings and reading text. Regular 400 and semibold 600, optical sizes on. Tailwind `font-serif`, the body default.
- Typewriter, Courier Prime, for labels and small details. Regular 400, uppercase at `text-xs` with `0.08em` tracking. Tailwind `font-mono`.
- Both load through `next/font/google` and are self hosted in the build. Fallbacks: Georgia, then Courier New.

| Step | Size | Line height |
|---|---|---|
| `text-3xl` | 3rem, 48px | 1.1 |
| `text-2xl` | 2.25rem, 36px | 1.2 |
| `text-xl` | 1.75rem, 28px | 1.3 |
| `text-lg` | 1.375rem, 22px | 1.45 |
| `text-base` | 1.125rem, 18px | 1.6 |
| `text-sm` | 0.9375rem, 15px | 1.5 |
| `text-xs` | 0.8125rem, 13px | 1.4 |

### Spacing

A 4px base. `--space-1` 0.25rem, `--space-2` 0.5rem, `--space-3` 0.75rem, `--space-4` 1rem, `--space-6` 1.5rem, `--space-8` 2rem, `--space-12` 3rem, `--space-16` 4rem, `--space-24` 6rem. These match Tailwind's spacing scale, so `p-4` is `--space-4`.

### Layout and grid

| Token | Value | Use |
|---|---|---|
| `--page-max` | 68rem | Outer width of the page |
| `--measure` | 38rem | Longest line of reading text |
| `--label-col` | 11rem | Left column for section numbers, from 48rem up |
| `--gutter` | 1rem, 3rem from 48rem | Page side margin |
| `--rule-width` | 1px | Thin rules |
| `--rule-width-strong` | 2px | Strong rules and table heads |

Wide margins and two columns, like a typed document. The section number sits in the left column and the content in the right. On phones they stack. Reading text never runs past `--measure`.

### Rules

Thin rules (`--rule`, 1px) separate sections. A strong rule (`--fg`, 2px) is for table heads and rare emphasis.

### Motion

`--duration` is 150ms, used only for color and underline changes. It drops to 0ms under `prefers-reduced-motion: reduce`. Animated process flows are planned for later and must respect the same setting.

## Components

All in `src/components/`, exported from `src/components/index.ts`.

| Component | What it is |
|---|---|
| `Wordmark` | The IssueSolved wordmark as inline SVG. Takes the current text color. Pass `decorative` when visible text already names IssueSolved. |
| `Container` | Page width and side margins. |
| `Label` | Typewriter label. Tones: default, muted, error. Sizes: xs, sm. |
| `Heading` | Serif heading, levels 1 to 3, with an optional visual size. One h1 per page. |
| `Text` | Reading text held to the measure. Variants: lead, body, small. Optional muted. |
| `TextLink` | Inline link, always underlined. The underline thickens on hover. |
| `Button` | Square corners, typewriter text. Primary (ink fill) and secondary (outline). An anchor when given `href`. |
| `Rule` | Horizontal rule, thin or strong. |
| `Section` | A numbered page section: a rule, the number, the title, the content. |
| `Table` | Typewriter headers, thin rules between rows, the first column as the row header. |
| `Note` | A boxed note on the fill color. The error tone is the only place red appears. |
| `NumberedList` | A numbered list of short statements, a bold line and one sentence each. |
| `ProcessFlow` | A static flow of boxes and arrows. Weights: normal, strong, quiet. Stacks on narrow screens, runs left to right from 64rem. |

## Wordmark and favicon

- The wordmark is "IssueSolved" set in Courier Prime Bold and converted to outlines, so it never depends on a font loading. Courier Prime is under the SIL Open Font License 1.1, which allows this.
- Files: `public/brand/wordmark-black.svg`, `public/brand/wordmark-white.svg`, and the path data in `src/components/wordmark-path.ts`.
- The favicon, `src/app/icon.svg`, is "IS" in paper on an ink square.
- Black and white only. Keep clear space of at least the height of the capital I on every side. Do not recolor, stretch, outline, or add effects.
- The old blue, orange, and navy logo is retired. Do not use it.
- To change the wordmark, outline new text from the Courier Prime Bold TTF (for example with opentype.js) and replace all three files together.

## Pages

- `/` is the one page site from section 8 of the identity note.
- `/design-system` is the specimen. It is marked `noindex` and is not linked from the site.
