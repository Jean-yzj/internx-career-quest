import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const adminKey = req.headers.get('x-admin-key');
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { op?: string; postId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { op, postId } = body;
  if (!op || !postId) {
    return NextResponse.json({ error: 'op 與 postId 為必填' }, { status: 400 });
  }

  if (!['hide', 'unhide', 'delete'].includes(op)) {
    return NextResponse.json({ error: 'op 必須是 hide | unhide | delete' }, { status: 400 });
  }

  try {
    await initDb();
    const pool = getPool();

    if (op === 'delete') {
      const res = await pool.query('DELETE FROM guild_posts WHERE id=$1 RETURNING id', [postId]);
      if (res.rowCount === 0) {
        return NextResponse.json({ error: '找不到貼文' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, deleted: true });
    }

    const hidden = op === 'hide';
    const res = await pool.query(
      'UPDATE guild_posts SET hidden=$1 WHERE id=$2 RETURNING id, hidden',
      [hidden, postId]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ error: '找不到貼文' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, hidden: res.rows[0].hidden });
  } catch (err) {
    console.error('[guild/admin]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
