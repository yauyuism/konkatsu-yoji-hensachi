import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import { Suspense } from "react";

import { GlobalHeader } from "@/components/GlobalHeader";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, SITE_NAME } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const bodyFont = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const numericFont = Outfit({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-number",
  display: "swap",
});

const siteUrl = getSiteUrl();
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const validGaId = gaId && /^G-[A-Z0-9]+$/i.test(gaId) ? gaId : null;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${DEFAULT_SITE_TITLE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  keywords: [
    "婚活診断",
    "恋愛診断",
    "マッチングアプリ偏差値",
    "プロフィール偏差値",
    "条件リアリティチェッカー",
    "婚活スペック年収換算",
    "LINEメッセージ重量",
    "診断ラボ",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${DEFAULT_SITE_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/api/og-top",
        width: 1200,
        height: 630,
        alt: "婚活診断LAB by やうゆ",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `${DEFAULT_SITE_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [
      {
        url: "/api/og-top",
        alt: "婚活診断LAB by やうゆのトップページOGP画像",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${bodyFont.variable} ${numericFont.variable} bg-app text-app-text antialiased`}>
        {validGaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${validGaId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${validGaId}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <GlobalHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
