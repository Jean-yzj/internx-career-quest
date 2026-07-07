/**
 * components/StageResources.tsx — Agent E 擁有
 * 藍藍的錦囊：關卡展開卡內的階段資源區塊
 * 策展日期：2026-07-07
 */

import type { StageResource } from '@/lib/resources';
import styles from './StageResources.module.css';

// ──────────────────────────────────────────────
// Inline SVG icons（無 emoji）
// ──────────────────────────────────────────────

function ArticleIcon() {
  // 書頁
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="var(--sky-deep,#1861A8)" strokeWidth="1.4"/>
      <path d="M5 5h6M5 7.5h6M5 10h4" stroke="var(--sky-deep,#1861A8)" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="10" y="7" width="4" height="5" rx="1" fill="var(--sky-deep,#1861A8)" opacity=".25"/>
    </svg>
  );
}

function VideoIcon() {
  // 播放圓
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="var(--sky-deep,#1861A8)" strokeWidth="1.4"/>
      <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="var(--sky-deep,#1861A8)"/>
    </svg>
  );
}

function GuideIcon() {
  // 燈泡
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2a4 4 0 0 1 2.5 7.1V11H5.5V9.1A4 4 0 0 1 8 2z" stroke="var(--ink-2,#4A6172)" strokeWidth="1.3" fill="none"/>
      <path d="M6 11h4" stroke="var(--ink-2,#4A6172)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6.5 13h3" stroke="var(--ink-2,#4A6172)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function ClubIcon() {
  // 旗幟
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2v12" stroke="var(--ink-2,#4A6172)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M3 2l9 3-9 3" fill="var(--ink-2,#4A6172)" opacity=".75" strokeLinejoin="round"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="var(--sky-deep,#1861A8)" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h3v3M11 1L6.5 5.5" stroke="var(--sky-deep,#1861A8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TypeIcon({ type }: { type: StageResource['type'] }) {
  switch (type) {
    case 'article': return <ArticleIcon />;
    case 'video':   return <VideoIcon />;
    case 'guide':   return <GuideIcon />;
    case 'club':    return <ClubIcon />;
  }
}

// ──────────────────────────────────────────────
// 主元件
// ──────────────────────────────────────────────

interface StageResourcesProps {
  resources: StageResource[];
}

export default function StageResources({ resources }: StageResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <div className={styles.container} aria-label="藍藍的錦囊">
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          {/* 錦囊小圖：藍藍捧著一個包包 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2c5 0 8 3.5 8 8 0 5-3 8-8 8S2 15 2 10c0-4.5 3-8 8-8z" fill="#4DA3FF" opacity=".2"/>
            <circle cx="7.5" cy="9" r="1.2" fill="#1A2733"/>
            <circle cx="12.5" cy="9" r="1.2" fill="#1A2733"/>
            <path d="M8 12c1 1 3 1 4 0" stroke="#1A2733" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M7 5.5c0-1 1-2 3-2s3 1 3 2" stroke="#4DA3FF" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <span className={styles.headerTitle}>藍藍的錦囊</span>
      </div>

      <div className={styles.list}>
        {resources.map((r, i) => {
          const hasLink = !!r.url;
          const isGuideOrClub = r.type === 'guide' || r.type === 'club';

          if (hasLink) {
            return (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <div className={styles.typeIcon}>
                  <TypeIcon type={r.type} />
                </div>
                <div className={styles.content}>
                  <div className={styles.title}>{r.title}</div>
                  <p className={styles.note}>{r.note}</p>
                </div>
                <div className={styles.extBadge}>
                  <ExternalLinkIcon />
                </div>
              </a>
            );
          }

          // guide / club without url — 純站內文字卡
          return (
            <div key={i} className={styles.itemNoLink}>
              <div className={styles.typeIcon}>
                <TypeIcon type={r.type} />
              </div>
              <div className={styles.content}>
                <div className={styles.title}>{r.title}</div>
                <p className={styles.note}>{r.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
