/*
  The one line on the site that says what IssueSolved does (identity note, change of 2026-11-05).
  Used as the home page heading, the page title and the meta description. On the page it sits on two lines: the
  first is typed in, the second ripples in once the first is done.
*/
export const HEADLINE_LINES = ["Transform your Business with AI,", "Reclaim your Time."] as const;
export const HEADLINE = HEADLINE_LINES.join(" ");

/** The words set bold in the heading; the rest stay light. Each takes a logo colour (globals.css, .hl-*):
    Transform orange, Business navy, Reclaim green, AI and Time the text colour. */
export const HEADLINE_BOLD = ["Transform", "Business", "AI", "Reclaim", "Time"];
