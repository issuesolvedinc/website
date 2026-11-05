# Flow and motion

Process flow is the spine of IssueSolved: services, engagements, project status, the team, are all drawn as flows. One engine, one data shape, many themes.

The full grammar (the story of the main map, cards, figures, tool colours, wires, speeds, the engine files and how to check the result) lives in the `dynamic-process-flow` skill. Read it before building or changing a flow. This page is the short version.

## Flow grammar in short

- **Nodes**: cards with a small coloured tool tile and a short title, or pills for sources and single words. One size per row.
- **Wires**: straight, 45 degree or vertical, chamfered corners. Never curves. Ports are small open circles.
- **Colour meanings**: blue `--flow` is work moving. Green `--ok` is the connected, steady line. Amber dashed is rework, an amber triangle is a warning. Red is overload. Orange is the moving dot and the check badge on the main map.
- **Waiting vs done**: dashed and muted is waiting, filled or solid is done. The wordmark uses the same idea (dashed Issue, solid Solved).
- **Words on a flow**: card titles and lane labels only. No claims, no result numbers. Counts are queue sizes, never results.
- **The client is never "You"**: the people at the end of a flow are the Team.

## Motion rules

1. Every flow works still. Motion is a theme setting: still, subtle or animated **(the theme system is being built)**.
2. `prefers-reduced-motion: reduce` always wins. Flows show one still frame, the headline shows at once, `--duration` drops to 0.
3. Off screen, animation pauses.
4. Interface motion is colour and underline changes at `--duration` (150 ms). Nothing bounces, slides or parallaxes in the interface.
5. Motion means something. Each movement in a flow stands for a state (queued, overloaded, checked, done). The table of meanings is in the skill.
6. Slow over fast. The founder asked twice for slower flows. Do not speed one up without asking.
7. The logo never moves.

## Themes

The brief sets three themes to start from: IssueSolved (the current site), Black and White (formal and print), and Still (no motion). A client theme is made from these, and every document delivered to that client wears it, with the IssueSolved mark as the signature. The theme system is owned by the process flow work; this guide will link its tokens once they exist.
