/**
 * scripts/verify-questline.mjs
 * 驗收 generateQuestLine 純函式的快照斷言
 * 執行：node scripts/verify-questline.mjs
 */

// ──────────────────────────────────────────────
// 複製 lib/quest-line.ts 的純邏輯（不依賴 TypeScript/bundler）
// ──────────────────────────────────────────────

const EXPLORE_CHAPTER = {
  id: 0,
  title: '探索章：還不知道要去哪',
  stages: [
    { code: '0-1', title: '先做個興趣測驗暖身', taskCodes: ['interest_quiz'] },
    { code: '0-2', title: '認識 3 個職位看看感覺', taskCodes: ['role_explore_3'] },
    { code: '0-3', title: '設定一個暫定目標', taskCodes: ['goal_set'] },
  ],
};

const EXPLORER_CHAPTERS = [
  {
    id: 1, title: '第 1 章：認識自己',
    stages: [
      { code: '1-1', title: '先做個興趣測驗', taskCodes: ['interest_quiz'] },
      { code: '1-2', title: '認識 3 個職位模板', taskCodes: ['role_explore_3'] },
      { code: '1-3', title: '建立你的 LinkedIn', taskCodes: ['linkedin_create'] },
      { code: '1-4', title: '看 3 篇不同職位心得', taskCodes: ['read_review_3roles'] },
    ],
  },
  {
    id: 2, title: '第 2 章：踏出第一步',
    stages: [
      { code: '2-1', title: '加入社團或專案', taskCodes: ['club_join'] },
      { code: '2-2', title: '報名一場活動講座', taskCodes: ['activity_join'] },
      { code: '2-3', title: '訪談一位學長姐', taskCodes: ['senior_interview'] },
      { code: '2-4', title: '加入公會打聲招呼', taskCodes: ['join_guild', 'guild_intro'] },
    ],
  },
  {
    id: 3, title: '第 3 章：小試身手',
    stages: [
      { code: '3-1', title: '交一份小型實作', taskCodes: ['mini_artifact'] },
      { code: '3-2', title: '完成經歷盤點表', taskCodes: ['exp_inventory'] },
      { code: '3-3', title: '做個能力水平測驗', taskCodes: ['ability_quiz'] },
    ],
  },
  {
    id: 4, title: '第 4 章：定下方向',
    stages: [
      { code: '4-1', title: '設定目標職位', taskCodes: ['goal_set'] },
      { code: '4-2', title: '看 3 篇目標職位心得', taskCodes: ['read_target_3'] },
      { code: '4-3', title: '擬本學期行動計畫', taskCodes: ['semester_plan'] },
    ],
  },
];

const BUILDER_CHAPTERS = [
  {
    id: 1, title: '第 1 章：定位自己',
    stages: [
      { code: '1-1', title: '先做個能力測驗', taskCodes: ['ability_quiz'] },
      { code: '1-2', title: '完成 AI 履歷分析', taskCodes: ['resume_analyzed'] },
      { code: '1-3', title: '建立或更新 LinkedIn', taskCodes: ['linkedin_create'] },
    ],
  },
  {
    id: 2, title: '第 2 章：履歷工坊',
    stages: [
      { code: '2-1', title: '依建議修改後重新分析', taskCodes: ['resume_improve'] },
      { code: '2-2', title: '補上量化成果', taskCodes: ['quantified_added'] },
      { code: '2-3', title: '補上作品集連結', taskCodes: ['portfolio_added'] },
    ],
  },
  {
    id: 3, title: '第 3 章：經歷補強',
    stages: [
      { code: '3-1', title: '報名相關活動', taskCodes: ['activity_join'] },
      { code: '3-2', title: '完成一個學習資源', taskCodes: ['learn_resource'] },
      { code: '3-3', title: '交一份小型實作', taskCodes: ['mini_artifact'] },
      { code: '3-4', title: 'Coffee Chat 或訪談學長姐', taskCodes: ['senior_interview'] },
    ],
  },
  {
    id: 4, title: '第 4 章：投遞啟動',
    stages: [
      { code: '4-1', title: '戰情室收 5 個職缺', taskCodes: ['app_first', 'app_five'] },
      { code: '4-2', title: '完成首投', taskCodes: ['app_submit_first'] },
      { code: '4-3', title: '一週投遞回顧', taskCodes: ['weekly_review'] },
    ],
  },
];

const SPRINT_CHAPTERS = [
  {
    id: 1, title: '第 1 章：快速定位',
    stages: [
      { code: '1-1', title: '先做個能力測驗', taskCodes: ['ability_quiz'] },
      { code: '1-2', title: '完成 AI 履歷分析', taskCodes: ['resume_analyzed'] },
    ],
  },
  {
    id: 2, title: '第 2 章：履歷衝刺',
    stages: [
      { code: '2-1', title: '依建議重寫履歷', taskCodes: ['resume_improve'] },
      { code: '2-2', title: '量化 + 補作品集', taskCodes: ['quantified_added', 'portfolio_added'] },
    ],
  },
  {
    id: 3, title: '第 3 章：火力投遞',
    stages: [
      { code: '3-1', title: '收 5 缺並設截止日', taskCodes: ['app_five', 'app_deadline_set'] },
      { code: '3-2', title: '完成首投', taskCodes: ['app_submit_first'] },
      { code: '3-3', title: '記錄一場面試', taskCodes: ['interview_log'] },
    ],
  },
  {
    id: 4, title: '第 4 章：覆盤與分享',
    stages: [
      { code: '4-1', title: '完成週回顧', taskCodes: ['weekly_review'] },
      { code: '4-2', title: '把面試心得寫回實習通', taskCodes: ['share_story'] },
    ],
  },
];

function deepCloneChapters(chapters) {
  return chapters.map((ch) => ({
    ...ch,
    stages: ch.stages.map((s) => ({ ...s, taskCodes: [...s.taskCodes] })),
  }));
}

function generateQuestLine(profile, completedTaskCodes = new Set(), generatedAt = new Date().toISOString()) {
  const { grade, hasResume, goalRoleId } = profile;

  // 選軌
  let trackId;
  if (grade === 'y1' || grade === 'y2') {
    trackId = 'explorer';
  } else if (grade === 'y3' || grade === 'grad') {
    trackId = 'builder';
  } else {
    trackId = 'sprint';
  }

  let chapters = deepCloneChapters(
    trackId === 'explorer' ? EXPLORER_CHAPTERS
    : trackId === 'builder' ? BUILDER_CHAPTERS
    : SPRINT_CHAPTERS
  );

  // goalRoleId=null → 前插探索章
  if (!goalRoleId) {
    const exploreClone = deepCloneChapters([EXPLORE_CHAPTER])[0];
    chapters = [exploreClone, ...chapters];
  }

  // hasResume=false + builder/sprint → 前插經歷盤點
  if (!hasResume && (trackId === 'builder' || trackId === 'sprint')) {
    const ch1Idx = chapters.findIndex((c) => c.id === 1);
    if (ch1Idx !== -1) {
      const ch1 = chapters[ch1Idx];
      const resumeIdx = ch1.stages.findIndex((s) => s.taskCodes.includes('resume_analyzed'));
      const expStage = {
        code: `${ch1.id}-0`,
        title: '先盤點你有哪些經歷',
        taskCodes: ['exp_inventory'],
      };
      if (resumeIdx !== -1) {
        ch1.stages.splice(resumeIdx, 0, expStage);
      } else {
        ch1.stages.unshift(expStage);
      }
      // 重新編號
      ch1.stages = ch1.stages.map((s, i) => ({ ...s, code: `${ch1.id}-${i}` }));
    }
  }

  // 計算 cleared
  for (const ch of chapters) {
    for (const stage of ch.stages) {
      stage.cleared = stage.taskCodes.every((tc) => completedTaskCodes.has(tc));
    }
  }

  return { trackId, generatedAt, chapters };
}

// ──────────────────────────────────────────────
// 測試工具
// ──────────────────────────────────────────────
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

function allStages(ql) {
  return ql.chapters.flatMap((ch) => ch.stages);
}

console.log('\n=== verify-questline.mjs ===\n');

// ──────────────────────────────────────────────
// 測試 1：y1 探索軌
// ──────────────────────────────────────────────
console.log('1. y1 探索軌');
{
  const profile = { grade: 'y1', hasResume: false, hasClubExp: false, hasApplied: false, goalRoleId: 'pm' };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = explorer', ql.trackId === 'explorer', `got=${ql.trackId}`);
  check('第 1 章 id=1 存在', ql.chapters.some((c) => c.id === 1));
  check('1-1 首關 code 含 interest_quiz', allStages(ql)[0]?.taskCodes.includes('interest_quiz'), `first=${JSON.stringify(allStages(ql)[0]?.taskCodes)}`);
  check('explorer 第 1 章第 3 關含 linkedin_create', ql.chapters.find((c) => c.id === 1)?.stages[2]?.taskCodes.includes('linkedin_create'));
}

// ──────────────────────────────────────────────
// 測試 2：y3 有履歷有目標
// ──────────────────────────────────────────────
console.log('\n2. y3 有履歷有目標');
{
  const profile = { grade: 'y3', hasResume: true, hasClubExp: true, hasApplied: false, goalRoleId: 'pm' };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = builder', ql.trackId === 'builder', `got=${ql.trackId}`);
  check('無探索章（goalRoleId 存在）', !ql.chapters.some((c) => c.id === 0));
  check('第 1 章無 exp_inventory 前插（有履歷）',
    !ql.chapters.find((c) => c.id === 1)?.stages.some((s) => s.taskCodes.includes('exp_inventory'))
  );
  check('1-1 首關含 ability_quiz', ql.chapters.find((c) => c.id === 1)?.stages[0]?.taskCodes.includes('ability_quiz'));
}

// ──────────────────────────────────────────────
// 測試 3：y3 無履歷
// ──────────────────────────────────────────────
console.log('\n3. y3 無履歷');
{
  const profile = { grade: 'y3', hasResume: false, hasClubExp: false, hasApplied: false, goalRoleId: 'pm' };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = builder', ql.trackId === 'builder', `got=${ql.trackId}`);
  const ch1 = ql.chapters.find((c) => c.id === 1);
  check('第 1 章有 exp_inventory 前插', ch1?.stages.some((s) => s.taskCodes.includes('exp_inventory')));
  // 插在 resume_analyzed 前面
  const expIdx = ch1?.stages.findIndex((s) => s.taskCodes.includes('exp_inventory')) ?? -1;
  const resumeIdx = ch1?.stages.findIndex((s) => s.taskCodes.includes('resume_analyzed')) ?? -1;
  check('exp_inventory 在 resume_analyzed 之前', expIdx !== -1 && resumeIdx !== -1 && expIdx < resumeIdx, `expIdx=${expIdx} resumeIdx=${resumeIdx}`);
}

// ──────────────────────────────────────────────
// 測試 4：y4 已投遞（hasApplied=true，sprint 軌）
// ──────────────────────────────────────────────
console.log('\n4. y4 已投遞（sprint 軌）');
{
  const profile = { grade: 'y4', hasResume: true, hasClubExp: false, hasApplied: true, goalRoleId: 'pm' };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = sprint', ql.trackId === 'sprint', `got=${ql.trackId}`);
  check('章數 = 4', ql.chapters.filter((c) => c.id > 0).length === 4, `chapters=${ql.chapters.length}`);
}

// ──────────────────────────────────────────────
// 測試 5：grad 無目標 → 探索章前插
// ──────────────────────────────────────────────
console.log('\n5. grad 無目標（goalRoleId=null）');
{
  const profile = { grade: 'grad', hasResume: true, hasClubExp: false, hasApplied: false, goalRoleId: null };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = builder', ql.trackId === 'builder', `got=${ql.trackId}`);
  check('有探索章（id=0）', ql.chapters[0]?.id === 0);
  check('探索章 0-1 含 interest_quiz', ql.chapters[0]?.stages[0]?.taskCodes.includes('interest_quiz'));
}

// ──────────────────────────────────────────────
// 測試 6：y2 有社團（explorer 軌，2-1 應含 club_join）
// ──────────────────────────────────────────────
console.log('\n6. y2 有社團（explorer 軌）');
{
  const profile = { grade: 'y2', hasResume: false, hasClubExp: true, hasApplied: false, goalRoleId: 'ux' };
  const ql = generateQuestLine(profile, new Set(), '2026-01-01T00:00:00.000Z');
  check('軌別 = explorer', ql.trackId === 'explorer', `got=${ql.trackId}`);
  const ch2 = ql.chapters.find((c) => c.id === 2);
  check('第 2 章 2-1 含 club_join', ch2?.stages[0]?.taskCodes.includes('club_join'));
  check('無探索章（goalRoleId 存在）', !ql.chapters.some((c) => c.id === 0));
}

// ──────────────────────────────────────────────
// 測試 7：同輸入必同輸出（純函式）
// ──────────────────────────────────────────────
console.log('\n7. 同輸入必同輸出');
{
  const profile = { grade: 'y3', hasResume: false, hasClubExp: false, hasApplied: false, goalRoleId: 'pm' };
  const ts = '2026-01-01T00:00:00.000Z';
  const a = generateQuestLine(profile, new Set(), ts);
  const b = generateQuestLine(profile, new Set(), ts);
  check('兩次生成 trackId 相同', a.trackId === b.trackId);
  check('兩次生成章節數相同', a.chapters.length === b.chapters.length);
  const aStages = a.chapters.flatMap((c) => c.stages.map((s) => s.code)).join(',');
  const bStages = b.chapters.flatMap((c) => c.stages.map((s) => s.code)).join(',');
  check('兩次生成關卡 code 序列相同', aStages === bStages, `\n  a=${aStages}\n  b=${bStages}`);
}

// ──────────────────────────────────────────────
// 測試 8：已完成任務的關自動 cleared
// ──────────────────────────────────────────────
console.log('\n8. 已完成任務的關自動 cleared');
{
  const profile = { grade: 'y1', hasResume: false, hasClubExp: false, hasApplied: false, goalRoleId: 'pm' };
  const completed = new Set(['interest_quiz']); // 完成 1-1 的任務
  const ql = generateQuestLine(profile, completed, '2026-01-01T00:00:00.000Z');
  const ch1 = ql.chapters.find((c) => c.id === 1);
  const stage11 = ch1?.stages.find((s) => s.code === '1-1');
  check('1-1 cleared=true（interest_quiz 已完成）', stage11?.cleared === true, `cleared=${stage11?.cleared}`);
  const stage12 = ch1?.stages.find((s) => s.code === '1-2');
  check('1-2 cleared=false（role_explore_3 未完成）', stage12?.cleared === false, `cleared=${stage12?.cleared}`);
}

console.log(`\n=== 結果：${pass} PASS / ${fail} FAIL ===\n`);
process.exit(fail > 0 ? 1 : 0);
