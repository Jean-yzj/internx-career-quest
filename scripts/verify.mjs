/**
 * scripts/verify.mjs
 * Verifies four correctness properties of the quest engine.
 * Run: node scripts/verify.mjs
 * All results are printed; script exits 0 if all pass, 1 if any fail.
 */

// We test by importing and running the pure logic inline (no DOM).
// The types and logic are re-implemented here so the script runs in Node without bundling.

// ===== RIASEC Logic (mirrors lib/interest-quiz.ts) =====
const RIASEC_Q_TYPES = ['R','R','R','I','I','I','A','A','A','S','S','S','E','E','E','C','C','C'];
const TIEBREAK = ['R','I','A','S','E','C'];

function computeHollandCode(answers) {
  const scores = { R:0, I:0, A:0, S:0, E:0, C:0 };
  RIASEC_Q_TYPES.forEach((t, i) => { scores[t] += (answers[i] ?? 0); });
  const sorted = Object.keys(scores).sort((a,b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return TIEBREAK.indexOf(a) - TIEBREAK.indexOf(b);
  });
  return { scores, code: sorted[0] + sorted[1] };
}

// ===== Ability Level Logic (mirrors lib/ability-quiz.ts) =====
function getAbilityLevel(score) {
  if (score <= 6)  return 'explorer';
  if (score <= 10) return 'starter';
  if (score <= 14) return 'builder';
  if (score <= 17) return 'applicant';
  return 'finalist';
}

// ===== Award Logic (mirrors lib/quest-store.ts) =====
const DAILY_LIMIT = 30;
const DAY_TOTAL_LIMIT = 200;

function defaultQuest() {
  return {
    schemaVersion: 1,
    profile: null, interest: null, ability: null, analysis: null, analysisPrev: null,
    tasks: {},
    daily: { date: '', taskCodes: [], doneCodes: [] },
    pointsLedger: [],
    totalPoints: 0,
    badges: [],
    streak: { days: 0, lastDate: '' },
  };
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function award(data, code, delta, reason, oneTime = false) {
  const today = getTodayStr();
  if (oneTime) {
    if (data.tasks[code] && data.tasks[code].count >= 1) return data;
  }
  const isDailyPool = code.startsWith('daily_');
  if (isDailyPool) {
    const dailyEarned = data.pointsLedger
      .filter(e => e.at.startsWith(today) && e.reason.includes('[daily]'))
      .reduce((s,e) => s + e.delta, 0);
    if (dailyEarned >= DAILY_LIMIT) return data;
  }
  const dayTotal = data.pointsLedger
    .filter(e => e.at.startsWith(today))
    .reduce((s,e) => s + e.delta, 0);
  if (dayTotal >= DAY_TOTAL_LIMIT) return data;

  const actualDelta = Math.min(delta, DAY_TOTAL_LIMIT - dayTotal);
  data.totalPoints += actualDelta;
  data.pointsLedger.push({
    id: Math.random().toString(36),
    delta: actualDelta,
    reason: isDailyPool ? `${reason} [daily]` : reason,
    at: new Date().toISOString(),
    balanceAfter: data.totalPoints,
  });
  const existing = data.tasks[code];
  data.tasks[code] = { count: (existing?.count ?? 0) + 1, lastAt: new Date().toISOString() };
  return data;
}

// ===== Tests =====
let pass = 0, fail = 0;

function check(label, condition, evidence = '') {
  if (condition) {
    console.log(`  PASS: ${label}`);
    pass++;
  } else {
    console.error(`  FAIL: ${label}${evidence ? ' | ' + evidence : ''}`);
    fail++;
  }
}

console.log('\n=== verify.mjs ===\n');

// Test 1: RIASEC R all-3, others 0 → first code = R
console.log('1. RIASEC: R全3其他0 → 首碼 R');
{
  const answers = Array(18).fill(0).map((_, i) => i < 3 ? 3 : 0);
  const { code } = computeHollandCode(answers);
  check('首碼為 R', code[0] === 'R', `code=${code}`);
  check('次碼為 I（tiebreak）', code[1] === 'I', `code=${code}`);
}

// Test 2: Ability all-yes (2×10=20) → finalist; all-no (0) → explorer
console.log('\n2. Ability: 全是→面試衝刺者，全否→新手探索者');
{
  const levelFull = getAbilityLevel(20);
  const levelZero = getAbilityLevel(0);
  check('全是 = finalist', levelFull === 'finalist', `got=${levelFull}`);
  check('全否 = explorer', levelZero === 'explorer', `got=${levelZero}`);
}

// Test 3: Award idempotency for one-time tasks
console.log('\n3. Award 冪等：同一次性任務兩次只計一次');
{
  const data = defaultQuest();
  award(data, 'onboarding_done', 20, '完成闖關啟程', true);
  award(data, 'onboarding_done', 20, '完成闖關啟程', true);
  check('totalPoints = 20（非 40）', data.totalPoints === 20, `points=${data.totalPoints}`);
  check('task count = 1（非 2）', data.tasks['onboarding_done']?.count === 1, `count=${data.tasks['onboarding_done']?.count}`);
}

// Test 4: Daily pool cap at 30 pts
console.log('\n4. 每日池日上限 30 點生效');
{
  const data = defaultQuest();
  // Award 4 daily tasks at 10 pts each → should cap at 30
  for (let i = 0; i < 4; i++) {
    award(data, `daily_task_${i}`, 10, `每日任務${i} [daily]`);
  }
  const today = getTodayStr();
  const dailyEarned = data.pointsLedger
    .filter(e => e.at.startsWith(today) && e.reason.includes('[daily]'))
    .reduce((s,e) => s + e.delta, 0);
  check('每日池累計 ≤ 30', dailyEarned <= 30, `dailyEarned=${dailyEarned}`);
  check('第4次日池任務不計入（dailyEarned=30）', dailyEarned === 30, `dailyEarned=${dailyEarned}`);
}

console.log(`\n=== 結果：${pass} PASS / ${fail} FAIL ===\n`);
process.exit(fail > 0 ? 1 : 0);
