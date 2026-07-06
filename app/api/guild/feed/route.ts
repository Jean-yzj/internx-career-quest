import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

export async function GET(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const { searchParams } = req.nextUrl;
  const guildId = searchParams.get('guild');
  const cursor = searchParams.get('cursor'); // created_at ISO string for pagination

  if (!guildId) {
    return NextResponse.json({ error: 'guild is required' }, { status: 400 });
  }

  try {
    await initDb();
    const pool = getPool();

    // Count members and total posts (non-hidden main posts)
    const [memberRes, postCountRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS cnt FROM guild_members WHERE guild_id=$1', [guildId]),
      pool.query('SELECT COUNT(*)::int AS cnt FROM guild_posts WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL', [guildId]),
    ]);
    const memberCount = memberRes.rows[0].cnt;
    const postCount = postCountRes.rows[0].cnt;

    // Fetch main posts (official first, then by created_at desc), 20 per page
    const cursorClause = cursor ? `AND p.created_at < $2` : '';
    const params: (string | number)[] = cursor ? [guildId, cursor] : [guildId];

    const mainPosts = await pool.query(
      `SELECT id, guild_id, device_id, nickname, content, official, hidden, report_count, created_at
       FROM guild_posts
       WHERE guild_id=$1 AND hidden=false AND reply_to IS NULL ${cursorClause}
       ORDER BY official DESC, created_at DESC
       LIMIT 20`,
      params
    );

    // Fetch one layer of replies for each main post
    const postIds = mainPosts.rows.map((r) => r.id);
    let replies: Array<Record<string, unknown>> = [];
    if (postIds.length > 0) {
      const replyRes = await pool.query(
        `SELECT id, guild_id, device_id, nickname, content, reply_to, created_at
         FROM guild_posts
         WHERE reply_to = ANY($1::uuid[]) AND hidden=false
         ORDER BY created_at ASC`,
        [postIds]
      );
      replies = replyRes.rows;
    }

    // Attach replies to their parent
    const replyMap: Record<string, typeof replies> = {};
    for (const r of replies) {
      const pid = String(r.reply_to);
      if (!replyMap[pid]) replyMap[pid] = [];
      replyMap[pid].push(r);
    }

    const posts = mainPosts.rows.map((p) => ({
      ...p,
      replies: replyMap[String(p.id)] ?? [],
    }));

    const nextCursor =
      posts.length === 20 ? posts[posts.length - 1].created_at : null;

    return NextResponse.json({ posts, memberCount, postCount, nextCursor });
  } catch (err) {
    console.error('[guild/feed]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
