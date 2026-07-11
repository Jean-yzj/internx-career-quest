import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { ROLES, ROLE_IDS } from '@/lib/roles';
import { getRoleGuide, ROLE_PROOF_IDEAS } from '@/lib/role-guide';
import { GUILD_DEFS } from '@/lib/guilds';
import RoleJobs from '@/components/RoleJobs';
import styles from '../roles.module.css';

const BASE = 'https://quest.lazybearlife.com';

export function generateStaticParams() {
  return ROLE_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const role = ROLES.find((r) => r.id === id);
  const guide = getRoleGuide(id);
  if (!role || !guide) return {};
  return {
    title: `${role.name}實習怎麼準備｜職涯闖關島`,
    description: guide.tagline,
    alternates: {
      canonical: `${BASE}/roles/${id}`,
    },
    openGraph: {
      title: `${role.name}實習怎麼準備｜職涯闖關島`,
      description: guide.tagline,
      url: `${BASE}/roles/${id}`,
    },
  };
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = ROLES.find((r) => r.id === id);
  const guide = getRoleGuide(id);

  if (!role || !guide) notFound();

  const guild = GUILD_DEFS.find((g) => g.roleId === id) ?? null;

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/roles" />
      <main className={styles.detailPage}>
        {/* Back */}
        <Link href="/roles" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M13 4L7 10l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          職位圖鑑
        </Link>

        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>{role.name}</h1>
          <p className={styles.heroTagline}>{guide.tagline}</p>
        </div>

        {/* 這職位是什麼 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>這職位是什麼</h2>
          <p className={styles.whatItIs}>{guide.whatItIs}</p>
        </section>

        {/* 一天在做什麼 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>一天大概在做什麼</h2>
          <ul className={styles.itemList}>
            {guide.dayInLife.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* 需要的能力 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>需要的能力</h2>
          <div className={styles.skillsGrid}>
            {role.skills.map((skill) => (
              <div key={skill.key} className={styles.skillRow}>
                <span className={styles.skillLabel}>{skill.label}</span>
                <div className={styles.skillBarTrack}>
                  <div
                    className={styles.skillBarFill}
                    style={{ width: `${skill.weight}%` }}
                    role="meter"
                    aria-label={`${skill.label} ${skill.weight}%`}
                    aria-valuenow={skill.weight}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className={styles.skillPct}>{skill.weight}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* 怎麼入行 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>怎麼入行</h2>
          <ol className={styles.stepList}>
            {guide.entryPath.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {/* 要準備什麼 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>投實習前要準備什麼</h2>
          <ul className={styles.itemList}>
            {guide.prepare.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* 可以先做這些作品（原 /prep 併入） */}
        {ROLE_PROOF_IDEAS[id] && ROLE_PROOF_IDEAS[id].length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>可以先做這些作品</h2>
            <ul className={styles.itemList}>
              {ROLE_PROOF_IDEAS[id].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* 適合的人 + 薪資 + 誤解 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>適合的人</h2>
          <div className={styles.fitCard}>{guide.goodFit}</div>
          <div className={styles.salaryCard}>
            <strong>薪資參考：</strong>{guide.salaryNote}
          </div>
          {guide.misconception && (
            <div className={styles.misconceptionCard}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 7v4M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span><strong>常見誤解：</strong>{guide.misconception}</span>
            </div>
          )}
        </section>

        {/* 相關公會 */}
        {guild && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>相關公會</h2>
            <Link href={`/guilds/${guild.id}`} className={styles.guildCard}>
              <div
                style={{ width: 44, height: 44, flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: guild.badge }}
              />
              <div>
                <div className={styles.guildName}>{guild.name}</div>
                <div className={styles.guildTagline}>{guild.tagline}</div>
              </div>
            </Link>
          </section>
        )}

        {/* 現在的實習（client 動態載入，避免 SSG 烤死實習數） */}
        <RoleJobs roleId={id} />

        {/* Bottom CTAs */}
        <section className={styles.section}>
          <div className={styles.ctaRow}>
            <Link href="/quiz/ability" className={styles.ctaPrimary}>
              測你的準備度
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 10h10M11 6l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/onboarding" className={styles.ctaSecondary}>
              設為目標開始闖關
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
