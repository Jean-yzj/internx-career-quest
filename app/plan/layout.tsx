import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的 7 天求職計畫｜職涯闖關島',
  description: '依你的目標職位與履歷缺口，完成一週可執行的求職準備。',
  robots: { index: false, follow: false },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
