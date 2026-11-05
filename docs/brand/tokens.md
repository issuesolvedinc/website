# Tokens and layout

The tokens are in [tokens.css](tokens.css): plain CSS custom properties, no framework, no build step. Link it, or copy it, and use the semantic tokens (`--bg`, `--fg`, `--accent`, `--mark-high`, ...). Light is the default; dark follows the system setting, and `data-theme="light"` or `"dark"` forces one on any element. Brand palette tokens carry an `--is-` prefix. Colour meanings are in [colour.md](colour.md).

In the website repo the same values live in `src/styles/tokens.css`, and Tailwind 4 maps them in `src/app/globals.css`. Keep the two files in step until the website imports this one.

## Spacing

A 4 px base, the same as Tailwind's scale (`p-4` is `--space-4`): 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4 and 6 rem.

## Layout

| Token | Value | Use |
|---|---|---|
| `--page-max` | 68rem | Outer width of the page |
| `--measure` | 38rem | Longest line of reading text |
| `--label-col` | 11rem | Left column for section numbers, from 48rem up |
| `--gutter` | 1rem, 3rem from 48rem | Page side margin |
| `--rule-width` | 1px | Thin rules |
| `--rule-width-strong` | 2px | Table heads, rare emphasis |

Every page is designed at 375 px (phone) and desktop. No horizontal scroll at phone width.

## Corners

Tailwind's radius and shadow scales are cleared, so nothing rounds or casts a shadow by accident. Corners are set on purpose:

| Shape | Corner |
|---|---|
| Page blocks, buttons, tables, the Solved block | Square |
| The Issue outline in the wordmark | 0.32em |
| Flow cards | 10 px |
| Flow source pills, contact reveal | 10 px, pill ends where the flow grammar says |

## Glass

Frosted surfaces sit over an effect or a flow, never over plain paper: `--glass` with a 10 px backdrop blur and a 1 px `--glass-edge` border. Used today on the agent flow panels. The logo never takes glass.

## Focus

`:focus-visible` draws a 2 px outline in `--fg`, 3 px offset. Never remove it.

## Components

In the website repo the current set is in `src/components/`, listed in its `DESIGN.md`, with a specimen at `/design-system`. New components use DM Sans, the tokens above, and the flow grammar where they show work.
