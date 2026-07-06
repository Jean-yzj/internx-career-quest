import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

export async function GET(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const { searchParams } = req.nextUrl;
  const guildId = searchParams.get('guild');
  const after = searchParams.get('after'); // ISO timestamp for polling new messages
  const cursor = searchParams.get('cursor'); // legacy cursor pagination (kept for backward compat)
  const limitParam = searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 100);

  if (!guildId) {
    return NextResponse.json({ error: 'guild is required' }, { status: 400 });
  }

  try {
    await initDb();
    const pool = getPool();

    // Count members
    const memberRes = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM guild_members WHERE guild_id=$1',
      [guildId]
    );
    const memberCount = memberRes.rows[0].cnt;

    // Count posts in last 24 hours (for lobby display)
    const last24hRes = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM guild_posts
       WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL
         AND created_at > NOW() - INTERVAL '24 hours'`,
      [guildId]
    );
    const last24hCount = last24hRes.rows[0].cnt;

    // Count total non-hidden main posts
    const postCountRes = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM guild_posts WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL',
      [guildId]
    );
    const postCount = postCountRes.rows[0].cnt;

    let posts: Array<Record<string, unknown>> = [];
    let nextCursor: string | null = null;

    if (after) {
      // Polling mode: return posts created_at > after, ascending order, up to limit
      const res = await pool.query(
        `SELECT id, guild_id, device_id, nickname, content, official, hidden, report_count, created_at, reply_to
         FROM guild_posts
         WHERE guild_id=$1 AND hidden=false AND created_at > $2
         ORDER BY created_at ASC
         LIMIT $3`,
        [guildId, after, limit]
      );
      posts = res.rows;
    } else if (cursor) {
      // Legacy cursor pagination (backward compat): older posts before cursor
      const res = await pool.query(
        `SELECT id, guild_id, device_id, nickname, content, official, hidden, report_count, created_at, reply_to
         FROM guild_posts
         WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL AND created_at < $2
         ORDER BY official DESC, created_at DESC
         LIMIT 20`,
        [guildId, cursor]
      );
      posts = res.rows;
      if (posts.length === 20) {
        nextCursor = String(posts[posts.length - 1].created_at);
      }
    } else {
      // Initial load: most recent N posts (main posts only), return ascending for chat display
      const res = await pool.query(
        `SELECT id, guild_id, device_id, nickname, content, official, hidden, report_count, created_at, reply_to
         FROM guild_posts
         WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL
         ORDER BY created_at DESC
         LIMIT $2`,
        [guildId, limit]
      );
      // Reverse to ascending order (oldest first for chat)
      posts = res.rows.reverse();
    }

    // For initial load and legacy: attach replies
    if (!after) {
      const mainIds = posts.map((r) => r.id).filter(Boolean);
      let replies: Array<Record<string, unknown>> = [];
      if (mainIds.length > 0) {
        const replyRes = await pool.query(
          `SELECT id, guild_id, device_id, nickname, content, reply_to, created_at
           FROM guild_posts
           WHERE reply_to = ANY($1::uuid[]) AND hidden=false
           ORDER BY created_at ASC`,
          [mainIds]
        );
        replies = replyRes.rows;
      }
      const replyMap: Record<string, typeof replies> = {};
      for (const r of replies) {
        const pid = String(r.reply_to);
        if (!replyMap[pid]) replyMap[pid] = [];
        replyMap[pid].push(r);
      }
      posts = posts.map((p) => ({ ...p, replies: replyMap[String(p.id)] ?? [] }));
    }

    return NextResponse.json({ posts, memberCount, postCount, nextCursor, last24hCount });
  } catch (err) {
    console.error('[guild/feed]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
