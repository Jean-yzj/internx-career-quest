import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';
import MigrationBanner from '@/components/MigrationBanner';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
  fallback: ['PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
});

export const metadata: Metadata = {
  title: '職涯闖關島 | 知道下一步，每天前進一點',
  description: '測驗興趣方向、分析履歷缺口、追蹤投遞進度——一站完成求職準備。',
  metadataBase: new URL('https://internx-career-quest.zeabur.app'),
  alternates: {
    canonical: 'https://internx-career-quest.zeabur.app',
  },
  openGraph: {
    type: 'website',
    title: '職涯闖關島',
    description: '測驗興趣方向、分析履歷缺口、追蹤投遞進度——一站完成求職準備。',
    url: 'https://internx-career-quest.zeabur.app',
    siteName: '職涯闖關島',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '職涯闖關島',
      },
    ],
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: '職涯闖關島',
    description: '測驗興趣方向、分析履歷缺口、追蹤投遞進度——一站完成求職準備。',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW" className={notoSansTC.variable}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0182FD" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <MigrationBanner />
        {children}
      </body>
    </html>
  );
}
