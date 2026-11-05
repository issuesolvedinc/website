import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans, Source_Serif_4 } from "next/font/google";
import { HEADLINE } from "@/content/headline";
import "./globals.css";

// A plain, friendly sans, close in feel to the type on anthropic.com (whose own faces are not licensed for
// other sites). It sets the wordmark, the headline, the buttons and the map.
const sans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `IssueSolved | ${HEADLINE.replace(/\.$/, "")}`,
  // The headline is the only line that says what IssueSolved does; no services are named.
  description: HEADLINE,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
