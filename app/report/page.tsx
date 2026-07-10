'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import { loadQuest, saveQuest } from '@/lib/quest-store';
import { getProfile, saveProfile } from '@/lib/profile';
import { getRoleById } from '@/lib/roles';
import { GUILD_DEFS } from '@/lib/guilds';
import { buildWhyFitText, RIASEC_SHORT_LABELS } from '@/lib/report';
import { RIASEC_TYPE_NAMES } from '@/lib/interest-quiz';
import styles from './report.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface InterestData {
  hollandCode: string;
  topRoleIds: string[];
  scores: Record<string, number>;
  at: string;
}

// ── Inline SVG icons ───────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="var(--sky-soft)" stroke="var(--sky)" strokeWidth="2"/>
      <circle cx="24" cy="24" r="4" fill="var(--brand)"/>
      <path d="M24 10v4M24 34v4M10 24h4M34 24h4" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 19l3 3-3 7 7-3 3-7-7 3z" fill="var(--brand)" opacity=".6"/>
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1l1.5 3.5L12 6 8.5 8 10 12 7 9.5 4 12l1.5-4L2 6l3.5-1.5z" fill="var(--brand)" stroke="var(--brand)" strokeWidth=".5" strokeLinejoin="round"/>
    </svg>
  );
}

function InternIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Card colour helpers ────────────────────────────────────────────────────

const CARD_THEMES = ['cardSky', 'cardMint', 'cardGrape'] as const;
type CardTheme = typeof CARD_THEMES[number];

const BTN_TARGET_CLASS: Record<CardTheme, string> = {
  cardSky: styles.btnTargetSky,
  cardMint: styles.btnTargetMint,
  cardGrape: styles.btnTargetGrape,
};

const CARD_INDEX_LABELS = ['方向一', '方向二', '方向三'];

// ── Main page ──────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [interest, setInterest] = useState<InterestData | null | undefined>(undefined); // undefined = loading
  const [jobCounts, setJobCounts] = useState<Record<string, number> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const quest = loadQuest();
    setInterest((quest.interest as InterestData | null) ?? null);
  }, []);

  // Fetch job counts after interest loads
  useEffect(() => {
    if (!interest) return;
    fetch('/api/jobs/counts')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.counts) setJobCounts(data.counts as Record<string, number>);
      })
      .catch(() => { /* keep null */ });
  }, [interest]);

  // ── 設目標 handler ─────────────────────────────────────────────────────
  function handleSetTarget(roleId: string) {
    // 1. 讀 profile.v1，設 goalRoleId，寫回
    const profile = getProfile();
    if (profile) {
      profile.goalRoleId = roleId;
      saveProfile(profile);
    }

    // 2. 讀 quest.v1，清 questLine，寫回（島頁 useEffect 用新 goalRoleId 重生關卡線）
    const quest = loadQuest();
    quest.questLine = null;
    saveQuest(quest);

    // 3. 導向島頁
    window.location.href = '/island';
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (interest === undefined) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/report" />
        <main className="site-main" id="main-content" />
        <Footer />
      </div>
    );
  }

  // ── No interest data → 引導卡 ───────────────────────────────────────────
  if (!interest) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/report" />
        <main className="site-main" id="main-content">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <CompassIcon />
            </div>
            <h1 className={styles.emptyTitle}>還沒有你的探索報告</h1>
            <p className={styles.emptyDesc}>
              先花 2 分鐘做興趣測驗，我們用 RIASEC 性格模型幫你找出最適合的 3 個職涯方向，並附上第一步行動建議。
            </p>
            <a href="/quiz/interest" className="btn-game">
              開始興趣測驗
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Has interest data → 完整報告 ─────────────────────────────────────────
  const hollandCode = interest.hollandCode;
  const normalizedKey = (() => {
    if (hollandCode.length < 2) return hollandCode;
    const a = hollandCode[0];
    const b = hollandCode[1];
    return a < b ? a + b : b + a;
  })();
  const typeInfo = RIASEC_TYPE_NAMES[normalizedKey] ?? {
    name: '獨特組合',
    desc: '你的興趣組合相當獨特，適合跨領域發展。',
  };
  const scores = interest.scores;
  const maxScore = 9; // 每型 3 題 × 最高 3 分

  const topRoleIds = interest.topRoleIds ?? [];

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/report" />
      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 620, margin: '0 auto' }}>

          {/* 頁首 */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>你的探索報告</h1>
            <p className={styles.pageSubtitle}>根據 RIASEC 測驗為你找出最適合的 3 個職涯方向</p>
          </div>

          {/* ── 性格區塊 ─────────────────────────────────────────────── */}
          <div className={styles.personalitySection}>
            <div className={styles.personalityHeader}>
              <div className={styles.personalityBadge}>{hollandCode}</div>
              <div className={styles.personalityInfo}>
                <div className={styles.personalityName}>{typeInfo.name}</div>
                <div className={styles.personalityDesc}>{typeInfo.desc}</div>
              </div>
            </div>

            <div className={styles.scoresTitle}>六型得分分佈</div>
            {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((t) => {
              const score = scores[t] ?? 0;
              const pct = Math.round((score / maxScore) * 100);
              return (
                <div key={t} className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>{RIASEC_SHORT_LABELS[t]}</span>
                  <div className={styles.scoreTrack}>
                    <div className={styles.scoreFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.scoreNum}>{score}/{maxScore}</span>
                </div>
              );
            })}
          </div>

          {/* ── 3 張方向卡 ───────────────────────────────────────────── */}
          <div className={styles.cardsSection}>
            <div className={styles.sectionTitle}>為你推薦的 3 個方向</div>

            {topRoleIds.map((roleId, idx) => {
              const role = getRoleById(roleId);
              if (!role) return null;

              const theme = CARD_THEMES[idx] ?? CARD_THEMES[0];
              const guild = GUILD_DEFS.find((g) => g.roleId === roleId) ?? null;
              const whyText = buildWhyFitText(hollandCode, roleId);

              // 實習數
              const count = jobCounts?.[roleId];
              const hasCount = typeof count === 'number' && count > 0;

              return (
                <div key={roleId} className={`${styles.dirCard} ${styles[theme]}`}>
                  <div className={styles.cardIndex}>{CARD_INDEX_LABELS[idx]}</div>
                  <div className={styles.cardTitle}>{role.name}</div>
                  <div className={styles.cardDesc}>{role.description}</div>

                  {/* 為什麼適合你 */}
                  {whyText && (
                    <div className={styles.whyBlock}>
                      <div className={styles.whyLabel}>
                        <SparkIcon />
                        為什麼適合你
                      </div>
                      <div className={styles.whyText}>{whyText}</div>
                    </div>
                  )}

                  {/* 實習數量 */}
                  {hasCount ? (
                    <a
                      href="/war-room"
                      className={`${styles.internCount} ${styles.internCountLink}`}
                    >
                      <InternIcon />
                      現在有 {count} 個實習
                    </a>
                  ) : (
                    <span className={`${styles.internCount} ${styles.internCountScan}`}>
                      <InternIcon />
                      {jobCounts === null ? '實習雷達掃描中' : '實習雷達掃描中'}
                    </span>
                  )}

                  {/* 相關公會 */}
                  {guild && (
                    <div className={styles.guildBlock}>
                      <div
                        className={styles.guildBadgeWrap}
                        dangerouslySetInnerHTML={{ __html: guild.badge }}
                      />
                      <div className={styles.guildInfo}>
                        <div className={styles.guildName}>{guild.name}</div>
                        <div className={styles.guildTagline}>{guild.tagline}</div>
                      </div>
                      <a href={`/guilds/${guild.id}`} className={styles.guildLink}>
                        進公會
                      </a>
                    </div>
                  )}

                  {/* CTA */}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={BTN_TARGET_CLASS[theme]}
                      onClick={() => handleSetTarget(roleId)}
                    >
                      以此為目標
                      <ArrowRightIcon />
                    </button>
                    <a href="/quiz/ability" className={styles.btnAbility}>
                      做能力測驗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 底部 CTA ─────────────────────────────────────────────── */}
          <div className={styles.bottomCta}>
            <div className={styles.bottomCtaText}>
              <div className={styles.bottomCtaTitle}>準備好開始闖關了嗎？</div>
              <div className={styles.bottomCtaDesc}>完成更多任務，解鎖你的職涯徽章</div>
            </div>
            <a href="/island" className="btn-game">
              開始闖關
              <ArrowRightIcon />
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
