# Colour

Two sets: the brand colours (the mark, the wordmark, the headline words, print) and the site tokens (the interface). Components use the tokens, never raw values.

## Brand colours

| Name | Light | Dark | Means |
|---|---|---|---|
| Midnight navy | `#0A1F44` | `#2A4A8F` in the mark, `#7D9BE0` as text | Trust, finance, the steady base |
| Emerald | `#0F7B5F` | `#2FC79B` | Money, done, solved |
| Orange | `#FF9A00` | `#FF9A00` | The accent: AI at work, the moving dot, the caret, the dashed Issue outline |
| Orange for text | `#9A5300` | `#FF9A00` | Orange words on a light ground |
| White | `#FFFFFF` | `#FFFFFF` | The cut in the mark |

## Site tokens

Set in [tokens.css](tokens.css). Themes follow the system, and `data-theme="light"` or `"dark"` forces one on any element.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f5f0` paper | `#141414` night | Page background |
| `--fg` | `#141414` ink | `#f2efe8` chalk | Text |
| `--fg-muted` | `#5c5852` | `#a8a39a` | Secondary text |
| `--rule` | `#b3ada2` | `#4a4843` | Thin rules, quiet borders. Never text. |
| `--fill` | `#ece8e0` | `#242422` | Note boxes, hover fills |
| `--accent` | `#ff9a00` | `#ff9a00` | Orange shapes |
| `--accent-fg` | `#9a5300` | `#ff9a00` | Orange text |
| `--flow` | `#1f55e6` | `#6b95ff` | Work moving through a flow, nothing else |
| `--ok` | `#168a4a` | `#3fcf7e` | A flow running steady, connected, done |
| `--error` | `#8c2f1f` | `#e08a78` | Errors only. Nothing else is red. |
| `--glass` | paper at 72% | night at 68% | Frosted surfaces |
| `--glass-edge` | ink at 14% | chalk at 16% | Edge of a frosted surface |
| `--brand-green` | `#0f7b5f` | `#2fc79b` | The Solved block, Reclaim |
| `--brand-navy` | `#0a1f44` | `#7d9be0` | Business in the headline |

Note: the site's `--ok` green (`#168a4a`) and the brand emerald (`#0f7b5f`) are two different greens. `--ok` is the state colour inside flows; emerald is the brand. Do not mix them on one shape.

## Contrast

WCAG 2 ratios. Text needs 4.5:1, large text (24 px, or 19 px bold) needs 3:1.

| Pair | Ratio | Pass for |
|---|---|---|
| Ink `#141414` on paper | 16.91 | All text |
| Navy `#0A1F44` on white | 16.25 | All text |
| White on navy | 16.25 | All text |
| Emerald `#0F7B5F` on white | 5.23 | All text |
| Emerald on paper | 4.80 | All text |
| White on emerald | 5.23 | All text |
| Orange text `#9A5300` on paper | 5.34 | All text |
| Orange `#FF9A00` on navy | 7.64 | All text |
| Orange `#FF9A00` on night | 8.66 | All text |
| Bright emerald `#2FC79B` on night | 8.57 | All text |
| Ink on bright emerald | 8.57 | All text |
| Light navy `#7D9BE0` on night | 6.70 | All text |
| Orange `#FF9A00` on white | 2.13 | Shapes only, fails as text |
| Orange `#FF9A00` on paper | 1.95 | Shapes only, fails as text |
| Mark navy, dark `#2A4A8F`, on night | 2.17 | Shapes only, never text |

Open issue: the live headline sets "Transform" in `#FF9A00` on paper (1.95:1), and so does the business card on white (2.13:1). That fails even the large text rule. Fix proposed: use `#9A5300` for the word on light grounds, keep `#FF9A00` on dark. Waiting for the founder.
