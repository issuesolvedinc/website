import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // The static site goes to build/. Dev keeps its own folder so `next dev` never overwrites an export.
  distDir: process.env.NODE_ENV === "production" ? "build" : ".next",
  images: { unoptimized: true },
};

export default nextConfig;
