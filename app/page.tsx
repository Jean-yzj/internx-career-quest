import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';

export const metadata: Metadata = {
  title: '職涯闖關島 | 知道下一步，每天前進一點',
  alternates: { canonical: 'https://quest.lazybearlife.com' },
};

export default function LandingPage() {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-header-inner">
          <span className="site-logo">
            {/* 24px mascot head inline */}
            <svg width="24" height="24" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <path d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z" fill="#4DA3FF" stroke="#1861A8" strokeWidth="3"/>
              <path d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z" fill="#EAF4FF"/>
              <circle cx="48" cy="50" r="4" fill="#1A2733"/><circle cx="72" cy="50" r="4" fill="#1A2733"/>
              <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            職涯闖關島
          </span>
          <nav className="site-nav" aria-label="主導覽">
            <Link href="/roles" className="nav-link"><span className="nav-label">準備清單</span></Link>
            <Link href="/war-room" className="nav-link"><span className="nav-label">戰情室</span></Link>
            <Link href="/analysis" className="nav-link"><span className="nav-label">履歷分析</span></Link>
            <Link href="/quiz/interest" className="nav-link"><span className="nav-label">測驗</span></Link>
          </nav>
        </div>
      </header>

      <main className="site-main" id="main-content">
        {/* Hero */}
        <section style={{ padding: '36px 0 32px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div className="landing-hero-card">
            {/* decorative clouds */}
            <span className="landing-cloud-1" aria-hidden="true" />
            <span className="landing-cloud-2" aria-hidden="true" />
            <span className="landing-cloud-3" aria-hidden="true" />

            {/* mascot */}
            <div className="mascot-idle" style={{ marginBottom: 12 }}>
              <Mascot size={88} variant="happy" />
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: 'var(--ink)' }}>
              知道下一步，<br />每天前進一點
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 28 }}>
              不知道適合什麼、履歷很空、投了沒回音，都先變成今天能完成的一小步。
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/quick-start" className="btn-game">3 分鐘健檢</Link>
              <Link href="/island" className="btn-game-sec">繼續闖關</Link>
            </div>
          </div>
        </section>

        {/* Pain-first entry points */}
        <section style={{ maxWidth: 860, margin: '0 auto 42px' }} aria-label="選擇目前遇到的問題">
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', color: 'var(--ink-2)', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            你現在卡在哪
          </h2>
          <div className="landing-path-grid">
            <Link href="/quick-start" className="landing-path-card">
              <span className="landing-path-icon landing-path-icon-sky">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17.5 10.5l-2.2 5.1-4.8 1.9 2.2-5.1 4.8-1.9z" fill="currentColor" opacity=".45"/>
                </svg>
              </span>
              <strong>不知道適合什麼</strong>
              <span>用 18 題測驗先找出 3 個方向。</span>
            </Link>
            <Link href="/analysis" className="landing-path-card">
              <span className="landing-path-icon landing-path-icon-sand">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect x="7" y="4" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 11h8M10 15h6M10 19h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <strong>履歷看起來很空</strong>
              <span>貼上文字，先找最值得補的缺口。</span>
            </Link>
            <Link href="/war-room" className="landing-path-card">
              <span className="landing-path-icon landing-path-icon-mint">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect x="5" y="7" width="18" height="15" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 7V5h8v2M9 13h10M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <strong>投遞進度很亂</strong>
              <span>把職缺整理成截止日與下一步。</span>
            </Link>
          </div>
        </section>

        <section className="landing-prep-band" aria-label="實習準備清單">
          <div>
            <h2>先看職位準備清單</h2>
            <p>PM、行銷、軟體工程師、數據分析等 10 個方向，整理成履歷檢查、作品集證據與 7 天任務。</p>
          </div>
          <Link href="/roles" className="btn-ghost">查看清單</Link>
        </section>

        {/* Three steps */}
        <section style={{ maxWidth: 720, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', color: 'var(--ink-2)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            怎麼開始
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon step-icon-sky">
                {/* compass/map icon */}
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <circle cx="13" cy="13" r="10" stroke="var(--sky-deep)" strokeWidth="2"/>
                  <path d="M13 7 L14.5 12h5l-4 3 1.5 5L13 17l-4 3 1.5-5-4-3h5z" fill="var(--sky-deep)" opacity=".5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>測驗方向</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>18 題 RIASEC 找出你的職業性格，推薦最適合的 3 個方向。</p>
            </div>
            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon step-icon-sand">
                {/* scroll/resume icon */}
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <rect x="5" y="3" width="16" height="20" rx="3" stroke="var(--sand-deep)" strokeWidth="2"/>
                  <path d="M9 9h8M9 13h5M9 17h7" stroke="var(--sand-deep)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>分析履歷</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>貼上履歷文字，AI 分析六大維度並找出具體缺口。</p>
            </div>
            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon step-icon-mint">
                {/* progress bars icon */}
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <path d="M5 19V14M10 19V9M15 19V12M20 19V7" stroke="var(--mint-deep)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 7l6-4 5 3 5-4" stroke="var(--mint-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>每天前進</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>每日 3 個任務，完成獲得金幣，升級解鎖新里程碑。</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
