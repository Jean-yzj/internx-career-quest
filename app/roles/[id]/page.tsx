import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { ROLES, ROLE_IDS } from '@/lib/roles';
import { getRoleGuide, ROLE_PROOF_IDEAS } from '@/lib/role-guide';
import { GUILD_DEFS } from '@/lib/guilds';
import RoleJobs from '@/components/RoleJobs';
import PlanStarter from '@/components/PlanStarter';
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
  const proofIdeas = ROLE_PROOF_IDEAS[id] ?? [];
  const faqs = [
    {
      question: `${role.name}實習要先準備什麼？`,
      answer: guide.prepare.slice(0, 3).join('；'),
    },
    {
      question: `沒有相關實習經驗，也可以投 ${role.name} 嗎？`,
      answer: `可以先從課堂、社團、打工或個人專案累積證據。第一步可以這樣做：${guide.entryPath[0]}`,
    },
    {
      question: `${role.name}作品集可以放什麼？`,
      answer: proofIdeas.length > 0 ? proofIdeas.join('；') : guide.entryPath.slice(0, 2).join('；'),
    },
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/roles" />
      <main className={styles.detailPage}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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
        {proofIdeas.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>可以先做這些作品</h2>
            <ul className={styles.itemList}>
              {proofIdeas.map((item, i) => (
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>常見問題</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTAs */}
        <section className={styles.section}>
          <div className={styles.ctaRow}>
            <PlanStarter roleId={role.id} className={styles.ctaPrimary} />
            <Link href="/quiz/ability" className={styles.ctaSecondary}>
              測你的準備度
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
