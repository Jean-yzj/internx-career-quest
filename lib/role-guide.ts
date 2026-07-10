// 職位圖鑑內容——面向台灣大學生的「這職位是什麼、怎麼入行」導覽。
// 與 roles.ts（能力題庫/權重）互補：roles.ts 管評分，本檔管「認識這個職位」。
// 口吻範本＝product_manager（Fable 5 親撰）；其餘職位照同深度撰寫。
// 薪資一律標「參考」，台灣實習以時薪或月薪區間表示，不寫死單一數字。

import type { RoleId } from './roles';

export interface RoleGuide {
  roleId: RoleId;
  tagline: string;        // 一句話，比 roles.description 更口語、面向學生
  whatItIs: string;       // 這職位到底在做什麼（2-4 句白話）
  dayInLife: string[];    // 一天大概在做什麼，3-5 條具體場景
  entryPath: string[];    // 學生怎麼一步步入行，3-5 步
  prepare: string[];      // 投實習前要準備什麼，3-5 條
  goodFit: string;        // 適合什麼樣的人（一句）
  salaryNote: string;     // 實習薪資概念，標參考
  misconception?: string; // 常見誤解（加分，可省）
}

export const ROLE_GUIDES: RoleGuide[] = [
  {
    roleId: 'product_manager',
    tagline: '把「使用者的煩惱」變成「團隊要做的功能」',
    whatItIs:
      '產品經理決定一個產品「做什麼、為誰做、為什麼是現在做」。你不寫程式也不畫設計，但要讓工程師、設計師和老闆對同一個目標點頭。學生實習通常從用戶研究、競品分析、寫需求、追數據這些支援型任務開始。',
    dayInLife: [
      '早上看數據儀表板，昨天上線的功能使用率有沒有起來',
      '和工程師開站會，確認這週要出的功能卡在哪一關',
      '訪談兩個使用者，問他們為什麼不用某個功能',
      '下午寫需求文件，把「搜尋不好用」拆成工程師能動手的規格',
      '把老闆臨時想到的點子，用數據評估值不值得做',
    ],
    entryPath: [
      '先做有「產品感」的專案：辦活動、經營社團帳號、做 side project，重點是走完「發現問題→設計解法→看成效」一整圈',
      '補一個硬技能傍身：數據（SQL/GA）或設計（Figma）擇一，PM 不必精通但要能溝通',
      '把做過的專案寫成 case study：問題是什麼、你做了什麼決策、結果的數字',
      '投實習先從「PM 助理／產品營運／專案助理」這類入門缺開始，不用一開始就搶正式 PM',
    ],
    prepare: [
      '一份講「你解決過什麼問題」的履歷，不是「你參加過什麼」的流水帳',
      '至少一個能講五分鐘的產品專案：你的決策、為什麼、結果',
      '基本數據能力：Excel 樞紐分析、看得懂轉換率與留存',
      '想清楚「你想解決哪一類問題」——這是 PM 面試最愛問的',
    ],
    goodFit: '喜歡追問「為什麼」、能同時和很多人合作、看到爛體驗會忍不住想怎麼改的人',
    salaryNote: '台灣 PM 實習多為月薪 3–4 萬（全職）或時薪 200–250（兼職），依公司規模差異大，僅供參考',
    misconception: 'PM 不是「管工程師的官」，沒有實權，靠的是把事情想清楚、讓大家願意一起做',
  },
  // ── 以下 9 職位為占位，待 agent 照 PM 範本補完同等深度 ──
  {
    roleId: 'business_analyst',
    tagline: '用數據和邏輯，幫公司找出「該往哪走」',
    whatItIs: '商業分析師透過數據分析與商業洞察協助決策，擅長用 Excel/SQL 拆解問題、製作報告。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'marketing',
    tagline: '讓對的人，看見這個品牌',
    whatItIs: '行銷企劃規劃活動與內容、經營社群、分析成效，讓品牌被更多人看見。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'hr',
    tagline: '把對的人，帶進對的組織',
    whatItIs: '人資負責招募、員工關係、教育訓練與雇主品牌，是組織與人才之間的橋梁。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'business_dev',
    tagline: '公司對外的最前線，把機會變成合作',
    whatItIs: '業務開發開拓合作夥伴、洽談合約、推動成長，是公司對外最前線的角色。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'consultant',
    tagline: '把複雜的商業難題，拆成可以動手的答案',
    whatItIs: '顧問用結構化方法拆解商業問題，產出可行建議，與客戶協作推動改變。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'software_eng',
    tagline: '用程式碼，把想法變成能用的東西',
    whatItIs: '軟體工程師設計、開發、測試軟體系統，用程式碼解決實際問題。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'data_analyst',
    tagline: '從一堆數字裡，找出商業要聽的故事',
    whatItIs: '數據分析師蒐集、清理、分析數據，用視覺化報告驅動商業決策。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'ux_researcher',
    tagline: '替使用者發聲，讓產品決策有依據',
    whatItIs: 'UX 研究員用訪談、問卷、可用性測試了解使用者，把洞察轉化為設計決策。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
  {
    roleId: 'finance',
    tagline: '在數字裡看懂一家公司、一個市場',
    whatItIs: '金融實習協助財務分析、市場研究、投資評估，在金融機構累積實務經驗。',
    dayInLife: [],
    entryPath: [],
    prepare: [],
    goodFit: '',
    salaryNote: '',
  },
];

export function getRoleGuide(roleId: string): RoleGuide | undefined {
  return ROLE_GUIDES.find((g) => g.roleId === roleId);
}
