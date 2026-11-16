import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site has no server work: no route handlers, no server actions, no database. Every page
  // is pre-rendered to HTML at build time and served by Netlify as plain files, which keeps the
  // deploy on the free tier with no serverless functions behind it.
  output: "export",
  // Nothing uses next/image, but this keeps the export working if a component ever does.
  images: { unoptimized: true },
};

export default nextConfig;
