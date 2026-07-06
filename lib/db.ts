/**
 * lib/db.ts — PostgreSQL 單例 Pool，lazy init
 * 無 DATABASE_URL 時所有 guild API 回 503 GUILD_UNAVAILABLE
 */

import { Pool } from 'pg';
import { GUILD_DEFS } from './guilds';

let pool: Pool | null = null;
let initialized = false;

// 種子貼文固定 UUID（冪等用，重跑不重複）
const SEED_POST_IDS: Record<string, [string, string]> = {
  pm:        ['00000001-0001-0001-0001-000000000001', '00000001-0001-0001-0001-000000000002'],
  ba:        ['00000002-0002-0002-0002-000000000001', '00000002-0002-0002-0002-000000000002'],
  marketing: ['00000003-0003-0003-0003-000000000001', '00000003-0003-0003-0003-000000000002'],
  hr:        ['00000004-0004-0004-0004-000000000001', '00000004-0004-0004-0004-000000000002'],
  bd:        ['00000005-0005-0005-0005-000000000001', '00000005-0005-0005-0005-000000000002'],
  consultant:['00000006-0006-0006-0006-000000000001', '00000006-0006-0006-0006-000000000002'],
  swe:       ['00000007-0007-0007-0007-000000000001', '00000007-0007-0007-0007-000000000002'],
  frontend:  ['00000008-0008-0008-0008-000000000001', '00000008-0008-0008-0008-000000000002'],
  webdesign: ['00000009-0009-0009-0009-000000000001', '00000009-0009-0009-0009-000000000002'],
  data:      ['00000010-0010-0010-0010-000000000001', '00000010-0010-0010-0010-000000000002'],
  uxr:       ['00000011-0011-0011-0011-000000000001', '00000011-0011-0011-0011-000000000002'],
  finance:   ['00000012-0012-0012-0012-000000000001', '00000012-0012-0012-0012-000000000002'],
  content:   ['00000013-0013-0013-0013-000000000001', '00000013-0013-0013-0013-000000000002'],
  pjm:       ['00000014-0014-0014-0014-000000000001', '00000014-0014-0014-0014-000000000002'],
  startup:   ['00000015-0015-0015-0015-000000000001', '00000015-0015-0015-0015-000000000002'],
  explorer:  ['00000016-0016-0016-0016-000000000001', '00000016-0016-0016-0016-000000000002'],
};

export function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function initProfileDb(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        device_id text PRIMARY KEY,
        nickname text NOT NULL,
        avatar_id int NOT NULL DEFAULT 1,
        grade text NOT NULL DEFAULT 'y1',
        has_resume boolean NOT NULL DEFAULT false,
        has_club boolean NOT NULL DEFAULT false,
        has_applied boolean NOT NULL DEFAULT false,
        birth_year int,
        goal_role text,
        transfer_code text UNIQUE NOT NULL,
        google_id text,
        total_points int NOT NULL DEFAULT 0,
        level int NOT NULL DEFAULT 1,
        streak int NOT NULL DEFAULT 0,
        badge_count int NOT NULL DEFAULT 0,
        last_sync_date text,
        day_points int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  } finally {
    client.release();
  }
}

export async function initDb(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    // 建表
    await client.query(`
      CREATE TABLE IF NOT EXISTS guild_members (
        guild_id TEXT NOT NULL,
        device_id TEXT NOT NULL,
        nickname TEXT NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (guild_id, device_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS guild_posts (
        id UUID PRIMARY KEY,
        guild_id TEXT NOT NULL,
        device_id TEXT NOT NULL,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        reply_to UUID NULL,
        official BOOLEAN NOT NULL DEFAULT false,
        hidden BOOLEAN NOT NULL DEFAULT false,
        report_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS guild_reports (
        post_id UUID NOT NULL,
        device_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (post_id, device_id)
      )
    `);

    // 種子貼文（冪等：ON CONFLICT DO NOTHING）
    for (const guild of GUILD_DEFS) {
      const ids = SEED_POST_IDS[guild.id];
      if (!ids) continue;

      await client.query(
        `INSERT INTO guild_posts (id, guild_id, device_id, nickname, content, official)
         VALUES ($1, $2, 'official', '藍藍教練', $3, true)
         ON CONFLICT (id) DO NOTHING`,
        [ids[0], guild.id, guild.welcomePost]
      );

      await client.query(
        `INSERT INTO guild_posts (id, guild_id, device_id, nickname, content, official)
         VALUES ($1, $2, 'official', '藍藍教練', $3, true)
         ON CONFLICT (id) DO NOTHING`,
        [ids[1], guild.id, guild.icebreakerPost]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    initialized = false; // 允許下次重試
    throw err;
  } finally {
    client.release();
  }
}
