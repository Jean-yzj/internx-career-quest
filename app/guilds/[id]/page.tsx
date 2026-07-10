'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import Mascot from '@/components/Mascot';
import { GUILD_DEFS } from '@/lib/guilds';
import { award } from '@/lib/quest-store';
import styles from './guild-chat.module.css';

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
  reply_to?: string | null;
  // populated client-side for initial load
  replies?: Post[];
  // local-only fields
  _optimistic?: boolean;
  _failed?: boolean;
  _replyToContent?: string; // resolved content of parent
  _replyToNickname?: string;
}

const SENSITIVE_NICKNAME_WORDS = ['官方', '藍藍', 'admin', 'Admin', 'ADMIN'];
const POLL_INTERVAL_MS = 5000;
const REPLY_TRUNCATE = 30;

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

function setNicknameLocal(nick: string): void {
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
  if (diff < 3600) return `${Math.floor(diff / 60)} 分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function truncate(s: string, len: number): string {
  if (!s) return '';
  return s.length > len ? s.slice(0, len) + '…' : s;
}

// Flatten nested posts from initial load into a flat list with reply metadata resolved
function flattenPosts(posts: Post[]): Post[] {
  const all: Post[] = [];
  const contentMap: Record<string, { content: string; nickname: string }> = {};
  for (const p of posts) {
    contentMap[p.id] = { content: p.content, nickname: p.nickname };
  }
  for (const p of posts) {
    all.push(p);
    if (p.replies) {
      for (const r of p.replies) {
        contentMap[r.id] = { content: r.content, nickname: r.nickname };
        all.push({ ...r, _replyToContent: contentMap[String(r.reply_to)]?.content, _replyToNickname: contentMap[String(r.reply_to)]?.nickname });
      }
    }
  }
  // sort ascending by created_at
  all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return all;
}

// Merge server-confirmed posts into the current list.
// - drop optimistic entries that this batch confirms (match by device+content+reply),
//   since the optimistic id (opt-xxx) never equals the real UUID
// - de-dupe real posts by id (incoming wins) so repeated/racing polls never duplicate
// - keep ascending created_at order
function optimisticKey(p: Post): string {
  return `${p.device_id}|${p.content}|${p.reply_to ?? ''}`;
}
function mergePosts(prev: Post[], incoming: Post[]): Post[] {
  const confirmedKeys = new Set(incoming.map(optimisticKey));
  const byId = new Map<string, Post>();
  for (const p of prev) {
    if (p._optimistic && confirmedKeys.has(optimisticKey(p))) continue; // replaced by the real post
    byId.set(p.id, p);
  }
  for (const p of incoming) byId.set(p.id, p); // real post wins over any stale copy
  return [...byId.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export default function GuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = String(params.id);
  const guild = GUILD_DEFS.find((g) => g.id === guildId);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [deviceId, setDeviceId] = useState('');
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Nickname modal
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSubmitting, setNicknameSubmitting] = useState(false);

  // Chat input
  const [inputContent, setInputContent] = useState('');
  const [inputSubmitting, setInputSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const isComposingRef = useRef(false);

  // Context menu
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reported posts
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());

  // Refs
  const feedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestCreatedAt = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // post content map for reply preview resolution
  const postContentMapRef = useRef<Record<string, { content: string; nickname: string }>>({});

  // auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = false) => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Load initial feed
  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/guild/feed?guild=${guildId}&limit=50`);
      if (r.status === 503) { setAvailable(false); return; }
      setAvailable(true);
      const data = await r.json();
      const flat = flattenPosts(data.posts ?? []);
      // update content map
      for (const p of flat) {
        postContentMapRef.current[p.id] = { content: p.content, nickname: p.nickname };
      }
      setPosts(flat);
      setMemberCount(data.memberCount ?? 0);
      if (flat.length > 0) {
        latestCreatedAt.current = flat[flat.length - 1].created_at;
      }
      setInitialLoaded(true);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [guildId]);

  // Poll for new messages
  const pollFeed = useCallback(async () => {
    if (document.hidden) return;
    if (!latestCreatedAt.current) return;
    try {
      const after = encodeURIComponent(latestCreatedAt.current);
      const r = await fetch(`/api/guild/feed?guild=${guildId}&after=${after}&limit=50`);
      if (!r.ok) return;
      const data = await r.json();
      const newPosts: Post[] = (data.posts ?? []).filter((p: Post) => !p.hidden);
      if (newPosts.length > 0) {
        // resolve reply content from map
        const enriched = newPosts.map((p) => {
          postContentMapRef.current[p.id] = { content: p.content, nickname: p.nickname };
          if (p.reply_to) {
            const parent = postContentMapRef.current[String(p.reply_to)];
            return { ...p, _replyToContent: parent?.content, _replyToNickname: parent?.nickname };
          }
          return p;
        });
        setPosts((prev) => mergePosts(prev, enriched));
        // advance cursor to the newest created_at we've seen (never move backwards)
        latestCreatedAt.current = enriched.reduce(
          (m, p) => (new Date(p.created_at).getTime() > new Date(m).getTime() ? p.created_at : m),
          latestCreatedAt.current ?? enriched[0].created_at,
        );
      }
    } catch { /* ignore */ }
  }, [guildId]);

  // Schedule next poll
  const schedulePoll = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(async () => {
      await pollFeed();
      schedulePoll();
    }, POLL_INTERVAL_MS);
  }, [pollFeed]);

  useEffect(() => {
    if (!guild) { router.push('/guilds'); return; }
    const did = getDeviceId();
    setDeviceId(did);
    const nick = getNickname();
    setNicknameState(nick);
    const joined = getJoined();
    setIsJoined(joined.includes(guildId));
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  // Start polling after initial load
  useEffect(() => {
    if (!initialLoaded) return;
    schedulePoll();
    const handleVisibility = () => {
      if (!document.hidden) {
        pollFeed().then(schedulePoll);
      } else {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [initialLoaded, schedulePoll, pollFeed]);

  // Auto-scroll when posts change (only if near bottom)
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || !initialLoaded) {
      scrollToBottom();
    }
  }, [posts, scrollToBottom, initialLoaded]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPostId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function ensureNicknameAndJoined(action: () => void) {
    const nick = getNickname();
    if (!nick) {
      pendingActionRef.current = action;
      setShowNicknameModal(true);
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
      setNicknameError('暱稱不可包含「官方」「藍藍」「admin」等詞彙');
      return;
    }
    setNicknameSubmitting(true);
    setNicknameError('');
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
      setNicknameLocal(trimmed);
      setNicknameState(trimmed);
      const joined = getJoined();
      if (!joined.includes(guildId)) {
        setJoined([...joined, guildId]);
        setIsJoined(true);
      }
      setMemberCount(data.memberCount ?? memberCount);
      setShowNicknameModal(false);
      setNicknameInput('');
      award('join_guild', 20, '加入公會', true);
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      if (pending) pending();
    } catch {
      setNicknameError('網路錯誤，請再試');
    } finally {
      setNicknameSubmitting(false);
    }
  }

  async function handleJoinOnly() {
    const nick = getNickname();
    if (!nick) { setShowNicknameModal(true); return; }
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
          setJoined([...joined, guildId]);
          setIsJoined(true);
        }
        setMemberCount(data.memberCount ?? memberCount);
        award('join_guild', 20, '加入公會', true);
      }
    } catch { /* ignore */ }
  }

  async function handleSend() {
    const nick = getNickname();
    if (!nick) { ensureNicknameAndJoined(handleSend); return; }
    const content = inputContent.trim();
    if (!content) return;

    const optimisticId = `opt-${Date.now()}-${Math.random()}`;
    const optimisticPost: Post = {
      id: optimisticId,
      guild_id: guildId,
      device_id: deviceId,
      nickname: nick,
      content,
      official: false,
      hidden: false,
      report_count: 0,
      created_at: new Date().toISOString(),
      reply_to: replyingTo?.id ?? null,
      _optimistic: true,
      _replyToContent: replyingTo?.content,
      _replyToNickname: replyingTo?.nickname,
    };

    setPosts((prev) => [...prev, optimisticPost]);
    setInputContent('');
    const prevReplyingTo = replyingTo;
    setReplyingTo(null);
    setInputSubmitting(true);

    try {
      const r = await fetch('/api/guild/post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          guildId,
          deviceId,
          nickname: nick,
          content,
          replyTo: prevReplyingTo?.id ?? undefined,
        }),
      });
      if (!r.ok) {
        // Mark optimistic as failed
        setPosts((prev) => prev.map((p) => p.id === optimisticId ? { ...p, _failed: true, _optimistic: false } : p));
        return;
      }
      // Server confirmed; the next poll will pick up the real post.
      // Remove optimistic entry preemptively (poll will add real one).
      // We keep it for now — poll will dedupe or replace.
      award('guild_intro', 30, '公會首貼自我介紹', true);
    } catch {
      setPosts((prev) => prev.map((p) => p.id === optimisticId ? { ...p, _failed: true, _optimistic: false } : p));
    } finally {
      setInputSubmitting(false);
    }
  }

  async function handleRetry(post: Post) {
    const nick = getNickname();
    if (!nick) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setInputContent(post.content);
    if (post.reply_to) {
      const parent = postContentMapRef.current[post.reply_to];
      if (parent) setReplyingTo({ ...post, id: post.reply_to, content: parent.content, nickname: parent.nickname });
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

  function handleBubbleTap(post: Post) {
    if (post._failed || post._optimistic || post.official) return;
    setMenuPostId((prev) => (prev === post.id ? null : post.id));
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
      </div>
    );
  }

  return (
    <div className="site-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <SiteNav activePath="/guilds" />

      <div className={styles.chatLayout}>
        {/* Chat header */}
        <div className={styles.chatHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/guilds" style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }} aria-label="返回公會大廳">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: `2px solid ${guild.accentColor}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: 28, height: 28 }} dangerouslySetInnerHTML={{ __html: guild.badge }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guild.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>
                {memberCount >= 10 ? `${memberCount} 成員` : guild.tagline}
                {!isJoined && (
                  <button type="button" onClick={handleJoinOnly} style={{ marginLeft: 10, fontSize: '0.75rem', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>加入公會</button>
                )}
                {isJoined && <span style={{ marginLeft: 10, fontSize: '0.75rem', color: 'var(--ok, #52c41a)', fontWeight: 600 }}>已加入</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className={styles.chatFeed} ref={feedRef}>
          {loading && posts.length === 0 && (
            <div className={styles.feedEmpty}>載入中...</div>
          )}
          {!loading && posts.length === 0 && available && (
            <div className={styles.feedEmpty}>目前還沒有訊息，來發第一則吧</div>
          )}

          {posts.map((post) => (
            <MessageBubble
              key={post.id}
              post={post}
              currentDeviceId={deviceId}
              menuOpen={menuPostId === post.id}
              menuRef={menuRef}
              reported={reportedPosts.has(post.id)}
              onTap={() => handleBubbleTap(post)}
              onQuote={() => { setReplyingTo(post); setMenuPostId(null); textareaRef.current?.focus(); }}
              onReport={() => { handleReport(post.id); setMenuPostId(null); }}
              onRetry={() => handleRetry(post)}
            />
          ))}
        </div>

        {/* Input area */}
        <div className={styles.chatInputArea}>
          {replyingTo && (
            <div className={styles.replyBanner}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--brand)' }}>
                <path d="M2 7V4a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.replyBannerText}>
                回覆 {replyingTo.nickname}：{truncate(replyingTo.content, 24)}
              </span>
              <button type="button" className={styles.replyBannerClose} onClick={() => setReplyingTo(null)} aria-label="取消引用">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
          <div className={styles.inputRow}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                // auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={() => { isComposingRef.current = false; }}
              onKeyDown={(e) => {
                // Enter alone: do NOT submit (chat norm: Enter = new line; send button only)
                // But Shift+Enter always fine
                // This is intentional — button-only submit
                if (e.key === 'Enter' && !e.shiftKey) {
                  // no-op (allow newline via Enter)
                }
              }}
              placeholder={isJoined ? '傳訊息...' : '加入公會後即可傳訊息'}
              disabled={inputSubmitting}
              maxLength={500}
              className={`${styles.chatTextarea} ${!isJoined ? styles.chatTextareaLocked : ''}`}
              onFocus={() => {
                if (!getNickname()) {
                  setShowNicknameModal(true);
                }
              }}
              style={{ height: '40px' }}
            />
            <button
              type="button"
              className={styles.sendBtn}
              disabled={inputSubmitting || !inputContent.trim() || isComposingRef.current}
              onClick={() => ensureNicknameAndJoined(handleSend)}
              aria-label="傳送"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 9l14-6-6 14-2-6-6-2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

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
              style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', fontSize: '1rem', fontFamily: 'inherit', color: 'var(--ink)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
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

function MessageBubble({
  post,
  currentDeviceId,
  menuOpen,
  menuRef,
  reported,
  onTap,
  onQuote,
  onReport,
  onRetry,
}: {
  post: Post;
  currentDeviceId: string;
  menuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  reported: boolean;
  onTap: () => void;
  onQuote: () => void;
  onReport: () => void;
  onRetry: () => void;
}) {
  const isOwn = post.device_id === currentDeviceId;
  const isOfficial = post.official;
  const isFailed = post._failed;

  // Official message: left-aligned mascot bubble
  if (isOfficial) {
    return (
      <div className={`${styles.officialRow} guild-bubble-post`}>
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
    <div className={`${styles.msgRow} ${isOwn ? styles.msgRowOwn : ''}`}>
      {/* Avatar — only for others */}
      {!isOwn && (
        <div className={styles.msgAvatar} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke="var(--brand)" strokeWidth="1.5"/>
            <path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
        {/* Nickname + time */}
        <div className={`${styles.msgMeta} ${isOwn ? styles.msgMetaOwn : ''}`}>
          {!isOwn && <span className={styles.msgNickname}>{post.nickname}</span>}
          <span className={styles.msgTime}>{formatTime(post.created_at)}</span>
          {isFailed && <span style={{ fontSize: '0.6875rem', color: '#ff4d4f' }}>傳送失敗</span>}
        </div>

        {/* Bubble */}
        <div
          className={`${styles.msgBubble} ${isFailed ? styles.msgBubbleFailed : isOwn ? styles.msgBubbleOwn : styles.msgBubbleOther}`}
          onClick={onTap}
          onContextMenu={(e) => { e.preventDefault(); onTap(); }}
          role="button"
          tabIndex={0}
          aria-label={`${post.nickname}：${post.content}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTap(); }}
          style={{ position: 'relative' }}
        >
          {/* Reply preview */}
          {(post._replyToContent || post.reply_to) && (
            <div className={styles.replyPreview}>
              {post._replyToNickname && <strong>{post._replyToNickname}：</strong>}
              {truncate(post._replyToContent ?? '訊息', REPLY_TRUNCATE)}
            </div>
          )}

          <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{post.content}</span>

          {/* Context menu */}
          {menuOpen && (
            <div
              ref={menuRef}
              className={styles.msgMenu}
              style={{ [isOwn ? 'right' : 'left']: 0, top: 'calc(100% + 4px)' }}
            >
              <button type="button" className={styles.msgMenuBtn} onClick={(e) => { e.stopPropagation(); onQuote(); }}>
                引用
              </button>
              {!isOwn && (
                <button
                  type="button"
                  className={`${styles.msgMenuBtn} ${styles.msgMenuBtnDanger}`}
                  onClick={(e) => { e.stopPropagation(); onReport(); }}
                  disabled={reported}
                >
                  {reported ? '已檢舉' : '檢舉'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Failed: retry */}
        {isFailed && (
          <button
            type="button"
            onClick={onRetry}
            style={{ fontSize: '0.75rem', color: '#ff4d4f', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 2 }}
          >
            點此重送
          </button>
        )}
      </div>
    </div>
  );
}
