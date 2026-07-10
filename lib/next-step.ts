import type { QuestData } from './types';
import { getTodayStr } from './types';
import { getCurrentStage } from './quest-line';

export interface NextStep {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'urgent' | 'normal' | 'done';
}

// taskCode → 站內路由（與島頁 STAGE_TASK_ROUTE 保持一致）
const TASK_HREF: Record<string, string> = {
  ability_quiz: '/quiz/ability',
  interest_quiz: '/quiz/interest',
  resume_analyzed: '/analysis',
  resume_improve: '/analysis',
  quantified_added: '/analysis',
  portfolio_added: '/analysis',
  app_first: '/war-room',
  app_five: '/war-room',
  app_deadline_set: '/war-room',
  app_submit_first: '/war-room',
  interview_log: '/war-room',
  weekly_review: '/war-room',
  radar_check: '/war-room',
  join_guild: '/guilds',
  guild_intro: '/guilds',
  help_newbie: '/guilds',
  linkedin_create: '/island',
  club_join: '/island',
  senior_interview: '/island',
  exp_inventory: '/island',
  semester_plan: '/island',
  goal_set: '/report',
  role_explore_3: '/island',
  read_review_3roles: '/island',
  read_target_3: '/island',
  activity_join: '/island',
  mini_artifact: '/island',
  coffee_chat: '/island',
  share_story: '/island',
  learn_resource: '/island',
};

export function getNextStep(data: QuestData, profileGoalRoleId: string | null): NextStep {
  const today = getTodayStr();

  // 1. interest 為 null → 先做興趣測驗
  if (data.interest === null) {
    return {
      title: '先花兩分鐘找方向',
      subtitle: '不知道適合什麼？先做興趣測驗',
      ctaLabel: '做興趣測驗',
      ctaHref: '/quiz/interest',
      tone: 'normal',
    };
  }

  // 2. profileGoalRoleId 為 null → 選目標職位
  if (profileGoalRoleId === null) {
    return {
      title: '選一個目標，解鎖專屬路線',
      subtitle: '設定目標職位，藍藍幫你規劃專屬關卡',
      ctaLabel: '去設定目標',
      ctaHref: '/report',
      tone: 'normal',
    };
  }

  // 3. streak.days≥1 且今天還沒完成任何每日任務
  const dailyDoneToday =
    data.daily.date === today && data.daily.doneCodes.length > 0;
  if (data.streak.days >= 1 && !dailyDoneToday) {
    return {
      title: `保住你的 ${data.streak.days} 天連續！完成今天第一個任務`,
      subtitle: '連續挑戰中，今天打個卡',
      ctaLabel: '去今日任務',
      ctaHref: '/island#daily',
      tone: 'urgent',
    };
  }

  // 4. 目前關卡存在且有可對映的 taskCode
  if (data.questLine) {
    const currentPos = getCurrentStage(data.questLine);
    if (currentPos) {
      // 找到對應的 Stage 物件
      const chapter = data.questLine.chapters.find(
        (ch) => ch.stages.some((s) => s.code === currentPos.stageCode)
      );
      const stage = chapter?.stages.find((s) => s.code === currentPos.stageCode);

      if (stage) {
        // 找第一個未完成的 taskCode
        const completedCodes = new Set(
          Object.entries(data.tasks)
            .filter(([, rec]) => rec.count >= 1)
            .map(([code]) => code)
        );
        const firstUnfinished = stage.taskCodes.find((tc) => !completedCodes.has(tc));

        if (firstUnfinished) {
          const href = TASK_HREF[firstUnfinished] ?? '/island';
          return {
            title: `你的下一關：${stage.title}`,
            subtitle: `完成關卡 ${stage.code}，繼續前進`,
            ctaLabel: '去完成關卡',
            ctaHref: href,
            tone: 'normal',
          };
        }
      }
    }
  }

  // 5. 關卡線全破（questLine 存在且 getCurrentStage 回 null）
  if (data.questLine && getCurrentStage(data.questLine) === null) {
    return {
      title: '你已經走完整條路線，去公會分享心得',
      subtitle: '恭喜通關！和同溫層的夥伴交流經驗',
      ctaLabel: '去公會',
      ctaHref: '/guilds',
      tone: 'done',
    };
  }

  // 6. Fallback → 每日任務
  return {
    title: '做今天的每日任務，穩定累積',
    subtitle: '小步前進，每天做一件事',
    ctaLabel: '去今日任務',
    ctaHref: '/island#daily',
    tone: 'normal',
  };
}
