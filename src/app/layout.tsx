import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/site-header";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "医療施設マスタ検索",
    template: "%s | 医療施設マスタ検索",
  },
  description:
    "全国8つの地方厚生局が公開する保険医療機関・保険薬局の指定一覧をもとに、全国約22万の病院・診療所・歯科診療所・薬局を検索できます。",
};

const hubUrl = "https://tomonoriyoshida.github.io/";
const repositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-frontend";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-6">
              <p>医療施設マスタAPIのデモアプリケーションです。</p>
              <div className="flex gap-4">
                <a href={hubUrl} className="hover:text-foreground">
                  ポートフォリオ
                </a>
                <a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
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
