import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '職涯闖關島 | 知道下一步，每天前進一點',
  alternates: { canonical: 'https://internx-career-quest.zeabur.app' },
};

export default function LandingPage() {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-header-inner">
          <span className="site-logo">職涯闖關島</span>
          <nav className="site-nav" aria-label="主導覽">
            <Link href="/war-room" className="nav-link">戰情室</Link>
            <Link href="/analysis" className="nav-link">履歷分析</Link>
            <Link href="/quiz/interest" className="nav-link">測驗</Link>
          </nav>
        </div>
      </header>

      <main className="site-main" id="main-content">
        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '48px 0 40px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <circle cx="28" cy="28" r="28" fill="#0182FD" opacity=".1"/>
              <path d="M28 14 L38 24 L34 24 L34 36 L22 36 L22 24 L18 24 Z" fill="#0182FD"/>
              <circle cx="28" cy="40" r="3" fill="#0182FD" opacity=".4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: 'var(--ink)' }}>
            知道下一步，<br />每天前進一點
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 32 }}>
            測驗興趣方向、分析履歷缺口、追蹤投遞進度——職涯闖關島讓你每天完成一個有意義的小任務，穩定累積求職實力。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn-primary">開始闖關</Link>
            <Link href="/island" className="btn-secondary">繼續闖關</Link>
          </div>
        </section>

        {/* Three steps */}
        <section style={{ maxWidth: 720, margin: '0 auto 48px', padding: '0 0 0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', color: 'var(--ink-2)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            怎麼開始
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--island-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" stroke="#7A5C00" strokeWidth="1.5"/>
                  <path d="M7 10l2 2 4-4" stroke="#7A5C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>測驗方向</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>18 題 RIASEC 找出你的職業性格，推薦最適合的 3 個方向。</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--island-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="4" y="3" width="12" height="14" rx="2" stroke="#7A5C00" strokeWidth="1.5"/>
                  <path d="M7 8h6M7 11h4" stroke="#7A5C00" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>分析履歷</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>貼上履歷文字，AI 分析六大維度並找出具體缺口。</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--island-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 15V10M8 15V7M12 15V11M16 15V9" stroke="#7A5C00" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>每天前進</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>每日 3 個任務，完成獲得點數，升級解鎖新里程碑。</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
