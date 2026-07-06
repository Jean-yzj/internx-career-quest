'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import { GUILD_DEFS, type GuildDef } from '@/lib/guilds';

const DB_UNAVAILABLE_MSG = '公會整修中，先去做今天的任務';

interface GuildStats {
  memberCount: number;
  postCount: number;
  last24hCount: number;
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

    // 檢查可用性 + 取得各公會 24h 訊息統計
    const fetchStats = async () => {
      try {
        const pmRes = await fetch('/api/guild/feed?guild=pm&limit=1');
        if (pmRes.status === 503) { setAvailable(false); return; }
        setAvailable(true);
        // 批次取得各公會 last24hCount
        const allIds = GUILD_DEFS.map((g) => g.id);
        const results = await Promise.allSettled(
          allIds.map((id) => fetch(`/api/guild/feed?guild=${id}&limit=1`).then((r) => r.json()))
        );
        const newStats: Record<string, GuildStats> = {};
        allIds.forEach((id, i) => {
          const r = results[i];
          if (r.status === 'fulfilled') {
            newStats[id] = {
              memberCount: r.value.memberCount ?? 0,
              postCount: r.value.postCount ?? 0,
              last24hCount: r.value.last24hCount ?? 0,
            };
          }
        });
        setStats(newStats);
      } catch { setAvailable(false); }
    };
    fetchStats();
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
            <div style={{ margin: '0 auto 16px', display: 'inline-block' }}><Mascot size={64} variant="think" className="mascot-idle" /></div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>公會整修中</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginTop: 8 }}>{DB_UNAVAILABLE_MSG}</p>
            <a href="/island" className="btn-game" style={{ display: 'inline-flex', marginTop: 20 }}>回到闖關島</a>
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
  const last24hCount = stats?.last24hCount ?? 0;

  return (
    <a href={`/guilds/${guild.id}`} className="zone-card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textDecoration: 'none', color: 'inherit' }}>
      {/* badge with medal ring */}
      <div style={{
        width: 50, height: 50, flexShrink: 0, borderRadius: '50%',
        border: `3px solid ${guild.accentColor}`,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', boxShadow: `0 3px 8px ${guild.accentColor}33`,
      }}>
        <div style={{ width: 40, height: 40 }} dangerouslySetInnerHTML={{ __html: guild.badge }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{guild.name}</span>
          {isJoined && (
            <span style={{ fontSize: '0.75rem', background: 'var(--teal)', color: '#fff', borderRadius: 10, padding: '2px 9px', fontWeight: 700 }}>已加入</span>
          )}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guild.tagline}</p>
        {last24hCount > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--brand)', marginTop: 3 }}>24 小時 {last24hCount} 則訊息</p>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {memberCount >= 10 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginBottom: 2 }}>{memberCount} 人</div>
        )}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--ink-2)' }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </a>
  );
}
