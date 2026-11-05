# IssueSolved design system

**Rule 0 comes first:** every page, component, message and line of copy is simple, predictable, clear, action led, client first, and keeps our machinery hidden. It is above every other rule. Read it in [`docs/brand/README.md`](docs/brand/README.md#rule-0-above-every-other-rule), with examples in [`docs/brand/voice.md`](docs/brand/voice.md#rule-0).

The brand guide is in [`docs/brand/`](docs/brand/README.md): the logo and its rules, colour and contrast, type, tokens, flow and motion, voice, and print. Design from it. This file only covers what is specific to this codebase.

The source of truth for identity and voice is the Core Identity note in the vault (`03 Brand/Core Identity (draft).md`). When the guide and the note disagree, the note wins and the guide is updated.

## Voice check

The voice rules are in [`docs/brand/voice.md`](docs/brand/voice.md). The banned list lives in `scripts/check-voice.mjs`, not here, so this file passes its own check. Run it before every commit:

```bash
npm run check:voice
```

## Where things live

| What | Where |
|---|---|
| Tokens | `src/styles/tokens.css`, mapped to Tailwind in `src/app/globals.css` |
| The mark | `src/components/mark.tsx`, colours in the `.mark` rules of `globals.css` |
| The wordmark | `src/components/wordmark.tsx`, the `.wordmark` rules of `globals.css` |
| The favicon | `src/app/icon.svg` |
| Fonts | `src/app/layout.tsx` (`next/font/google`, self hosted) |
| Brand files | `docs/brand/assets/` |
| The animated flows | `src/components/home/`, grammar in the `dynamic-process-flow` skill |

Components use the semantic tokens (`--bg`, `--fg`, `--accent`, ...), never the palette and never raw hex values. Themes flip through the tokens, so components need no `dark:` classes.

## Components

All in `src/components/`, exported from `src/components/index.ts`. The specimen is at `/design-system`, marked `noindex` and not linked from the site.

| Component | What it is |
|---|---|
| `Mark` | The IssueSolved mark, 1em square, decorative by default. Pass `label` when it stands alone. |
| `Wordmark` | The wordmark as live text: dashed Issue, solid Solved. Pass `decorative` when visible text already names IssueSolved. |
| `Container` | Page width and side margins. |
| `Label` | Typewriter label (DM Mono). Tones: default, muted, error. Sizes: xs, sm. |
| `Heading` | Serif heading (Source Serif 4), levels 1 to 3. Older style, not on the home page. |
| `Text` | Reading text held to the measure. Variants: lead, body, small. Optional muted. |
| `TextLink` | Inline link, always underlined. The underline thickens on hover. |
| `Button` | Square corners. Primary (ink fill) and secondary (outline). An anchor when given `href`. |
| `Rule` | Horizontal rule, thin or strong. |
| `Section` | A numbered page section: a rule, the number, the title, the content. |
| `Table` | Headers, thin rules between rows, the first column as the row header. |
| `Note` | A boxed note on the fill colour. The error tone is the only place red appears. |
| `NumberedList` | A numbered list of short statements, a bold line and one sentence each. |
| `ProcessFlow` | A static flow of boxes and arrows. Weights: normal, strong, quiet. |

## Retired

- `public/brand/wordmark-black.svg`, `wordmark-white.svg`: the typewriter wordmark. Replaced by the mark and the live wordmark. Do not use.
- The old blue and orange logo.

## Pages

- `/` is the home page.
- `/design-system` is the specimen.
- `/flows` shows the reference flows, marked `noindex`.
