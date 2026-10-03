import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Written to out/sitemap.xml at build time (static export).
export const dynamic = "force-static";

// The pages a visitor can land on directly. /facility shows one facility by a
// query parameter, so its ~220,000 variations are reached from search instead.
// GitHub Pages serves robots.txt only from the domain root (the portfolio's
// repository), so this file is submitted to search engines on its own.
const paths = ["/", "/nearby/", "/dashboard/", "/events/", "/about/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
