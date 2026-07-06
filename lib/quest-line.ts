/**
 * lib/quest-line.ts — Agent B 擁有
 * 年級個人化關卡線生成器（純函式，同輸入必同輸出）
 */

// ──────────────────────────────────────────────
// 型別（§4.5）
// ──────────────────────────────────────────────
export interface Stage {
  code: string;   // e.g. '1-1'
  title: string;
  taskCodes: string[];
}

export interface Chapter {
  id: number;
  title: string;
  stages: Stage[];
}

export interface QuestLine {
  trackId: 'explorer' | 'builder' | 'sprint';
  generatedAt: string;
  chapters: Chapter[];
}

// Profile shape（對應 §1.2；從 localStorage 直接讀 profile.v1）
export interface ProfileV1 {
  deviceId: string;
  nickname: string;
  avatarId: 1 | 2 | 3 | 4 | 5 | 6;
  grade: 'y1' | 'y2' | 'y3' | 'y4' | 'grad' | 'fresh';
  hasResume: boolean;
  hasClubExp: boolean;
  hasApplied: boolean;
  birthYear: number | null;
  goalRoleId: string | null;
  transferCode: string;
  registeredAt: string;
}

// ──────────────────────────────────────────────
// 章關資料庫（§4.3）
// ──────────────────────────────────────────────

// 探索章（goalRoleId=null 時前插到任一軌最前）
const EXPLORE_CHAPTER: Chapter = {
  id: 0,
  title: '探索章：還不知道要去哪',
  stages: [
    { code: '0-1', title: '先做個興趣測驗暖身', taskCodes: ['interest_quiz'] },
    { code: '0-2', title: '認識 3 個職位看看感覺', taskCodes: ['role_explore_3'] },
    { code: '0-3', title: '設定一個暫定目標', taskCodes: ['goal_set'] },
  ],
};

// explorer 探索軌
const EXPLORER_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '第 1 章：認識自己',
    stages: [
      { code: '1-1', title: '先做個興趣測驗', taskCodes: ['interest_quiz'] },
      { code: '1-2', title: '認識 3 個職位模板', taskCodes: ['role_explore_3'] },
      { code: '1-3', title: '建立你的 LinkedIn', taskCodes: ['linkedin_create'] },
      { code: '1-4', title: '看 3 篇不同職位心得', taskCodes: ['read_review_3roles'] },
    ],
  },
  {
    id: 2,
    title: '第 2 章：踏出第一步',
    stages: [
      { code: '2-1', title: '加入社團或專案', taskCodes: ['club_join'] },
      { code: '2-2', title: '報名一場活動講座', taskCodes: ['activity_join'] },
      { code: '2-3', title: '訪談一位學長姐', taskCodes: ['senior_interview'] },
      { code: '2-4', title: '加入公會打聲招呼', taskCodes: ['join_guild', 'guild_intro'] },
    ],
  },
  {
    id: 3,
    title: '第 3 章：小試身手',
    stages: [
      { code: '3-1', title: '交一份小型實作', taskCodes: ['mini_artifact'] },
      { code: '3-2', title: '完成經歷盤點表', taskCodes: ['exp_inventory'] },
      { code: '3-3', title: '做個能力水平測驗', taskCodes: ['ability_quiz'] },
    ],
  },
  {
    id: 4,
    title: '第 4 章：定下方向',
    stages: [
      { code: '4-1', title: '設定目標職位', taskCodes: ['goal_set'] },
      { code: '4-2', title: '看 3 篇目標職位心得', taskCodes: ['read_target_3'] },
      { code: '4-3', title: '擬本學期行動計畫', taskCodes: ['semester_plan'] },
    ],
  },
];

// builder 準備軌
const BUILDER_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '第 1 章：定位自己',
    stages: [
      { code: '1-1', title: '先做個能力測驗', taskCodes: ['ability_quiz'] },
      { code: '1-2', title: '完成 AI 履歷分析', taskCodes: ['resume_analyzed'] },
      { code: '1-3', title: '建立或更新 LinkedIn', taskCodes: ['linkedin_create'] },
    ],
  },
  {
    id: 2,
    title: '第 2 章：履歷工坊',
    stages: [
      { code: '2-1', title: '依建議修改後重新分析', taskCodes: ['resume_improve'] },
      { code: '2-2', title: '補上量化成果', taskCodes: ['quantified_added'] },
      { code: '2-3', title: '補上作品集連結', taskCodes: ['portfolio_added'] },
    ],
  },
  {
    id: 3,
    title: '第 3 章：經歷補強',
    stages: [
      { code: '3-1', title: '報名相關活動', taskCodes: ['activity_join'] },
      { code: '3-2', title: '完成一個學習資源', taskCodes: ['learn_resource'] },
      { code: '3-3', title: '交一份小型實作', taskCodes: ['mini_artifact'] },
      { code: '3-4', title: 'Coffee Chat 或訪談學長姐', taskCodes: ['senior_interview'] },
    ],
  },
  {
    id: 4,
    title: '第 4 章：投遞啟動',
    stages: [
      { code: '4-1', title: '戰情室收 5 個職缺', taskCodes: ['app_first', 'app_five'] },
      { code: '4-2', title: '完成首投', taskCodes: ['app_submit_first'] },
      { code: '4-3', title: '一週投遞回顧', taskCodes: ['weekly_review'] },
    ],
  },
];

// sprint 衝刺軌
const SPRINT_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '第 1 章：快速定位',
    stages: [
      { code: '1-1', title: '先做個能力測驗', taskCodes: ['ability_quiz'] },
      { code: '1-2', title: '完成 AI 履歷分析', taskCodes: ['resume_analyzed'] },
    ],
  },
  {
    id: 2,
    title: '第 2 章：履歷衝刺',
    stages: [
      { code: '2-1', title: '依建議重寫履歷', taskCodes: ['resume_improve'] },
      { code: '2-2', title: '量化 + 補作品集', taskCodes: ['quantified_added', 'portfolio_added'] },
    ],
  },
  {
    id: 3,
    title: '第 3 章：火力投遞',
    stages: [
      { code: '3-1', title: '收 5 缺並設截止日', taskCodes: ['app_five', 'app_deadline_set'] },
      { code: '3-2', title: '完成首投', taskCodes: ['app_submit_first'] },
      { code: '3-3', title: '記錄一場面試', taskCodes: ['interview_log'] },
    ],
  },
  {
    id: 4,
    title: '第 4 章：覆盤與分享',
    stages: [
      { code: '4-1', title: '完成週回顧', taskCodes: ['weekly_review'] },
      { code: '4-2', title: '把面試心得寫回實習通', taskCodes: ['share_story'] },
    ],
  },
];

// ──────────────────────────────────────────────
// 純函式：generateQuestLine
// ──────────────────────────────────────────────

/**
 * 給定 profile 與已完成的 taskCodes set，生成個人化關卡線。
 * @param profile - profile.v1 物件
 * @param completedTaskCodes - 已達成的任務 code set（從 quest.v1 tasks 計算而來）
 * @param generatedAt - ISO 時間字串（由呼叫端傳入以保持純函式）
 */
export function generateQuestLine(
  profile: ProfileV1,
  completedTaskCodes: ReadonlySet<string> = new Set(),
  generatedAt: string = new Date().toISOString(),
): QuestLine {
  const { grade, hasResume, hasApplied, goalRoleId } = profile;

  // 1. 選軌
  let trackId: 'explorer' | 'builder' | 'sprint';
  if (grade === 'y1' || grade === 'y2') {
    trackId = 'explorer';
  } else if (grade === 'y3' || grade === 'grad') {
    trackId = 'builder';
  } else {
    // y4, fresh
    trackId = 'sprint';
  }

  // 2. 取基底章節（深複製避免修改原始資料）
  let chapters: Chapter[] = deepCloneChapters(
    trackId === 'explorer' ? EXPLORER_CHAPTERS
    : trackId === 'builder' ? BUILDER_CHAPTERS
    : SPRINT_CHAPTERS
  );

  // 3. flags 修剪

  // 3a. goalRoleId=null → 最前插「探索章」
  if (!goalRoleId) {
    const exploreClone = deepCloneChapters([EXPLORE_CHAPTER])[0];
    chapters = [exploreClone, ...chapters];
    // 重排 id：探索章=0，後面章節 id 維持原值但視覺上從 1 起
  }

  // 3b. hasResume=false → builder/sprint 第 1 章 1-2（履歷分析）前插「經歷盤點」關
  if (!hasResume && (trackId === 'builder' || trackId === 'sprint')) {
    // 找第 1 章（goalRoleId=null 時 chapters[0] 是探索章，所以找 id=1 的章節）
    const ch1Idx = chapters.findIndex((c) => c.id === 1);
    if (ch1Idx !== -1) {
      const ch1 = chapters[ch1Idx];
      // 找 resume_analyzed 關的前面插入 exp_inventory
      const resumeIdx = ch1.stages.findIndex((s) => s.taskCodes.includes('resume_analyzed'));
      const expStage: Stage = {
        code: resumeIdx !== -1 ? `${ch1.id}-0` : `${ch1.id}-0`,
        title: '先盤點你有哪些經歷',
        taskCodes: ['exp_inventory'],
      };
      if (resumeIdx !== -1) {
        ch1.stages.splice(resumeIdx, 0, expStage);
      } else {
        ch1.stages.unshift(expStage);
      }
      // 重新編號：插入後的所有 stage.code 按序重排
      ch1.stages = ch1.stages.map((s, i) => ({
        ...s,
        code: `${ch1.id}-${i}`,
      }));
    }
  }

  // 3c. hasApplied=true → sprint 從投遞章中段開始（1-1、1-2 標為 cleared）
  // 用已完成任務判定即可，不需額外處理——已完成的關卡在下方 cleared 計算中自動亮

  // 4. 計算每關是否 cleared（taskCodes 全部在 completedTaskCodes）
  for (const ch of chapters) {
    for (const stage of ch.stages) {
      (stage as Stage & { cleared?: boolean }).cleared =
        stage.taskCodes.every((tc) => completedTaskCodes.has(tc));
    }
  }

  return { trackId, generatedAt, chapters };
}

/**
 * 從 quest.v1.tasks 計算已達成的 taskCodes set
 * 任務 count >= 1 即算完成（one-time 任務；repeatable 任務不影響關卡 cleared 判定）
 */
export function buildCompletedSet(
  tasks: Record<string, { count: number; lastAt: string }>,
): Set<string> {
  const result = new Set<string>();
  for (const [code, rec] of Object.entries(tasks)) {
    if (rec.count >= 1) result.add(code);
  }
  return result;
}

/** 取得關卡線的 currentStage（第一個未 cleared 的關） */
export function getCurrentStage(questLine: QuestLine): { chapterId: number; stageCode: string } | null {
  for (const ch of questLine.chapters) {
    for (const stage of ch.stages) {
      if (!(stage as Stage & { cleared?: boolean }).cleared) {
        return { chapterId: ch.id, stageCode: stage.code };
      }
    }
  }
  return null; // 全部完成
}

// ──────────────────────────────────────────────
// 工具：深複製章節（確保純函式安全）
// ──────────────────────────────────────────────
function deepCloneChapters(chapters: readonly Chapter[]): Chapter[] {
  return chapters.map((ch) => ({
    ...ch,
    stages: ch.stages.map((s) => ({ ...s, taskCodes: [...s.taskCodes] })),
  }));
}
