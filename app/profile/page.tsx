'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Avatar from '@/components/Avatar';
import type { AvatarId } from '@/components/Avatar';
import Mascot from '@/components/Mascot';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { loadQuest } from '@/lib/quest-store';
import { getLevel, BADGES, LEVEL_NAMES } from '@/lib/quest-store';
import { getProfile, saveProfile, getOrCreateDeviceId, type Profile } from '@/lib/profile';
import { ROLES } from '@/lib/roles';
import styles from './profile.module.css';

type LeaderEntry = {
  rank: number; deviceId: string; nickname: string; avatarId: number;
  level: number; totalPoints: number;
};

function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#E8A800" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="6" fill="none" stroke="#E8A800" strokeWidth="1"/>
      <path d="M10 6l1.2 2.5h2.6l-2.1 1.6.8 2.6L10 11.3l-2.5 1.4.8-2.6L6.2 8.5h2.6Z" fill="#E8A800" opacity=".8"/>
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2c0 4-6 6-6 11a6 6 0 0012 0c0-3-2-5-2-8-1 2-3 3-4 4 0-3 0-5 0-7z" fill="#FF7A45"/>
      <path d="M10 9c0 2-2 3-2 5a2 2 0 004 0c0-1-.5-2-.5-3-.5 1-1 1.5-1.5 2 0-1.5 0-3 0-4z" fill="#FFC93C"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="2" stroke="var(--ink-2)" strokeWidth="1.5"/>
      <path d="M5 7V5a3 3 0 016 0v2" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className={styles.medal} style={{ background: '#FFD700', color: '#7A4F00', borderColor: '#E8A800' }}>1</span>
  );
  if (rank === 2) return (
    <span className={styles.medal} style={{ background: '#C0C0C0', color: '#4A4A4A', borderColor: '#999' }}>2</span>
  );
  if (rank === 3) return (
    <span className={styles.medal} style={{ background: '#CD7F32', color: '#fff', borderColor: '#A0522D' }}>3</span>
  );
  return <span className={styles.rankNum}>{rank}</span>;
}

const GRADE_LABELS: Record<string, string> = {
  y1: '大一', y2: '大二', y3: '大三', y4: '大四', grad: '碩士生', fresh: '應屆/已畢業',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questData, setQuestData] = useState<ReturnType<typeof loadQuest> | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [selfRank, setSelfRank] = useState<number | null>(null);
  const [selfPoints, setSelfPoints] = useState<number | null>(null);
  const [lbError, setLbError] = useState(false);
  const [editNickname, setEditNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameErr, setNicknameErr] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<string | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [showTransferCode, setShowTransferCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    const q = loadQuest();
    setQuestData(q);

    // Fetch leaderboard
    const deviceId = getOrCreateDeviceId();
    fetch(`/api/leaderboard?deviceId=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.top20) setLeaderboard(data.top20);
        if (data.selfRank !== null) setSelfRank(data.selfRank);
        if (data.selfPoints !== null) setSelfPoints(data.selfPoints);
      })
      .catch(() => setLbError(true));
  }, []);

  if (!questData) return null;

  const pts = questData.totalPoints;
  const { level, name: levelName, nextAt } = getLevel(pts);
  const thresholds = [0, 100, 300, 700, 1500, 3000, 6000];
  const levelBase = level > 1 ? thresholds[level - 1] : 0;
  const levelTop = nextAt ?? pts;
  const progressPct = nextAt ? ((pts - levelBase) / (levelTop - levelBase)) * 100 : 100;

  const earnedIds = new Set(questData.badges.map((b) => b.id));
  const ALL_BADGES = BADGES.map((b) => ({ id: b.id, name: b.name }));

  const recentLedger = [...questData.pointsLedger].reverse().slice(0, 20);

  async function saveNickname() {
    if (!profile) return;
    const v = nicknameInput.trim();
    if (v.length < 2 || v.length > 12) { setNicknameErr('暱稱需 2–12 字'); return; }
    setSavingNickname(true);
    setNicknameErr('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: profile.deviceId, nickname: v }),
      });
      const data = await res.json();
      if (!res.ok) { setNicknameErr(data.error || '更新失敗'); setSavingNickname(false); return; }
      const updated = { ...profile, nickname: v };
      saveProfile(updated);
      setProfile(updated);
      setEditNickname(false);
    } catch {
      setNicknameErr('網路錯誤');
    }
    setSavingNickname(false);
  }

  async function saveGoal() {
    if (!profile) return;
    setSavingGoal(true);
    try {
      await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: profile.deviceId, goalRoleId: goalInput }),
      });
      const updated = { ...profile, goalRoleId: goalInput };
      saveProfile(updated);
      setProfile(updated);
      setEditGoal(false);
    } catch { /* ignore */ }
    setSavingGoal(false);
  }

  function copyTransferCode() {
    if (!profile?.transferCode) return;
    navigator.clipboard?.writeText(profile.transferCode).catch(() => {});
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  const goalRole = profile?.goalRoleId ? ROLES.find((r) => r.id === profile.goalRoleId) : null;

  // Self is in top20?
  const selfInTop = profile ? leaderboard.some((e) => e.deviceId === profile.deviceId) : false;

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/profile" />
      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* 1. 角色卡 */}
          <div className={styles.charCard}>
            {profile ? (
              <Avatar avatarId={profile.avatarId as AvatarId} size={72} />
            ) : (
              <Mascot size={72} variant="happy" />
            )}
            <div className={styles.charInfo}>
              {editNickname ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    maxLength={12}
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    style={{ width: 160 }}
                    autoFocus
                  />
                  <button type="button" className="btn-small" onClick={saveNickname} disabled={savingNickname}>
                    {savingNickname ? '…' : '儲存'}
                  </button>
                  <button type="button" className="btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8125rem' }} onClick={() => setEditNickname(false)}>取消</button>
                  {nicknameErr && <span style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>{nicknameErr}</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={styles.nickname}>{profile?.nickname ?? '冒險者'}</span>
                  {profile && (
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ width: 28, height: 28 }}
                      onClick={() => { setNicknameInput(profile.nickname); setEditNickname(true); }}
                      aria-label="編輯暱稱"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <span className="level-badge" style={{ marginTop: 4 }}>Lv.{level} {levelName}</span>
              <div className="hud-xp-bar-wrap" style={{ marginTop: 8, width: '100%', maxWidth: 280 }}>
                <div className="hud-xp-bar-fill" style={{ width: `${Math.min(100, progressPct)}%` }} />
              </div>
              {nextAt && (
                <div className="hud-xp-label">
                  {pts} / {nextAt} XP
                </div>
              )}
            </div>
          </div>

          {/* 2. 三格統計 */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <CoinIcon size={20} />
              <span className={styles.statVal}>{pts}</span>
              <span className={styles.statLabel}>累積點數</span>
            </div>
            <div className={styles.statBox}>
              <FlameIcon />
              <span className={styles.statVal}>{questData.streak.days}</span>
              <span className={styles.statLabel}>連續天數</span>
            </div>
            <div className={styles.statBox}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <polygon points="10,2 12.5,7.5 18,8.5 14,12.5 15,18 10,15.5 5,18 6,12.5 2,8.5 7.5,7.5" fill="var(--sand-deep)"/>
              </svg>
              <span className={styles.statVal}>{questData.badges.length}</span>
              <span className={styles.statLabel}>徽章數</span>
            </div>
          </div>

          {/* 3. 排行榜 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 12H2v6h3v-6zM11 8H8v10h3V8zM17 4h-3v14h3V4z" fill="var(--sand-deep)" opacity=".8"/>
              </svg>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>榮譽榜</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginLeft: 'auto' }}>總榜 Top 20</span>
            </div>

            {lbError ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-2)' }}>
                連線中斷，請稍後重試
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-2)' }}>
                載入中…
              </div>
            ) : (
              <>
                {leaderboard.map((entry) => {
                  const isSelf = profile?.deviceId === entry.deviceId;
                  return (
                    <div
                      key={entry.deviceId}
                      className={`${styles.lbRow} ${isSelf ? styles.lbRowSelf : ''}`}
                    >
                      <div className={styles.lbRank}>
                        <RankMedal rank={entry.rank} />
                      </div>
                      <Avatar avatarId={entry.avatarId as AvatarId} size={28} />
                      <span className={styles.lbNickname}>{entry.nickname}{isSelf ? ' (你)' : ''}</span>
                      <span className="level-badge" style={{ fontSize: '0.6875rem', padding: '2px 6px' }}>Lv.{entry.level}</span>
                      <span className={styles.lbPoints}>
                        <CoinIcon size={12} />
                        {entry.totalPoints}
                      </span>
                    </div>
                  );
                })}

                {/* Self not in top 20 */}
                {selfRank !== null && selfRank > 20 && !selfInTop && (
                  <>
                    <div className={styles.lbDivider} />
                    <div className={`${styles.lbRow} ${styles.lbRowSelf}`}>
                      <div className={styles.lbRank}>
                        <span className={styles.rankNum}>{selfRank}</span>
                      </div>
                      {profile && <Avatar avatarId={profile.avatarId as AvatarId} size={28} />}
                      <span className={styles.lbNickname}>{profile?.nickname ?? '你'} (你)</span>
                      <span className={styles.lbPoints}>
                        <CoinIcon size={12} />
                        {selfPoints ?? pts}
                      </span>
                    </div>
                  </>
                )}

                <p className={styles.lbCaption}>榮譽榜——點數靠自律，刷分沒有獎品</p>
              </>
            )}
          </div>

          {/* 4. 徽章牆 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
              徽章（{questData.badges.length}/{ALL_BADGES.length}）
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {ALL_BADGES.map(({ id, name }) => {
                const earned = earnedIds.has(id);
                return (
                  <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      border: `3px solid ${earned ? 'var(--sand-deep)' : 'var(--line)'}`,
                      background: earned ? 'var(--sand-soft)' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      filter: earned ? 'none' : 'grayscale(1)',
                      opacity: earned ? 1 : 0.5,
                    }}>
                      {earned ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <polygon points="10,2 12.5,7.5 18,8.5 14,12.5 15,18 10,15.5 5,18 6,12.5 2,8.5 7.5,7.5" fill="var(--sand-deep)" strokeWidth="1" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <LockIcon />
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: earned ? 'var(--ink)' : 'var(--ink-2)', fontWeight: 600, textAlign: 'center' }}>
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. 點數明細 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>點數明細（最近 20 筆）</h2>
            {recentLedger.length === 0 ? (
              <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem' }}>還沒有紀錄，快去完成任務吧！</p>
            ) : (
              <div className={styles.ledger}>
                {recentLedger.map((e) => (
                  <div key={e.id} className={styles.ledgerRow}>
                    <span className={styles.ledgerReason}>{e.reason}</span>
                    <span className={styles.ledgerDelta}>+{e.delta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. 設定區 */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>設定</h2>

            {/* Grade display / link to re-onboard */}
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>年級</span>
              <span style={{ color: 'var(--ink)', fontSize: '0.9375rem' }}>
                {profile ? (GRADE_LABELS[profile.grade] ?? profile.grade) : '—'}
              </span>
            </div>

            {/* Goal role */}
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>目標職位</span>
              {editGoal ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`btn-small ${goalInput === r.id ? 'btn-primary' : ''}`}
                      style={goalInput === r.id ? { background: 'var(--brand)', color: '#fff', border: 'none' } : {}}
                      onClick={() => setGoalInput(r.id)}
                    >
                      {r.name}
                    </button>
                  ))}
                  <button type="button" className={`btn-small ${goalInput === null ? 'btn-primary' : ''}`}
                    style={goalInput === null ? { background: 'var(--brand)', color: '#fff', border: 'none' } : {}}
                    onClick={() => setGoalInput(null)}>探索中</button>
                  <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 4 }}>
                    <button type="button" className="btn-small" onClick={saveGoal} disabled={savingGoal}>
                      {savingGoal ? '…' : '儲存'}
                    </button>
                    <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8125rem' }} onClick={() => setEditGoal(false)}>取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <span style={{ flex: 1, color: 'var(--ink)', fontSize: '0.9375rem' }}>{goalRole?.name ?? '未設定'}</span>
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => { setGoalInput(profile?.goalRoleId ?? null); setEditGoal(true); }}
                  >
                    更改
                  </button>
                </>
              )}
            </div>

            {/* Google 帳號綁定（未設定 Google 環境變數時整列自動隱藏） */}
            <GoogleLoginButton rowClass={styles.settingRow} labelClass={styles.settingLabel} />

            {/* Transfer code */}
            {profile?.transferCode && profile.transferCode !== 'LOCAL-ONLY' && (
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>引繼碼</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  {showTransferCode ? (
                    <span style={{ fontFamily: 'monospace', fontSize: '1.0625rem', letterSpacing: '0.12em', color: 'var(--brand-ink)', fontWeight: 700 }}>
                      {profile.transferCode}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-2)', fontSize: '0.875rem' }}>••••••••</span>
                  )}
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => setShowTransferCode(!showTransferCode)}
                  >
                    {showTransferCode ? '隱藏' : '顯示'}
                  </button>
                  {showTransferCode && (
                    <button type="button" className="btn-small" onClick={copyTransferCode}>
                      {copied ? '已複製' : '複製'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Data deletion note */}
            <div className={styles.settingRow} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className={styles.settingLabel} style={{ color: 'var(--ink-2)' }}>資料刪除</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
                如需刪除帳號請聯絡&nbsp;
                <a href="mailto:internx.me@gmail.com" style={{ color: 'var(--brand-dark)' }}>internx.me@gmail.com</a>
                &nbsp;（見&nbsp;
                <Link href="/privacy" style={{ color: 'var(--brand-dark)' }}>隱私政策</Link>）
              </span>
            </div>
          </div>

          {/* No profile nudge */}
          {!profile && (
            <div className={styles.noProfileBanner}>
              <Mascot size={36} variant="think" />
              <div>
                <div style={{ fontWeight: 700 }}>還沒有冒險檔案</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>完成註冊解鎖排行榜與專屬關卡</div>
              </div>
              <Link href="/onboarding" className="btn-game" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                立即開始
              </Link>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
