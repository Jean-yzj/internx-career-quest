import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';
import { GUILD_DEFS } from '@/lib/guilds';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

const SENSITIVE_WORDS = ['色情', '賭博', 'fuck', 'shit', '幹', '操', '屌'];

function isValidNickname(nick: string): boolean {
  if (!nick || nick.length < 2 || nick.length > 12) return false;
  const forbidden = ['官方', '藍藍', 'admin', 'Admin', 'ADMIN'];
  if (forbidden.some((w) => nick.includes(w))) return false;
  if (SENSITIVE_WORDS.some((w) => nick.toLowerCase().includes(w.toLowerCase()))) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  let body: { guildId?: string; deviceId?: string; nickname?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { guildId, deviceId, nickname } = body;

  if (!guildId || !deviceId || !nickname) {
    return NextResponse.json({ error: 'guildId、deviceId 與 nickname 為必填' }, { status: 400 });
  }

  if (!GUILD_DEFS.find((g) => g.id === guildId)) {
    return NextResponse.json({ error: '公會不存在' }, { status: 400 });
  }

  if (!isValidNickname(nickname)) {
    return NextResponse.json(
      { error: '暱稱需 2–12 字，且不可包含「官方」、「藍藍」、「admin」等詞彙' },
      { status: 400 }
    );
  }

  try {
    await initDb();
    const pool = getPool();

    // 上限 3 個公會
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM guild_members WHERE device_id=$1',
      [deviceId]
    );
    if (countRes.rows[0].cnt >= 3) {
      return NextResponse.json({ error: '每位成員最多加入 3 個公會' }, { status: 400 });
    }

    // 加入（已加入則更新暱稱）
    await pool.query(
      `INSERT INTO guild_members (guild_id, device_id, nickname, joined_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (guild_id, device_id) DO UPDATE SET nickname=$3`,
      [guildId, deviceId, nickname]
    );

    const memberCountRes = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM guild_members WHERE guild_id=$1',
      [guildId]
    );

    return NextResponse.json({ ok: true, memberCount: memberCountRes.rows[0].cnt });
  } catch (err) {
    console.error('[guild/join]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
