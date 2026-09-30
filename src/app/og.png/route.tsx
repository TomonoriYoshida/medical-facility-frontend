import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogImage } from "@/lib/site";

// Rendered to out/og.png at build time. Not the opengraph-image file
// convention: a static export writes that without an extension, and GitHub
// Pages would serve it as application/octet-stream instead of image/png.
export const dynamic = "force-static";

// Noto Sans JP subset to the characters of this file (the default font has
// no Japanese glyphs). After changing the text, regenerate both files from
// https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&text=... (and @700);
// without a browser User-Agent, Google Fonts serves TrueType, which ImageResponse needs.
const fontDirectory = join(process.cwd(), "src/app/fonts");
const regular = await readFile(join(fontDirectory, "og-noto-sans-jp-400.ttf"));
const bold = await readFile(join(fontDirectory, "og-noto-sans-jp-700.ttf"));

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1f3a5f",
          color: "#ffffff",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "rgba(255, 255, 255, 0.7)" }}>API Demo</div>
          <div style={{ marginTop: 12, fontSize: 92, fontWeight: 700 }}>医療施設マスタ検索</div>
          <div style={{ marginTop: 28, fontSize: 38 }}>全国約22万の病院・診療所・歯科診療所・薬局を検索</div>
          <div style={{ marginTop: 16, fontSize: 28, color: "rgba(255, 255, 255, 0.7)" }}>
            8つの地方厚生局の公開データを取り込むREST APIのデモ
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "rgba(255, 255, 255, 0.7)" }}>
          <div>Next.js · TypeScript · Laravel · OpenAPI</div>
          <div>tomonoriyoshida.github.io</div>
        </div>
      </div>
    ),
    {
      width: ogImage.width,
      height: ogImage.height,
      fonts: [
        { name: "Noto Sans JP", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans JP", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
