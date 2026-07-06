'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import { GUILD_DEFS, type GuildDef } from '@/lib/guilds';

const DB_UNAVAILABLE_MSG = '公會整修中，先去做今天的任務';

interface GuildStats {
  memberCount: number;
  postCount: number;
}

export default function GuildsPage() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Record<string, GuildStats>>({});
  const [joined, setJoined] = useState<string[]>([]);
  const [targetRoleId, setTargetRoleId] = useState<string | null>(null);

  useEffect(() => {
    // 讀 localStorage
    try {
      const raw = localStorage.getItem('quest.v1');
      if (raw) {
        const data = JSON.parse(raw);
        setTargetRoleId(data.profile?.targetRoleId ?? null);
      }
      const joinedRaw = localStorage.getItem('guild.joined');
      if (joinedRaw) setJoined(JSON.parse(joinedRaw));
    } catch { /* ignore */ }

    // 檢查可用性
    fetch('/api/guild/feed?guild=pm')
      .then(async (r) => {
        if (r.status === 503) {
          setAvailable(false);
          return;
        }
        setAvailable(true);
        // 批次取得各公會簡要統計（只拿 pm 做可用性探測，其他按需拉）
      })
      .catch(() => setAvailable(false));
  }, []);

  // 取得推薦公會：目標職位對應 + explorer
  const recommended = GUILD_DEFS.filter((g) =>
    (targetRoleId && g.roleId === targetRoleId) || g.id === 'explorer'
  ).slice(0, 3);

  if (available === false) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/guilds" />
        <main className="site-main" id="main-content">
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }}>
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
              <path d="M24 14v10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>公會整修中</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginTop: 8 }}>{DB_UNAVAILABLE_MSG}</p>
            <a href="/island" className="btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>回到闖關島</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/guilds" />
      <main className="site-main" id="main-content">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>公會大廳</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: 20 }}>加入最多 3 個公會，與同職涯目標的夥伴討論</p>

        {/* 為你推薦 */}
        {recommended.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>為你推薦</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommended.map((g) => (
                <GuildCard key={g.id} guild={g} isJoined={joined.includes(g.id)} stats={stats[g.id]} />
              ))}
            </div>
          </div>
        )}

        {/* 全部公會 */}
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>全部公會</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GUILD_DEFS.map((g) => (
            <GuildCard key={g.id} guild={g} isJoined={joined.includes(g.id)} stats={stats[g.id]} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GuildCard({ guild, isJoined, stats }: { guild: GuildDef; isJoined: boolean; stats?: GuildStats }) {
  const memberCount = stats?.memberCount ?? 0;

  return (
    <a href={`/guilds/${guild.id}`} className="zone-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ width: 44, height: 44, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: guild.badge }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{guild.name}</span>
          {isJoined && (
            <span style={{ fontSize: '0.75rem', background: 'var(--brand)', color: '#fff', borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>已加入</span>
          )}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guild.tagline}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {memberCount >= 10 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{memberCount} 人</div>
        )}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--ink-2)', marginTop: 4 }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </a>
  );
}
