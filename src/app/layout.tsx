import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import MaintenanceNotice from "@/components/maintenance-notice";
import SiteHeader from "@/components/site-header";
import { apiUnavailableMessage, isApiConfigured } from "@/lib/api/client";
import { ogImage, siteDescription, siteName, xHandle } from "@/lib/site";
import Providers from "./providers";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "700"],
  subsets: ["latin"],
  // The Japanese glyphs come in many unicode-range files; preloading all of them would be wasteful.
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  // Shown when the URL is shared (Slack, X, LINE, ...).
  openGraph: {
    // No url: set here, every page would claim to be the top page when shared.
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "ja_JP",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    site: xHandle,
    creator: xHandle,
    images: [ogImage],
  },
};

const hubUrl = "https://tomonoriyoshida.github.io/";
const repositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-frontend";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <MaintenanceNotice />
          {!isApiConfigured && (
            <p role="status" className="border-b border-border bg-band px-4 py-3 text-center text-sm">
              {apiUnavailableMessage}
            </p>
          )}
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <footer className="border-t border-border bg-surface">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-muted sm:px-6">
              <p>医療施設マスタAPIのデモアプリケーションです。</p>
              <div className="flex gap-4">
                <a href={hubUrl} className="text-accent underline underline-offset-2 hover:opacity-80">
                  ポートフォリオ
                </a>
                <a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:opacity-80"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
