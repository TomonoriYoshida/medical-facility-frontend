/**
 * This site's public URL including the base path, set by the deploy workflow
 * from GitHub Pages (e.g. https://tomonoriyoshida.github.io/medical-facility-frontend).
 * Link previews need absolute URLs.
 */
export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const siteName = "医療施設マスタ検索";

export const siteDescription =
  "全国8つの地方厚生局が公開する保険医療機関・保険薬局の指定一覧をもとに、全国約22万の病院・診療所・歯科診療所・薬局を検索できます。";

/** The link preview image, rendered by src/app/og.png/route.tsx. */
export const ogImage = {
  url: `${siteUrl}/og.png`,
  width: 1200,
  height: 630,
  alt: "医療施設マスタ検索 — 全国約22万の病院・診療所・歯科診療所・薬局を検索（医療施設マスタAPIのデモ）",
};
