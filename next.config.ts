import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only, so build to `out/` as a static export.
  output: "export",
  // A project site is served under /<repo>/; the deploy workflow passes it in.
  basePath: process.env.BASE_PATH ?? "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
