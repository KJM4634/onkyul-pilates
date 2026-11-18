import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { SITE } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["필라테스", "성수 필라테스", "기구 필라테스", "소수정예 필라테스", "1:1 필라테스", "필라테스 예약"],
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f8f5ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <script
          type="application/ld+json"
          // 검색엔진용 구조화 데이터 (가상 매장 정보)
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              name: SITE.name,
              description: SITE.description,
              telephone: SITE.phone,
              address: { "@type": "PostalAddress", streetAddress: SITE.address, addressCountry: "KR" },
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
