import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'PROFILE_UNAVAILABLE' }, { status: 503 });

const SENSITIVE_WORDS = ['色情', '賭博', '詐騙', '援交', '開槍', '炸彈', 'fuck', 'shit'];
function containsSensitive(text: string): boolean {
  return SENSITIVE_WORDS.some((w) => text.toLowerCase().includes(w.toLowerCase()));
}

const VALID_GRADES = new Set(['y1', 'y2', 'y3', 'y4', 'grad', 'fresh']);
const VALID_AVATAR_IDS = new Set([1, 2, 3, 4, 5, 6]);

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { deviceId, nickname, avatarId, grade, goalRoleId } = body as Record<string, unknown>;

  if (!deviceId || typeof deviceId !== 'string') {
    return NextResponse.json({ error: '缺少 deviceId' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (nickname !== undefined) {
    if (typeof nickname !== 'string' || nickname.length < 2 || nickname.length > 12) {
      return NextResponse.json({ error: '暱稱需 2–12 字' }, { status: 400 });
    }
    if (containsSensitive(nickname)) {
      return NextResponse.json({ error: '暱稱含有不允許的詞彙' }, { status: 400 });
    }
    updates.push(`nickname = $${idx++}`);
    values.push(nickname);
  }

  if (avatarId !== undefined) {
    if (!VALID_AVATAR_IDS.has(Number(avatarId))) {
      return NextResponse.json({ error: '無效頭像' }, { status: 400 });
    }
    updates.push(`avatar_id = $${idx++}`);
    values.push(Number(avatarId));
  }

  if (grade !== undefined) {
    if (typeof grade !== 'string' || !VALID_GRADES.has(grade)) {
      return NextResponse.json({ error: '無效年級' }, { status: 400 });
    }
    updates.push(`grade = $${idx++}`);
    values.push(grade);
  }

  if (goalRoleId !== undefined) {
    updates.push(`goal_role = $${idx++}`);
    values.push(goalRoleId ?? null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: '無可更新欄位' }, { status: 400 });
  }

  updates.push(`updated_at = now()`);
  values.push(deviceId);

  try {
    await initProfileDb();
    const pool = getPool();
    await pool.query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE device_id = $${idx}`,
      values
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[profile/update]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
