import type { Metadata, Viewport } from "next";
import { Courier_Prime, Source_Serif_4 } from "next/font/google";
import { HEADLINE } from "@/content/headline";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier-prime",
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
    <html lang="en-CA" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
