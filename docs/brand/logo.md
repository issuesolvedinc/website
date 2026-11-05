# Logo

Decided by the founder, 2026-11-05.

## The mark

A right triangle in the lower right, cut from its bottom left corner to the middle of its right side. Midnight navy above the cut, emerald below, a white wedge along the cut that widens to the right, and an orange dot off the middle of the diagonal.

What it says: an issue (the orange dot, the AI at work) beside a problem cut through and solved (the emerald check shape under the cut).

| Part | Light grounds | Dark grounds |
|---|---|---|
| Upper triangle, navy | `#0A1F44` | `#2A4A8F` |
| Cut, white wedge | `#FFFFFF` | `#FFFFFF` |
| Lower triangle, emerald | `#0F7B5F` | `#2FC79B` |
| Dot, orange | `#FF9A00` | `#FF9A00` |

Geometry, on a 40 unit grid, all filled, no strokes:

- Lower: `M7 33 L33 33 L33 20 Z`
- Upper: `M7 33 L33 20 L33 7 Z`
- Wedge: `M7 33 L33 17.7 L33 22.3 Z`
- Dot: centre 13.64, 13.64, radius 6.5
- Crop: viewBox `6.5 6.5 27 27`. The favicon uses `5.5 5.5 29 29` so the dot does not touch the tab edge.

## Files

| File | Use |
|---|---|
| `assets/mark-light.svg` | On white, paper or any light ground |
| `assets/mark-dark.svg` | On night, ink or any dark ground |
| `assets/mark-light-512.png`, `-1024.png` | Light, transparent PNG, for tools that need a raster |
| `assets/mark-dark-512.png`, `-1024.png` | Dark, transparent PNG |
| `assets/mark-mono-ink.svg` | One colour ink, for stamps, faxes, embossing **(proposed)** |
| `assets/mark-mono-white.svg` | One colour white, on photos or a colour ground **(proposed)** |
| `assets/favicon.svg` | The browser tab icon. Switches with the system theme. |

In the one colour versions the cut is a real gap, not white, so they work on any ground.

## The wordmark

"IssueSolved" in DM Sans semibold, drawn like two nodes of a process flow:

- "Issue" in the text colour, inside a rounded, dashed orange outline (work waiting).
- "Solved" in italic, on a square cornered emerald block (work done). White text on light grounds, ink `#141414` on the bright emerald in dark.

In code it is live text (`src/components/wordmark.tsx`), sized with a text class. Border 0.09em, padding 0.14em 0.3em 0.18em, Issue corner radius 0.32em, gap 0.1em.

## The lockup

The mark at the left of the wordmark, the mark as tall as the wordmark blocks.

| File | Use |
|---|---|
| `assets/lockup-light.svg`, `lockup-light-1110.png` | Light grounds |
| `assets/lockup-dark.svg`, `lockup-dark-1110.png` | Dark grounds |

The SVG lockups use live DM Sans text. Convert the text to outlines before sending them to a printer or a tool that may not have the font.

On the site header the mark is 1.75rem next to the wordmark at 1.125rem.

## Clear space **(proposed)**

Keep empty space around the mark of at least the dot's diameter (about half the mark's height) on every side. Around the lockup, the same distance, measured from the mark.

## Minimum size **(proposed)**

| Item | Screen | Print |
|---|---|---|
| Mark | 16 px (the favicon holds at this size) | 6 mm, 0.25 in |
| Lockup | 120 px wide | 30 mm wide |

Below the lockup minimum, use the mark alone.

## Where it appears

Three places on a page at most: the header (mark and wordmark), the favicon (mark), and one more where it is the signature (a footer, a deliverable). The name is written out once per surface.

On a flow delivered to a client in their own theme, the mark is the signature. It keeps its own colours.

## Do not

- Redraw, trace or rebuild the mark. Use the files.
- Recolour parts, swap navy and emerald, or put the light version on a dark ground.
- Add outlines, shadows, glows, gradients, glass or 3D.
- Stretch, skew, rotate or flip it.
- Move the dot, resize it, or replace it with another symbol.
- Put it on a busy photo without the one colour white version.
- Use the retired logos (the old blue and orange logo, the typewriter wordmark in `public/brand/`).
- Tie the orange dot to any other company's brand. It is our orange.
