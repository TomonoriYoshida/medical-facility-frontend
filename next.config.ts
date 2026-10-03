import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only, so build to `out/` as a static export.
  output: "export",
  // A project site is served under /<repo>/; the deploy workflow passes it in.
  basePath: process.env.BASE_PATH ?? "",
  // Emit about/index.html rather than about.html, so /about/ (a common way to
  // type or share a URL) is found on GitHub Pages too, which then redirects
  // /about to it. Link and router.push add the slash themselves.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
