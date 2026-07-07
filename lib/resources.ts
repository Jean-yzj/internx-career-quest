/**
 * lib/resources.ts — Agent E 擁有
 * 階段資源層（Stage Resources）v1.3
 * 策展日期：2026-07-07
 *
 * 查找順序：精確 role+stage → track+stage → 通用(*)
 * 回傳 ≤ 4 條（article/video ≤2 + guide 1 + club 適時）
 * 2026-07-08：接入其餘 9 職位（batch-a 商管 5、batch-b 技術 4），全部 URL 驗證過
 */

import { BATCH_A_ENTRIES } from './resources-batch-a';
import { BATCH_B_ENTRIES } from './resources-batch-b';

export interface StageResource {
  type: 'article' | 'video' | 'guide' | 'club';
  title: string;
  url?: string;   // guide/club 可無 url
  note: string;   // 一句話：為什麼此階段要看這個
  roles?: string[]; // 空=通用；否則限定 roleId
}

// key: `${trackId}:${stageCode}` 或 `*:${stagePrefix}` 或 `*:*`
type ResourceMap = Record<string, StageResource[]>;

// ──────────────────────────────────────────────
// PM（product_manager）三軌精選資源
// ──────────────────────────────────────────────

// 探索章 (0-x) ——適用 explorer/builder/sprint 任一軌
const PM_EXPLORE_RESOURCES: StageResource[] = [
  {
    type: 'article',
    title: '一次搞懂產品經理：你說的 PM 是哪種',
    url: 'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
    note: '台灣最多人引用的 PM 入門文，搞清楚 Product Manager vs Project Manager 再決定方向',
    roles: ['product_manager'],
  },
  {
    type: 'article',
    title: '【職業開箱】PM 是什麼？工作內容、薪水、必備能力全面解析',
    url: 'https://www.yourator.co/articles/263',
    note: 'Yourator 整理的台灣 PM 職位實況，一頁掌握日常工作樣貌與薪資區間',
    roles: ['product_manager'],
  },
  {
    type: 'club',
    title: '探索期加入什麼社群：先觀察再投入',
    note: '這階段不急著入會：先旁聽「商業思維學院」免費直播、追蹤 3PM LAB Medium 文章；觀察自己對「定義問題＋協調團隊」有沒有感覺，再決定要不要深入走 PM',
    roles: ['product_manager'],
  },
];

// Explorer 軌 PM 資源（年級 y1/y2，goalRoleId=product_manager）
const PM_EXPLORER_RESOURCES: ResourceMap = {
  // 第 1 章：認識自己
  'explorer:1-1': [
    ...PM_EXPLORE_RESOURCES.slice(0, 2),
  ],
  'explorer:1-2': [
    {
      type: 'article',
      title: '產品經理需要懂技術嗎？',
      url: 'https://medium.com/3pm-lab/do-you-need-technical-knowledge-to-be-a-product-manager-b6054eab14d2',
      note: '釐清 PM 技術門檻的迷思，幫你評估自己目前的背景夠不夠格',
      roles: ['product_manager'],
    },
    {
      type: 'club',
      title: '現在可以做的事',
      note: '找一個你用過的 app，寫下「它解決了我哪個問題、還有哪裡可以做得更好」——這就是 PM 思維的第一步',
      roles: ['product_manager'],
    },
  ],
  'explorer:1-3': [
    {
      type: 'article',
      title: '6 步驟打造專業 LinkedIn 個人主頁，讓 HR 主動聯繫你',
      url: 'https://jason-career.com/linkedin/',
      note: '學生 LinkedIn 的完整設定教學，照著做一遍就有基礎人脈展示頁',
      roles: ['product_manager'],
    },
    {
      type: 'guide',
      title: 'PM 方向的 LinkedIn 怎麼寫 Headline',
      note: '學生 Headline 建議格式：「[科系] @ [學校] | 對 [產品類型] 有興趣 | 尋找 PM 實習」。About 段落寫你最近在做什麼 side project 或課堂專案，比「對 PM 有興趣」有說服力 10 倍',
      roles: ['product_manager'],
    },
  ],
  'explorer:1-4': [
    {
      type: 'article',
      title: '一次搞懂產品經理（3PM LAB）',
      url: 'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
      note: '讀完這篇，你就能判斷「PM 心得文」在說的是哪種 PM，避免看了一堆卻比較了蘋果和橘子',
      roles: ['product_manager'],
    },
  ],
  // 第 2 章：踏出第一步
  'explorer:2-1': [
    {
      type: 'club',
      title: '對 PM 有用的社團類型建議',
      note: '優先順序：(1) 學校創業社/商業個案社——練習定義問題與說服他人；(2) 黑客松組隊——當隊上第一個喊「我們要解決什麼問題」的人；(3) 產品讀書會（FB 搜尋「PM 讀書會 台灣」）；社團活動重點不是加入多少，是你在裡面有沒有「帶過什麼東西」',
      roles: ['product_manager'],
    },
    {
      type: 'article',
      title: '身為團隊第一個 PM 好難！辛酸血淚史與生存之道',
      url: 'https://medium.com/3pm-lab/challenges-of-being-the-first-product-manager-62e64eb08b69',
      note: '提前看懂 PM 在真實工作環境的困境，社團裡試著扮演「第一個提問題的人」就是練習',
      roles: ['product_manager'],
    },
  ],
  'explorer:2-2': [
    {
      type: 'article',
      title: '產品經理學習資源分享——從新手到老鳥的自我提升之路（3PM LAB）',
      url: 'https://medium.com/3pm-lab/professional-resources-for-product-managers-5a12e0c89332',
      note: '活動推薦就在這篇裡：列出了台灣 PM 社群、讀書會、Podcast，找你有興趣的場次先報名一場',
      roles: ['product_manager'],
    },
  ],
  'explorer:2-3': [
    {
      type: 'guide',
      title: '訪談 PM 學長姐的 3 個問題',
      note: '問這三題就夠了：(1) 你的 PM 一天從早到晚大概在做什麼？(2) 找第一份 PM 工作最難的是什麼？(3) 如果重來，你大學時會先做哪件事？問完後把答案整理成一段話，寫進你的戰情室筆記',
      roles: ['product_manager'],
    },
  ],
  // 第 3 章：小試身手
  'explorer:3-1': [
    {
      type: 'guide',
      title: '學生 PM 的「小型實作」可以是什麼',
      note: '不需要上線的產品：(1) 寫一份 App 的 teardown——描述它解決的問題、列出你覺得可以改善的 3 個地方、畫出你的改版草稿；(2) 對你身邊 5 個人做訪談，寫成一頁用戶洞察；這種學習型 case study 比「我幫朋友做了個網頁」更能展現 PM 思維',
      roles: ['product_manager'],
    },
  ],
  'explorer:3-2': [
    {
      type: 'article',
      title: '【PM 產品經理 - 履歷範本】如何把 PM 能力漂亮展現在工作經歷上',
      url: 'https://nabi.104.com.tw/posts/nabi_post_66b91c18-bb52-4747-8381-cf96ae424e38',
      note: '看這份範本的結構，把你的社團/課堂專案套進「動詞 + 行動 + 量化結果」格式，即使無工作經驗也能寫出有說服力的條目',
      roles: ['product_manager'],
    },
  ],
  // 第 4 章：定下方向
  'explorer:4-1': [],
  'explorer:4-2': [
    {
      type: 'article',
      title: '一份好履歷怎麼寫？10 分鐘完成人資最愛履歷表',
      url: 'https://www.yourator.co/articles/152',
      note: 'Yourator 的通用履歷架構，PM 方向的人把「專案」放在學歷前面，比放在後面的點閱率高很多',
      roles: ['product_manager'],
    },
  ],
  'explorer:4-3': [
    {
      type: 'guide',
      title: '大三前的 PM 一學期行動計畫',
      note: '三個具體目標：(1) 完成 1 份有訪談的 case study；(2) 參加至少 1 場黑客松或商業個案競賽；(3) 在 LinkedIn 貼出 1 篇你對某個 app 的改版分析。這三件事的組合，是台灣 PM 實習申請裡最基本的作品集門檻',
      roles: ['product_manager'],
    },
  ],
};

// Builder 軌 PM 資源（年級 y3/grad，goalRoleId=product_manager）
const PM_BUILDER_RESOURCES: ResourceMap = {
  // 第 1 章：定位自己
  'builder:1-0': [ // 可能有 exp_inventory 前插的 0 關
    {
      type: 'guide',
      title: '把你的「非 PM 經歷」轉譯成 PM 語言',
      note: '社團活動、課程專案、工讀經驗——任何你做過的事，用「我負責的是什麼、遇到什麼問題、我怎麼解決、結果怎樣」四句話整理，這就是 PM 面試的素材原料',
      roles: ['product_manager'],
    },
  ],
  'builder:1-1': [
    {
      type: 'article',
      title: '一次搞懂產品經理（3PM LAB）',
      url: 'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
      note: '先搞清楚你想做的是哪種 PM，能力測驗的結果才有意義可以對應',
      roles: ['product_manager'],
    },
  ],
  'builder:1-2': [
    {
      type: 'article',
      title: '【PM 產品經理 - 履歷範本】如何把 PM 能力漂亮展現在工作經歷上',
      url: 'https://nabi.104.com.tw/posts/nabi_post_66b91c18-bb52-4747-8381-cf96ae424e38',
      note: '看這份範本的「量化成果」寫法，準備 AI 分析前先把你的經歷套進這個格式',
      roles: ['product_manager'],
    },
    {
      type: 'guide',
      title: '學生 PM 履歷的量化公式',
      note: '公式：動詞 ＋ 做了什麼 ＋ 達到什麼數字（用戶數/完成率/節省時間） ＋ 對誰有好處。沒有漂亮數字沒關係，寫「透過訪談 8 位用戶，整理出 3 個核心痛點」一樣是量化',
      roles: ['product_manager'],
    },
  ],
  'builder:1-3': [
    {
      type: 'article',
      title: '6 步驟打造專業 LinkedIn 個人主頁',
      url: 'https://jason-career.com/linkedin/',
      note: 'LinkedIn 對 PM 求職的轉換率比 104/Yourator 高，建好主頁後 HR 會主動來找你',
      roles: ['product_manager'],
    },
  ],
  // 第 2 章：履歷工坊
  'builder:2-1': [
    {
      type: 'article',
      title: '一份好履歷怎麼寫？10 分鐘完成人資最愛履歷表',
      url: 'https://www.yourator.co/articles/152',
      note: '對照你的 AI 分析建議，把修改幅度最大的那一段按這篇的結構重寫',
      roles: ['product_manager'],
    },
  ],
  'builder:2-2': [
    {
      type: 'guide',
      title: '量化成果的三層寫法',
      note: '第一層（有數字）：「提升用戶留存 15%」；第二層（有規模）：「訪談 12 位用戶、分析 500 筆回饋」；第三層（有對比）：「上線後 NPS 從 32 提升至 61」。學生通常只能到第二層，這樣就夠了',
      roles: ['product_manager'],
    },
  ],
  'builder:2-3': [
    {
      type: 'guide',
      title: 'PM 作品集（Case Study）的結構',
      note: '一篇 case study 只需要五段：(1) 我要解決什麼問題（附用戶引言）；(2) 我怎麼研究的（方法+人數）；(3) 我做了什麼決定和為什麼；(4) 結果是什麼（任何可量化的指標）；(5) 我學到什麼。用 Notion 公開頁面或 Medium 發布，就是你的作品集連結',
      roles: ['product_manager'],
    },
  ],
  // 第 3 章：經歷補強
  'builder:3-1': [
    {
      type: 'club',
      title: '準備期參加什麼活動最值得',
      note: '首選：商業個案競賽（如 ICAN 個案競賽、各校 Business Competition）——練習定義問題與說服評審，和 PM 面試要求高度重疊；次選：黑客松——你主動提問題、別人幫你做產品，練習的是需求定義和優先排序；一場活動打磨一個故事，比參加 5 場卻說不清楚更值錢',
      roles: ['product_manager'],
    },
  ],
  'builder:3-2': [
    {
      type: 'article',
      title: '產品經理學習資源分享（3PM LAB）',
      url: 'https://medium.com/3pm-lab/professional-resources-for-product-managers-5a12e0c89332',
      note: '這篇列出了 PM 推薦書單、線上課程、社群——選一項完成即為本關的「學習資源」',
      roles: ['product_manager'],
    },
  ],
  'builder:3-3': [
    {
      type: 'guide',
      title: '如何在黑客松或課程中扮演「PM 角色」',
      note: '主動做這三件事：(1) 在討論開始時問「我們要解決誰的什麼問題」；(2) 整理討論後寫出一份半頁的功能清單，標出優先序；(3) 在報告時負責說明「用戶洞察」的部分。這三件事就是你履歷上「擔任 PM 角色」的具體依據',
      roles: ['product_manager'],
    },
  ],
  'builder:3-4': [
    {
      type: 'guide',
      title: '和 PM 前輩 Coffee Chat 的問法',
      note: '問這三題就夠了：(1) 你們公司 PM 一週的工作，最耗時的是哪個環節？(2) 實習 PM 最容易犯什麼錯？(3) 你當初的履歷有什麼和別人不一樣的地方？把答案整理好，寫進你的 case study 背景脈絡裡',
      roles: ['product_manager'],
    },
  ],
  // 第 4 章：投遞啟動
  'builder:4-1': [
    {
      type: 'article',
      title: 'LinkedIn 找工作有效嗎？3 大領英經營技巧建立「弱連結」',
      url: 'https://www.yourator.co/articles/166',
      note: '職缺不只在求職網站——從 LinkedIn 弱連結找到的 PM 實習機會更容易拿到面試',
      roles: ['product_manager'],
    },
  ],
  'builder:4-2': [
    {
      type: 'article',
      title: 'PM 面試常見問題｜Product Manager 面試準備（大大帶我飛）',
      url: 'https://www.dada-fly.com/tw/career/pm-interview-questions',
      note: '投出第一份前先把這篇讀完——不是要你背，是要你知道面試官在評估什麼',
      roles: ['product_manager'],
    },
  ],
  'builder:4-3': [
    {
      type: 'article',
      title: 'PM 面試怎麼準備？5 大關卡完整攻略（Product Sense / 數據 / Execution）',
      url: 'https://www.dada-fly.com/tw/blog/pm-interview-preparation-guide-product-sense-analytical-thinking-execution',
      note: '一週回顧用這篇：比對你這週投遞的公司，對應到 5 大關卡各準備一個故事',
      roles: ['product_manager'],
    },
  ],
};

// Sprint 軌 PM 資源（年級 y4/fresh，goalRoleId=product_manager）
const PM_SPRINT_RESOURCES: ResourceMap = {
  // 第 1 章：快速定位
  'sprint:1-0': [
    {
      type: 'guide',
      title: '把過去的「雜經歷」快速轉為 PM 素材',
      note: '列出你最近 3 年做過最有成就感的 3 件事，對每件事問：「我解決了誰的什麼問題？用什麼方法？有什麼結果？」這就是 PM 面試 Behavioral Question 的原料',
      roles: ['product_manager'],
    },
  ],
  'sprint:1-1': [
    {
      type: 'article',
      title: '一次搞懂產品經理（3PM LAB）',
      url: 'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
      note: '確認你要投的是 Product Manager 而非 Project Manager，兩者面試考法截然不同',
      roles: ['product_manager'],
    },
  ],
  'sprint:1-2': [
    {
      type: 'article',
      title: '【PM 產品經理 - 履歷範本】如何把 PM 能力展現在工作經歷上',
      url: 'https://nabi.104.com.tw/posts/nabi_post_66b91c18-bb52-4747-8381-cf96ae424e38',
      note: '先看這份範本，再做 AI 分析——看懂好履歷長什麼樣，分析結果才看得懂',
      roles: ['product_manager'],
    },
  ],
  // 第 2 章：履歷衝刺
  'sprint:2-1': [
    {
      type: 'article',
      title: '一份好履歷怎麼寫？10 分鐘完成人資最愛履歷表',
      url: 'https://www.yourator.co/articles/152',
      note: '先按這篇架構把整份履歷重寫一遍，再回來補量化數字',
      roles: ['product_manager'],
    },
    {
      type: 'guide',
      title: '衝刺期的重寫邏輯',
      note: '最重要的一段永遠放第一位：PM 投履歷，把「最能展現 PM 思維的專案」放在學歷前；每一條工作/專案條目只留「問題+方法+結果」，把所有形容詞刪掉',
      roles: ['product_manager'],
    },
  ],
  'sprint:2-2': [
    {
      type: 'guide',
      title: 'PM 作品集最低可行版本',
      note: '來不及做完整 case study 的話：用 Notion 建一頁公開分享頁面，寫一個你用過的 app 的「改版提案」——問題定義 + 你的解法 + 你猜測改完後的指標變化。這一頁比什麼都沒有有說服力',
      roles: ['product_manager'],
    },
  ],
  // 第 3 章：火力投遞
  'sprint:3-1': [
    {
      type: 'article',
      title: 'LinkedIn 找工作有效嗎？3 大領英經營技巧',
      url: 'https://www.yourator.co/articles/166',
      note: '職缺不夠就靠弱連結——比其他人都更積極地用 LinkedIn 觸達 PM 和 HR',
      roles: ['product_manager'],
    },
  ],
  'sprint:3-2': [
    {
      type: 'article',
      title: 'PM 面試怎麼準備？5 大關卡完整攻略（大大帶我飛）',
      url: 'https://www.dada-fly.com/tw/blog/pm-interview-preparation-guide-product-sense-analytical-thinking-execution',
      note: '投出首份前花 30 分鐘讀完，知道 Product Sense / Analytical / Behavioral 三關各要準備什麼',
      roles: ['product_manager'],
    },
    {
      type: 'article',
      title: '【PM 面試問題】給菜鳥 PM 的 10 大類、70 題考前猜題（104職場力）',
      url: 'https://blog.104.com.tw/product-manager-interview-questions/',
      note: '不用全部準備，挑「你最弱的 2 個大類」各練 3 題，比什麼都練一遍更有效',
      roles: ['product_manager'],
    },
  ],
  'sprint:3-3': [
    {
      type: 'guide',
      title: '記錄面試後的 3 個問題',
      note: '每場面試結束後立刻寫下：(1) 哪道題你覺得沒回答好，為什麼？(2) 面試官追問了什麼，你有沒有準備到？(3) 你對這家公司 PM 工作的理解有沒有改變？這三個問題累積下來，就是你面試複盤的數據',
      roles: ['product_manager'],
    },
  ],
  // 第 4 章：覆盤與分享
  'sprint:4-1': [
    {
      type: 'article',
      title: 'PM 面試常見問題（大大帶我飛）',
      url: 'https://www.dada-fly.com/tw/career/pm-interview-questions',
      note: '週回顧用這篇：對照這週面試的題目，確認哪些是你的弱點，下週專攻',
      roles: ['product_manager'],
    },
  ],
  'sprint:4-2': [],
};

// ──────────────────────────────────────────────
// 通用資源（所有非 PM 職位，以及通用關卡）
// ──────────────────────────────────────────────

const GENERIC_RESOURCES_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '【職業開箱】PM 是什麼？各職位工作內容全面解析',
    url: 'https://www.yourator.co/articles/263',
    note: '認識不同職位的日常工作樣貌，幫助你比較與選擇',
  },
];

const GENERIC_RESOURCES_RESUME: StageResource[] = [
  {
    type: 'article',
    title: '一份好履歷怎麼寫？10 分鐘完成人資最愛履歷表',
    url: 'https://www.yourator.co/articles/152',
    note: '通用履歷架構，任何職位都適用的基礎版本',
  },
  {
    type: 'guide',
    title: '先設定目標職位，解鎖專屬導讀',
    note: '到個人頁選一個目標職位，這裡就會換成該職位的履歷寫法、社群建議與面試攻略。',
  },
];

const GENERIC_RESOURCES_LINKEDIN: StageResource[] = [
  {
    type: 'article',
    title: '6 步驟打造專業 LinkedIn 個人主頁，讓 HR 主動聯繫你',
    url: 'https://jason-career.com/linkedin/',
    note: '任何職位都適用的 LinkedIn 設定教學，建好之後 HR 才找得到你',
  },
  {
    type: 'article',
    title: 'LinkedIn 找工作有效嗎？3 大領英經營技巧',
    url: 'https://www.yourator.co/articles/166',
    note: '學會用弱連結找職缺，比只靠求職網站多 3 倍機會',
  },
];

const GENERIC_RESOURCES_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '一份好履歷怎麼寫？10 分鐘完成人資最愛履歷表',
    url: 'https://www.yourator.co/articles/152',
    note: '投遞前再確認一次履歷格式，確保第一眼就能抓住 HR 目光',
  },
  {
    type: 'guide',
    title: '先設定目標職位，解鎖面試攻略',
    note: '到個人頁選一個目標職位，這裡就會換成該職位的面試常見題與練習法。',
  },
];

// ──────────────────────────────────────────────
// 合併所有 PM key 到一個 map
// ──────────────────────────────────────────────

// 其餘 9 職位的三段 key map（roleId:trackId:stageCode）
const EXTRA_ROLE_MAP: ResourceMap = { ...BATCH_A_ENTRIES, ...BATCH_B_ENTRIES };

const PM_RESOURCE_MAP: ResourceMap = {
  // 探索章（任何軌都可能出現 0-x 關）
  'explorer:0-1': PM_EXPLORE_RESOURCES,
  'explorer:0-2': PM_EXPLORE_RESOURCES,
  'explorer:0-3': PM_EXPLORE_RESOURCES,
  'builder:0-1': PM_EXPLORE_RESOURCES,
  'builder:0-2': PM_EXPLORE_RESOURCES,
  'builder:0-3': PM_EXPLORE_RESOURCES,
  'sprint:0-1': PM_EXPLORE_RESOURCES,
  'sprint:0-2': PM_EXPLORE_RESOURCES,
  'sprint:0-3': PM_EXPLORE_RESOURCES,
  ...PM_EXPLORER_RESOURCES,
  ...PM_BUILDER_RESOURCES,
  ...PM_SPRINT_RESOURCES,
};

// ──────────────────────────────────────────────
// 查找函式：getStageResources
// ──────────────────────────────────────────────

/**
 * 取得指定關卡的精選資源（≤ 4 條）
 * 查找順序：
 *   1. `${trackId}:${stageCode}` + roleId 篩選
 *   2. `${trackId}:${stageCode}` 通用
 *   3. 通用資源（依 stageCode 分類）
 *
 * @param trackId   - 'explorer' | 'builder' | 'sprint'
 * @param stageCode - e.g. '1-1', '2-3', '0-2'
 * @param goalRoleId - 目標職位 id（可為 null）
 */
export function getStageResources(
  trackId: 'explorer' | 'builder' | 'sprint',
  stageCode: string,
  goalRoleId: string | null,
): StageResource[] {
  const key = `${trackId}:${stageCode}`;

  // 1. PM 精確命中（兩段 key：trackId:stageCode）
  if (goalRoleId === 'product_manager' && PM_RESOURCE_MAP[key]) {
    const items = PM_RESOURCE_MAP[key];
    if (items.length > 0) return items.slice(0, 4);
  }

  // 1b. 其餘 9 職位精確命中（三段 key：roleId:trackId:stageCode）
  if (goalRoleId) {
    const roleItems = EXTRA_ROLE_MAP[`${goalRoleId}:${key}`];
    if (roleItems && roleItems.length > 0) return roleItems.slice(0, 4);
  }

  // 2. 未設目標職位，或該職位此關無專屬條目：回通用組
  const chapterNum = parseInt(stageCode.split('-')[0] ?? '0', 10);
  const stageNum = parseInt(stageCode.split('-')[1] ?? '0', 10);

  // 探索章（0-x）：通用探索
  if (chapterNum === 0) return GENERIC_RESOURCES_EXPLORE.slice(0, 4);

  // 第 1 章：定位/認識自己
  if (chapterNum === 1) {
    if (stageNum <= 1) return GENERIC_RESOURCES_EXPLORE.slice(0, 4);
    return GENERIC_RESOURCES_LINKEDIN.slice(0, 4);
  }

  // 第 2 章：履歷/踏出第一步
  if (chapterNum === 2) return GENERIC_RESOURCES_RESUME.slice(0, 4);

  // 第 3 章以後：面試/投遞
  return GENERIC_RESOURCES_INTERVIEW.slice(0, 4);
}

/** 取得所有定義的資源 URL 列表（供 verify-resources.mjs 使用） */
export function getAllResourceUrls(): string[] {
  const urls: string[] = [];
  const allMaps = [PM_RESOURCE_MAP];
  const allGenerics = [
    ...GENERIC_RESOURCES_EXPLORE,
    ...GENERIC_RESOURCES_RESUME,
    ...GENERIC_RESOURCES_LINKEDIN,
    ...GENERIC_RESOURCES_INTERVIEW,
  ];

  for (const map of allMaps) {
    for (const resources of Object.values(map)) {
      for (const r of resources) {
        if (r.url && !urls.includes(r.url)) urls.push(r.url);
      }
    }
  }
  for (const r of allGenerics) {
    if (r.url && !urls.includes(r.url)) urls.push(r.url);
  }
  return urls;
}
