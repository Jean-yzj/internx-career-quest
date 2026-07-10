import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { ROLES } from '@/lib/roles';
import { ROLE_GUIDES } from '@/lib/role-guide';
import { RoleCount } from '@/components/RoleJobs';
import styles from './roles.module.css';

export const metadata: Metadata = {
  title: '職位圖鑑｜10 種職涯方向｜職涯闖關島',
  description: '了解產品經理、行銷企劃、軟體工程師等 10 種熱門實習方向：每天在做什麼、怎麼入行、要準備什麼。',
  alternates: {
    canonical: 'https://quest.lazybearlife.com/roles',
  },
  openGraph: {
    title: '職位圖鑑｜10 種職涯方向｜職涯闖關島',
    description: '了解 10 種實習方向，找到最適合你的職涯路徑。',
    url: 'https://quest.lazybearlife.com/roles',
  },
};

export default function RolesListPage() {
  return (
    <div className="site-wrapper">
      <SiteNav activePath="/roles" />
      <main className={styles.listPage}>
        <div className={styles.listHero}>
          <h1 className={styles.listTitle}>職位圖鑑</h1>
          <p className={styles.listSubtitle}>
            還不確定哪個方向適合你？看看每個職位「一天在做什麼」，再做決定不遲。
          </p>
          <Link href="/quiz/interest" className={styles.listCta}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#fff" strokeWidth="1.5"/>
              <path d="M10 7v3l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            不確定方向？先測驗
          </Link>
        </div>

        <div className={styles.rolesGrid}>
          {ROLES.map((role) => {
            const guide = ROLE_GUIDES.find((g) => g.roleId === role.id);
            return (
              <Link key={role.id} href={`/roles/${role.id}`} className={styles.roleCard}>
                <div className={styles.roleCardHeader}>
                  <span className={styles.roleShortBadge}>{role.shortName}</span>
                  <span className={styles.roleName}>{role.name}</span>
                </div>
                <p className={styles.roleTagline}>
                  {guide?.tagline ?? role.description}
                </p>
                <RoleCount roleId={role.id} />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
