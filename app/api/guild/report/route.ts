import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  let body: { postId?: string; deviceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { postId, deviceId } = body;
  if (!postId || !deviceId) {
    return NextResponse.json({ error: 'postId 與 deviceId 為必填' }, { status: 400 });
  }

  try {
    await initDb();
    const pool = getPool();

    // 同裝置對同貼文只能舉報一次
    const existing = await pool.query(
      'SELECT 1 FROM guild_reports WHERE post_id=$1 AND device_id=$2',
      [postId, deviceId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: '你已舉報過這則貼文' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO guild_reports (post_id, device_id) VALUES ($1, $2)',
      [postId, deviceId]
    );

    // 更新貼文的 report_count，>=3 自動 hidden
    const updateRes = await pool.query(
      `UPDATE guild_posts
       SET report_count = report_count + 1,
           hidden = CASE WHEN report_count + 1 >= 3 THEN true ELSE hidden END
       WHERE id=$1
       RETURNING report_count, hidden`,
      [postId]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ error: '找不到貼文' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, hidden: updateRes.rows[0].hidden });
  } catch (err) {
    console.error('[guild/report]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
