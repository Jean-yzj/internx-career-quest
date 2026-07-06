'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import { GUILD_DEFS } from '@/lib/guilds';
import { award } from '@/lib/quest-store';

interface Post {
  id: string;
  guild_id: string;
  device_id: string;
  nickname: string;
  content: string;
  official: boolean;
  hidden: boolean;
  report_count: number;
  created_at: string;
  replies?: Post[];
}

const SENSITIVE_NICKNAME_WORDS = ['官方', '藍藍', 'admin', 'Admin', 'ADMIN'];

function getDeviceId(): string {
  let id = localStorage.getItem('guild.deviceId');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('guild.deviceId', id);
  }
  return id;
}

function getNickname(): string | null {
  return localStorage.getItem('guild.nickname');
}

function setNickname(nick: string): void {
  localStorage.setItem('guild.nickname', nick);
}

function getJoined(): string[] {
  try { return JSON.parse(localStorage.getItem('guild.joined') ?? '[]'); } catch { return []; }
}

function setJoined(ids: string[]): void {
  localStorage.setItem('guild.joined', JSON.stringify(ids));
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return '剛剛';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function GuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = String(params.id);
  const guild = GUILD_DEFS.find((g) => g.id === guildId);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [deviceId, setDeviceId] = useState('');
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Nickname modal
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSubmitting, setNicknameSubmitting] = useState(false);

  // Post composer
  const [postContent, setPostContent] = useState('');
  const [postError, setPostError] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Rules accordion
  const [rulesOpen, setRulesOpen] = useState(false);

  // Reported posts (local tracking to show inline feedback)
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());

  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!guild) { router.push('/guilds'); return; }
    const did = getDeviceId();
    setDeviceId(did);
    const nick = getNickname();
    setNicknameState(nick);
    const joined = getJoined();
    setIsJoined(joined.includes(guildId));
    fetchFeed(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  useEffect(() => {
    if (replyingTo && replyRef.current) {
      replyRef.current.focus();
    }
  }, [replyingTo]);

  async function fetchFeed(cursor: string | null, reset: boolean) {
    setLoading(true);
    try {
      const url = `/api/guild/feed?guild=${guildId}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const r = await fetch(url);
      if (r.status === 503) { setAvailable(false); return; }
      setAvailable(true);
      const data = await r.json();
      if (reset) {
        setPosts(data.posts ?? []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      }
      setMemberCount(data.memberCount ?? 0);
      setPostCount(data.postCount ?? 0);
      setNextCursor(data.nextCursor ?? null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  function ensureNicknameAndJoined(action: () => void) {
    const nick = getNickname();
    if (!nick) {
      setShowNicknameModal(true);
      // Store pending action type
      (window as { _guildPendingAction?: () => void })._guildPendingAction = action;
      return;
    }
    action();
  }

  async function handleNicknameSubmit() {
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      setNicknameError('暱稱需 2–12 字');
      return;
    }
    if (SENSITIVE_NICKNAME_WORDS.some((w) => trimmed.includes(w))) {
      setNicknameError('暱稱不可包含「官方」、「藍藍」、「admin」等詞彙');
      return;
    }
    setNicknameSubmitting(true);
    setNicknameError('');

    // Join this guild
    try {
      const r = await fetch('/api/guild/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ guildId, deviceId, nickname: trimmed }),
      });
      const data = await r.json();
      if (!r.ok) {
        setNicknameError(data.error ?? '設定失敗，請再試');
        setNicknameSubmitting(false);
        return;
      }
      setNickname(trimmed);
      setNicknameState(trimmed);
      const joined = getJoined();
      if (!joined.includes(guildId)) {
        const next = [...joined, guildId];
        setJoined(next);
        setIsJoined(true);
      }
      setMemberCount(data.memberCount ?? memberCount);
      setShowNicknameModal(false);
      setNicknameInput('');

      // Award join_guild task (one-time)
      award('join_guild', 20, '加入公會', true);

      // Execute pending action
      const pending = (window as { _guildPendingAction?: () => void })._guildPendingAction;
      if (pending) {
        (window as { _guildPendingAction?: () => void })._guildPendingAction = undefined;
        pending();
      }
    } catch {
      setNicknameError('網路錯誤，請再試');
    } finally {
      setNicknameSubmitting(false);
    }
  }

  async function handleJoinOnly() {
    const nick = getNickname();
    if (!nick) {
      setShowNicknameModal(true);
      return;
    }
    try {
      const r = await fetch('/api/guild/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ guildId, deviceId, nickname: nick }),
      });
      const data = await r.json();
      if (r.ok) {
        const joined = getJoined();
        if (!joined.includes(guildId)) {
          const next = [...joined, guildId];
          setJoined(next);
          setIsJoined(true);
        }
        setMemberCount(data.memberCount ?? memberCount);
        award('join_guild', 20, '加入公會', true);
      }
    } catch { /* ignore */ }
  }

  async function handlePost() {
    const nick = getNickname();
    if (!nick) {
      setShowNicknameModal(true);
      return;
    }
    if (!postContent.trim()) {
      setPostError('請輸入內容');
      return;
    }
    setPostSubmitting(true);
    setPostError('');
    try {
      const r = await fetch('/api/guild/post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ guildId, deviceId, nickname: nick, content: postContent.trim() }),
      });
      const data = await r.json();
      if (!r.ok) {
        setPostError(data.error ?? '發文失敗');
        setPostSubmitting(false);
        return;
      }
      setPostContent('');
      // Award guild_intro (first post, one-time) and 社群破冰 badge
      award('guild_intro', 30, '公會首貼自我介紹', true);
      await fetchFeed(null, true);
    } catch {
      setPostError('網路錯誤，請再試');
    } finally {
      setPostSubmitting(false);
    }
  }

  async function handleReply(replyToId: string) {
    const nick = getNickname();
    if (!nick) {
      setShowNicknameModal(true);
      return;
    }
    if (!replyContent.trim()) {
      setReplyError('請輸入內容');
      return;
    }
    setReplySubmitting(true);
    setReplyError('');
    try {
      const r = await fetch('/api/guild/post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ guildId, deviceId, nickname: nick, content: replyContent.trim(), replyTo: replyToId }),
      });
      const data = await r.json();
      if (!r.ok) {
        setReplyError(data.error ?? '回覆失敗');
        setReplySubmitting(false);
        return;
      }
      setReplyContent('');
      setReplyingTo(null);
      // Award help_newbie (weekly 2)
      award('help_newbie', 20, '公會內回覆他人');
      await fetchFeed(null, true);
    } catch {
      setReplyError('網路錯誤，請再試');
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleReport(postId: string) {
    if (reportedPosts.has(postId)) return;
    try {
      const r = await fetch('/api/guild/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ postId, deviceId }),
      });
      if (r.ok) {
        setReportedPosts((prev) => new Set([...prev, postId]));
        const data = await r.json();
        if (data.hidden) {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      }
    } catch { /* ignore */ }
  }

  if (!guild) return null;

  if (available === false) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/guilds" />
        <main className="site-main" id="main-content">
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ margin: '0 auto 16px', display: 'inline-block' }}><Mascot size={64} variant="think" className="mascot-idle" /></div>
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>公會整修中</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginTop: 8 }}>先去做今天的任務</p>
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

        {/* Guild header */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 56, height: 56, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: guild.badge }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>{guild.name}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: 8 }}>{guild.tagline}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink)', marginBottom: 6 }}>{guild.intro1}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>{guild.intro2}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {memberCount >= 10 && <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{memberCount} 成員</span>}
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{postCount} 則討論</span>
              {!isJoined && (
                <button type="button" className="btn-game-teal" style={{ padding: '8px 18px', fontSize: '0.875rem' }} onClick={handleJoinOnly}>
                  加入公會
                </button>
              )}
              {isJoined && <span style={{ fontSize: '0.8125rem', color: 'var(--ok)', fontWeight: 600 }}>已加入</span>}
            </div>
          </div>
        </div>

        {/* Rules accordion */}
        <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setRulesOpen((v) => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}
            aria-expanded={rulesOpen}
          >
            版規
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: rulesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {rulesOpen && (
            <div style={{ padding: '0 16px 14px', fontSize: '0.875rem', color: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p>1. 互相尊重，不攻擊他人。</p>
              <p>2. 不在公開版面留個人聯絡方式（手機號、LINE 等）。</p>
              <p>3. 廣告或業配內容請舉報。</p>
              <p>4. 本公會內容對所有人公開，請謹慎分享個人資訊。</p>
            </div>
          )}
        </div>

        {/* Post composer */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 10 }}>發表討論</h2>
          <textarea
            rows={3}
            placeholder={isJoined ? '說說你的想法...' : '加入公會後即可發文'}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            maxLength={500}
            className="field-guild-post"
            style={{ width: '100%', resize: 'vertical', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '1rem', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', transition: 'border-color .12s, box-shadow .12s' }}
            onFocus={() => {
              if (!getNickname()) {
                setShowNicknameModal(true);
              }
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{postContent.length}/500</span>
            {postError && <span style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}>{postError}</span>}
            <button
              type="button"
              className="btn-game-teal"
              style={{ padding: '7px 16px', fontSize: '0.875rem' }}
              onClick={() => ensureNicknameAndJoined(handlePost)}
              disabled={postSubmitting}
            >
              {postSubmitting ? '發文中...' : '發文'}
            </button>
          </div>
        </div>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-2)', fontSize: '0.875rem' }}>載入中...</div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentDeviceId={deviceId}
              isReplying={replyingTo === post.id}
              replyContent={replyContent}
              replyError={replyError}
              replySubmitting={replySubmitting}
              reported={reportedPosts.has(post.id)}
              onStartReply={() => {
                setReplyingTo(post.id);
                setReplyContent('');
                setReplyError('');
              }}
              onCancelReply={() => setReplyingTo(null)}
              onReplyChange={setReplyContent}
              onReplySubmit={() => handleReply(post.id)}
              onReport={() => handleReport(post.id)}
            />
          ))}
          {nextCursor && (
            <button
              type="button"
              onClick={() => fetchFeed(nextCursor, false)}
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid var(--line)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--brand)', cursor: 'pointer' }}
            >
              {loading ? '載入中...' : '載入更多'}
            </button>
          )}
          {!loading && posts.length === 0 && available && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-2)', fontSize: '0.875rem' }}>目前還沒有討論，來發第一則吧</div>
          )}
        </div>
      </main>
      <Footer />

      {/* Nickname modal */}
      {showNicknameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 6 }}>設定公會暱稱</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 16 }}>暱稱在公會公開顯示，2–12 字，請避免含「官方」「藍藍」「admin」等詞彙</p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              maxLength={12}
              placeholder="你的暱稱"
              style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', fontSize: '1rem', fontFamily: 'inherit', color: 'var(--ink)', outline: 'none', marginBottom: 8 }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNicknameSubmit(); }}
              autoFocus
            />
            {nicknameError && <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', marginBottom: 8 }}>{nicknameError}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowNicknameModal(false); setNicknameInput(''); setNicknameError(''); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>取消</button>
              <button type="button" className="btn-primary" style={{ padding: '8px 16px' }} onClick={handleNicknameSubmit} disabled={nicknameSubmitting}>
                {nicknameSubmitting ? '設定中...' : '加入公會'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post, currentDeviceId, isReplying, replyContent, replyError, replySubmitting, reported,
  onStartReply, onCancelReply, onReplyChange, onReplySubmit, onReport,
}: {
  post: Post;
  currentDeviceId: string;
  isReplying: boolean;
  replyContent: string;
  replyError: string;
  replySubmitting: boolean;
  reported: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
  onReport: () => void;
}) {
  const isOfficial = post.official;
  const isOwn = post.device_id === currentDeviceId;

  // Official posts rendered as bubble with mascot
  if (isOfficial) {
    return (
      <div className="guild-bubble-post">
        <div className="guild-bubble-avatar">
          <Mascot size={28} variant="happy" />
        </div>
        <div className="guild-bubble-content">
          <div className="guild-bubble-name">
            藍藍教練
            <span style={{ marginLeft: 8, fontSize: '0.6875rem', background: 'var(--brand)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontWeight: 700 }}>官方</span>
            <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--ink-2)', fontWeight: 400 }}>{formatTime(post.created_at)}</span>
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      {/* Post header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--sky-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1.5px solid var(--line)',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="5.5" r="2.5" stroke="var(--brand)" strokeWidth="1.5"/>
            <path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{post.nickname}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{formatTime(post.created_at)}</span>
      </div>

      {/* Content */}
      <p style={{ fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
        {!isOfficial && (
          <button type="button" onClick={onStartReply} style={{ fontSize: '0.8125rem', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            回覆
          </button>
        )}
        {!isOwn && !isOfficial && (
          <button
            type="button"
            onClick={onReport}
            disabled={reported}
            style={{ fontSize: '0.8125rem', color: reported ? 'var(--ink-2)' : 'var(--danger)', background: 'none', border: 'none', cursor: reported ? 'default' : 'pointer', padding: 0, marginLeft: 'auto' }}
          >
            {reported ? '已舉報' : '檢舉'}
          </button>
        )}
      </div>

      {/* Reply box */}
      {isReplying && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <textarea
            rows={2}
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            maxLength={300}
            placeholder="輸入回覆..."
            style={{ width: '100%', resize: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: '0.9375rem', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{replyContent.length}/300</span>
            {replyError && <span style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}>{replyError}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onCancelReply} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}>取消</button>
              <button type="button" className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.8125rem' }} onClick={onReplySubmit} disabled={replySubmitting}>
                {replySubmitting ? '傳送中' : '傳送'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {post.replies && post.replies.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {post.replies.map((reply) => (
            <div key={reply.id} style={{ paddingLeft: 14, borderLeft: '2px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>{reply.nickname}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{formatTime(reply.created_at)}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
