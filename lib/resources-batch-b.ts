/**
 * lib/resources-batch-b.ts — Batch B（Agent F 策展）
 * 職位：software_eng / data_analyst / ux_researcher / hr
 * 策展日期：2026-07-08
 *
 * 整合說明（一行 spread）：
 *   import { BATCH_B_ENTRIES } from './resources-batch-b';
 *   const COMBINED_MAP = { ...PM_RESOURCE_MAP, ...BATCH_B_ENTRIES };
 *
 * Key 格式：`${roleId}:${trackId}:${stageCode}`
 * 與 PM_RESOURCE_MAP 的 `${trackId}:${stageCode}` 格式不同，不會 key 衝突。
 * 整合者在 getStageResources 函式裡，若 goalRoleId !== 'product_manager'，
 * 額外查找 `${goalRoleId}:${trackId}:${stageCode}` 即可命中本批次資源。
 *
 * StageResource.roles 欄位同步設定，方便整合者如需 flatten 合併也能按 role 篩選。
 */

import type { StageResource } from './resources';

type ResourceMap = Record<string, StageResource[]>;

// ══════════════════════════════════════════════
// 1. SOFTWARE_ENG（軟體工程）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼 */
const SWE_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '【職業開箱】認識軟體工程師：前端、後端、全端、AI、區塊鏈…工作內容、薪水、技術能力',
    url: 'https://www.yourator.co/articles/283',
    note: '一篇看懂軟體工程師各次專業的日常分工，選方向前先讀完，比盲目投 CV 有效 10 倍',
    roles: ['software_eng'],
  },
  {
    type: 'article',
    title: '深度剖析 Pinkoi 工程文化：解密提升效率的關鍵秘訣',
    url: 'https://www.yourator.co/articles/235',
    note: '台灣知名電商設計公司的真實工程生態，看懂「好的工程文化」長什麼樣，再對照自己想去的公司',
    roles: ['software_eng'],
  },
  {
    type: 'club',
    title: '探索期社群建議：先觀察再投入',
    note: '這階段不急著學技術：在 GitHub 上追蹤幾個你覺得酷的開源專案，或報名 SITCON 年會旁聽——觀察台灣工程師社群的氛圍，確認自己對「解決技術問題」有沒有持續的熱情再深入',
    roles: ['software_eng'],
  },
];

/** 準備期：GitHub、side project、學生履歷 */
const SWE_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '為你自己學 Git',
    url: 'https://gitbook.tw/',
    note: '台灣最多人推薦的中文 Git 免費電子書，工程師履歷沒有 GitHub 等於沒有入場券，先把 Git 基礎學會',
    roles: ['software_eng'],
  },
  {
    type: 'article',
    title: 'Coding Interview University — 完整 CS 自學路線圖 (EN)',
    url: 'https://github.com/jwasham/coding-interview-university',
    note: '全球最多星的 CS 學習清單，從零到能面試的完整路線，選你缺的章節補強即可，不需要全部過',
    roles: ['software_eng'],
  },
  {
    type: 'guide',
    title: '學生 SWE 履歷的兩個核心：GitHub 與 Side Project',
    note: '沒有工作經驗沒關係，但沒有 GitHub 很難過 HR 篩選。做法：(1) 把課堂作業整理上 GitHub，加 README 說明「這個專案解決什麼問題」；(2) 做一個能跑的小工具（爬蟲、Line Bot、CLI 工具都算），重點是能說清楚技術選型和遇到的困難；(3) 履歷每個技術項目旁邊都要有對應的 repo 連結',
    roles: ['software_eng'],
  },
  {
    type: 'guide',
    title: '工程師履歷必填欄位與禁忌',
    note: '必填：GitHub 連結、技術棧（具體框架版本，不要只寫「Python」）、每個專案你做了什麼（不是「參與了什麼」）。禁忌：空的 GitHub profile、技術棧只寫「熟悉」但沒有附作品連結',
    roles: ['software_eng'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：程式設計社或黑客松社群（SITCON、各校 ACM/ICPC 隊），練習用 Git 協作和 code review；次選：找一個開源專案送一個小 PR（修文件或 typo 都算），這就是你在 GitHub 上有「真實貢獻」的紀錄',
    roles: ['software_eng'],
  },
];

/** 投遞面試期：LeetCode 策略與 behavioral */
const SWE_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '工程師面試：切記履歷別「亂槍打鳥」，把握自我介紹的 10 分鐘推銷自己',
    url: 'https://blog.104.com.tw/engineer-resume/',
    note: '面試官視角的工程師面試攻略，從履歷投遞到當場自我介紹的完整建議，送出 CV 前花 15 分鐘讀完',
    roles: ['software_eng'],
  },
  {
    type: 'article',
    title: '套入 6W2H 法，快速演練面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: 'Behavioral question（「說一個你解決困難的故事」）就用這個框架整理 side project 經驗，回答不脫軌',
    roles: ['software_eng'],
  },
  {
    type: 'guide',
    title: 'LeetCode 面試準備策略（台灣學生版）',
    note: '台灣科技公司實習面試通常考：陣列/字串操作（Easy-Medium）、BFS/DFS 基礎、HashMap 應用。做法：先把 NeetCode 150 前 50 題做完，每題花 20 分鐘想，想不出來再看解答並親手寫一遍；準備好你做過的題目清單截圖，面試時能展示',
    roles: ['software_eng'],
  },
];

// ══════════════════════════════════════════════
// 2. DATA_ANALYST（數據分析）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼 */
const DATA_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '數據分析師工作內容是什麼？薪水高嗎？技術能力與職涯發展指南',
    url: 'https://blog.104.com.tw/data-analyst/',
    note: '一頁看懂數分日常工作、薪資區間、需要哪些工具，對這個職位有感覺之後再去看更深的技術文章',
    roles: ['data_analyst'],
  },
  {
    type: 'article',
    title: '【職業開箱】認識商業分析師與數據分析師的 9 大差異',
    url: 'https://www.yourator.co/articles/340',
    note: 'DA 和 BA 常被搞混，這篇把兩者的職責、工具、思考角度拆開比較，選方向前必讀，避免投錯職位',
    roles: ['data_analyst'],
  },
  {
    type: 'article',
    title: '用數據與商業智慧驅動光速成長——專訪台灣蝦皮 BI Manager Aaron',
    url: 'https://www.yourator.co/articles/188',
    note: '台灣電商數據職位的真實樣貌：看懂業界 DA 如何用數字支持決策，比讀職位定義文字更有感',
    roles: ['data_analyst'],
  },
  {
    type: 'club',
    title: '探索期建議：先動手跑一次資料',
    note: '去 Kaggle 找一個你有興趣的資料集，用 Excel 或 Google Sheets 做一個 pivot table，觀察自己有沒有「想繼續往下挖」的衝動——有的話，數分方向值得認真考慮；可以加入學校的資料分析社或 Kaggle 讀書會',
    roles: ['data_analyst'],
  },
];

/** 準備期：分析專案、SQL、Python */
const DATA_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '面試官給「數據分析」新鮮人的求職指南：履歷怎麼寫最吃香？',
    url: 'https://blog.104.com.tw/data-analyst-resume/',
    note: '面試官第一人稱寫的數分新鮮人履歷攻略，告訴你沒有工作經驗時哪些東西可以放、哪些放了反而扣分',
    roles: ['data_analyst'],
  },
  {
    type: 'article',
    title: '為了更接近數據分析：自學 SQL 過來人的 2 大心得',
    url: 'https://blog.104.com.tw/sql/',
    note: 'SQL 是數分面試第一關，這篇講「怎麼學才有效」而不只是語法清單，適合從零開始的學生照著走',
    roles: ['data_analyst'],
  },
  {
    type: 'article',
    title: 'Kaggle Learn — 免費課程（Python / SQL / Data Visualization）(EN)',
    url: 'https://www.kaggle.com/learn',
    note: '最快建立數分作品集的方法：做完 Kaggle 的 SQL 和 Pandas 課程，每個課程都有練習 notebook，做完就是你的分析作品',
    roles: ['data_analyst'],
  },
  {
    type: 'guide',
    title: '數分學生的分析作品集：最低可行版本',
    note: '一份完整的分析作品只需要三件事：(1) 你選了什麼資料、為什麼有趣；(2) 你發現了什麼洞察（至少一張圖＋一句話說明）；(3) 你的結論和建議。用 Kaggle Notebook 或 Google Colab 公開分享連結就能放進履歷',
    roles: ['data_analyst'],
  },
  {
    type: 'guide',
    title: '數分履歷的三個重點欄位',
    note: '技術棧寫具體：不只寫「Python」，要寫「Python（Pandas、Matplotlib）、SQL（PostgreSQL 或 BigQuery）、Tableau 或 Power BI」。專案條目用「分析了什麼 → 發現什麼 → 建議或結果」三行寫。如果有 Kaggle competition 參賽記錄（哪怕是入門競賽）放上去比沒有好',
    roles: ['data_analyst'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：學校資料分析社或 Kaggle 讀書會——能夠跟人一起做分析練習比單打獨鬥進步快；次選：報名一場 Kaggle 入門競賽（Titanic 或 House Prices），把過程整理成 notebook 分享，就是作品集',
    roles: ['data_analyst'],
  },
];

/** 投遞面試期：SQL 考題、case study */
const DATA_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '為了更接近數據分析：自學 SQL 過來人的 2 大心得',
    url: 'https://blog.104.com.tw/sql/',
    note: '投遞前確認 SQL 能力：GROUP BY、JOIN、Window Function 是台灣數分面試最常考三類，這篇幫你確認學習有沒有到位',
    roles: ['data_analyst'],
  },
  {
    type: 'article',
    title: '面試官給「數據分析」新鮮人的求職指南',
    url: 'https://blog.104.com.tw/data-analyst-resume/',
    note: '同篇裡有面試常見問題整理，投出 CV 後讀這部分準備「你如何從資料中找到洞察」這類開放題',
    roles: ['data_analyst'],
  },
  {
    type: 'guide',
    title: '數分面試的三種考法與準備方式',
    note: '台灣數分面試通常考三種：(1) SQL 上機題（把 LeetCode Database Easy-Medium 題練一遍）；(2) Case study（給你一個業務問題，你說怎麼用資料回答）；(3) 作品集 walk-through（帶面試官走過你的分析，「為什麼選這個指標」比結果更重要）',
    roles: ['data_analyst'],
  },
];

// ══════════════════════════════════════════════
// 3. UX_RESEARCHER（UX 研究）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼 */
const UXR_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '美國 UX 設計師面試流程｜面試經驗分享',
    url: 'https://blog.104.com.tw/ux-designer/',
    note: '一個實際做過 UX 面試的人怎麼描述這份工作，從從業者視角理解 UXR 的日常思維比讀 JD 更有感',
    roles: ['ux_researcher'],
  },
  {
    type: 'article',
    title: '求職作品集怎麼做？掌握 6 要點，非設計背景也能打造精彩作品集',
    url: 'https://www.yourator.co/articles/200',
    note: 'UXR 的核心入場券是研究作品集，這篇告訴你作品集的結構邏輯，非設計背景的學生也能照著做',
    roles: ['ux_researcher'],
  },
  {
    type: 'club',
    title: '探索期建議：找你的第一個研究問題',
    note: '不需要工具或預算：找 5 個朋友問 15 分鐘「你最近用過什麼 app、哪裡最困惑」，把答案整理成半頁訪談筆記——這就是 UX 研究的最小單位；做完你就會知道自己喜不喜歡這件事；可以加入 UX 讀書會（FB 搜尋「UX 讀書會 台灣」）旁聽幾次再決定是否深入',
    roles: ['ux_researcher'],
  },
];

/** 準備期：研究作品集、方法學 */
const UXR_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '求職作品集怎麼做？掌握 6 要點',
    url: 'https://www.yourator.co/articles/200',
    note: 'UXR 作品集重點在「研究方法＋洞察發現＋對產品決策的影響」，按這篇結構整理你的訪談或可用性測試案例',
    roles: ['ux_researcher'],
  },
  {
    type: 'article',
    title: '學習成果跟素養能力怎麼呈現？學檔架構內容建議',
    url: 'https://blog.104.com.tw/portfolio/',
    note: '如果你有學術研究或課堂報告經驗，這篇教你怎麼把它轉化成求職作品集結構，適合剛起步的 UXR 學生',
    roles: ['ux_researcher'],
  },
  {
    type: 'guide',
    title: 'UXR 學生作品集最小可行版本',
    note: '一個研究案例只需要五段：(1) 研究問題是什麼（誰有什麼困擾）；(2) 我用什麼方法（訪談幾人/問卷幾份/可用性測試幾場）；(3) 我發現了什麼（2-3 個洞察＋用戶引言）；(4) 我建議怎麼改；(5) 如果有跟進，結果如何。用 Notion 公開頁面分享就夠，不需要漂亮排版',
    roles: ['ux_researcher'],
  },
  {
    type: 'guide',
    title: 'UXR 學生可以從哪裡找研究機會',
    note: '三個方向：(1) 課堂專題：主動提議「我來做用戶訪談」，把研究報告整理進作品集；(2) 設計思考工作坊：IDEO U 或各校創新中心常辦免費活動，可練習訪談和原型測試；(3) 找一個在做 side project 的朋友，提供 UX 研究協助作為交換——你獲得案例，他獲得洞察',
    roles: ['ux_researcher'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：設計思考工作坊（各校創業中心、社會設計類活動）——練習快速訪談和原型測試；次選：UX 讀書會或 UXPA 台灣活動——看業界真實研究案例的呈現方式，作為作品集排版的參考',
    roles: ['ux_researcher'],
  },
];

/** 投遞面試期：portfolio review、研究方法問答 */
const UXR_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '美國 UX 設計師面試流程｜面試經驗分享',
    url: 'https://blog.104.com.tw/ux-designer/',
    note: '雖然是設計師版本，UXR 的 portfolio review 環節準備邏輯完全相同：從「為什麼選這個研究問題」開始說起',
    roles: ['ux_researcher'],
  },
  {
    type: 'article',
    title: '套入 6W2H 法，快速演練面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: 'UXR 面試最常考「描述最有挑戰性的研究」，用 6W2H 框架整理，確保覆蓋到研究問題、方法、洞察、影響四個面向',
    roles: ['ux_researcher'],
  },
  {
    type: 'guide',
    title: 'UXR 面試的三種考法',
    note: '台灣 UXR 面試通常考：(1) Portfolio walk-through（帶面試官走過你的研究，「為什麼選這個方法」比結果更重要）；(2) 方法選擇題（給你一個情境，你說用什麼研究方法以及為什麼）；(3) 現場研究設計（15 分鐘設計一個小研究，說明招募、問題設計、分析方式）。每個案例都要能說「我在時間和資源限制下做了什麼取捨」',
    roles: ['ux_researcher'],
  },
];

// ══════════════════════════════════════════════
// 4. HR（人資）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼 */
const HR_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '作為招募人員，人資 HR 的一天比你想像中更忙碌！',
    url: 'https://blog.104.com.tw/hr-job/',
    note: '人資日常的真實描述，從招募、入職、員工關係到薪酬——搞清楚人資工作範疇，再決定要不要往這條路走',
    roles: ['hr'],
  },
  {
    type: 'article',
    title: '有些招募面談，是在勸退求職者',
    url: 'https://blog.104.com.tw/recruitment-interview/',
    note: '老招募人員寫的反省文，讓你從面試官角度看招募的複雜性，探索期讀完你就會知道人資和你想像的不太一樣',
    roles: ['hr'],
  },
  {
    type: 'article',
    title: 'Talent Management：發展組織關鍵人才',
    url: 'https://blog.104.com.tw/talent-management/',
    note: '人資不只是招募，這篇讓你了解「人才發展」這個策略性的工作面向，看看這是不是你感興趣的方向',
    roles: ['hr'],
  },
  {
    type: 'club',
    title: '探索期建議：先接觸招募的另一面',
    note: '最快理解人資的方法是「被面試」：認真準備幾次實習面試，用反向觀察的視角記下面試官問什麼、怎麼引導、什麼讓你感覺好或不好——這些觀察就是你日後當人資的參照；可以加入學生會人資組或負責校招的學生社團，直接接觸招募流程',
    roles: ['hr'],
  },
];

/** 準備期：招募活動經驗、履歷 */
const HR_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '實習生跟工讀生一樣嗎？開始實習前，你應該知道的 11 件事',
    url: 'https://blog.104.com.tw/internship/',
    note: '了解台灣職場的實習制度，才能在人資實習面試中展現「你懂勞動法規基礎」——這對 HR 應聘者是加分項',
    roles: ['hr'],
  },
  {
    type: 'article',
    title: '2026 最新履歷表！求職履歷表範本、履歷寫作技巧',
    url: 'https://www.yourator.co/articles/289',
    note: '人資自己也要投履歷，用這份 2026 年更新的範本確認你的履歷格式符合台灣職場現行標準',
    roles: ['hr'],
  },
  {
    type: 'guide',
    title: '人資學生履歷的差異化重點',
    note: '沒有工作經驗的人資應聘者，可以放這些：(1) 學生會或社團中任何與「招募、活動規劃、人員協調」相關的職務；(2) 你辦過多大規模的活動（人數）；(3) 任何「說服別人」的成果，例如募集了多少志工、組建了多少人的團隊；(4) 如果有面試過人（甚至是社團幹部遴選），一定要寫進去',
    roles: ['hr'],
  },
  {
    type: 'guide',
    title: '人資實習前建議補的基礎知識',
    note: '三個方向：(1) 台灣勞基法基本概念：試用期、工時、特休——人資最常被員工問這些，面試時說得出來是加分；(2) 招募流程全貌：JD 撰寫 → 篩履歷 → 安排面試 → offer letter；(3) Excel 基礎：人資日常大量使用試算表，能做 VLOOKUP 和 pivot table 就夠入門',
    roles: ['hr'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：學生會人資組或負責招募的幹部職位——直接接觸招募流程，面試時有真實案例可以說；次選：報名校內就業博覽會工作人員——在攤位後方觀察企業如何跟求職者互動，這個視角對理解招募非常有價值',
    roles: ['hr'],
  },
];

/** 投遞面試期：情境題 */
const HR_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '面試「情境考題」需分析規劃，面試官想聽什麼？5 重點找想法',
    url: 'https://blog.104.com.tw/situational-interview/',
    note: '人資面試最大比重是情境題（「如果員工來投訴主管你怎麼處理」），這篇的五個重點框架直接適用，投 HR 前花 20 分鐘讀完並練習兩題',
    roles: ['hr'],
  },
  {
    type: 'article',
    title: '套入 6W2H 法，快速演練面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: '人資面試也考 behavioral question，用 6W2H 框架整理你在社團或活動中「協調人員、解決衝突」的故事，比即興發揮結構清楚很多',
    roles: ['hr'],
  },
  {
    type: 'guide',
    title: '人資面試常考題型與準備方式',
    note: '三種最常考：(1) 情境題（如何處理員工衝突、如何在緊急時間完成招募）：用 STAR 架構（Situation / Task / Action / Result）整理案例；(2) 自我介紹：重點說「你做過最像人資工作的事」；(3) 對人資的理解（「你覺得人資最重要的職責是什麼」）：建議回答「找到對的人然後讓他們留下來」，再用你的經驗展開',
    roles: ['hr'],
  },
];

// ══════════════════════════════════════════════
// 合併輸出：BATCH_B_ENTRIES
// ══════════════════════════════════════════════

/**
 * Key 格式：`${roleId}:${trackId}:${stageCode}`
 *
 * 整合者在 getStageResources 裡，非 PM 職位時額外查找：
 *   const batchKey = `${goalRoleId}:${trackId}:${stageCode}`;
 *   const batchResult = COMBINED_MAP[batchKey];
 *   if (batchResult?.length) return batchResult.slice(0, 4);
 *
 * 探索章（0-x）的資源：用 roleId:*:0-1 等，或整合者直接指向各職位的探索期陣列。
 */
export const BATCH_B_ENTRIES: ResourceMap = {
  // ── software_eng ──────────────────────────────────
  // 探索章（0-x，任何軌）
  'software_eng:explorer:0-1': SWE_EXPLORE,
  'software_eng:explorer:0-2': SWE_EXPLORE,
  'software_eng:explorer:0-3': SWE_EXPLORE,
  'software_eng:builder:0-1': SWE_EXPLORE,
  'software_eng:builder:0-2': SWE_EXPLORE,
  'software_eng:builder:0-3': SWE_EXPLORE,
  'software_eng:sprint:0-1': SWE_EXPLORE,
  'software_eng:sprint:0-2': SWE_EXPLORE,
  'software_eng:sprint:0-3': SWE_EXPLORE,
  // Explorer 軌
  'software_eng:explorer:1-1': SWE_EXPLORE,
  'software_eng:explorer:1-2': SWE_EXPLORE,
  'software_eng:explorer:1-3': SWE_EXPLORE,
  'software_eng:explorer:1-4': SWE_EXPLORE,
  'software_eng:explorer:2-1': SWE_PREPARE,
  'software_eng:explorer:2-2': SWE_PREPARE,
  'software_eng:explorer:2-3': SWE_PREPARE,
  'software_eng:explorer:3-1': SWE_INTERVIEW,
  'software_eng:explorer:3-2': SWE_INTERVIEW,
  'software_eng:explorer:4-1': SWE_INTERVIEW,
  'software_eng:explorer:4-2': SWE_INTERVIEW,
  'software_eng:explorer:4-3': SWE_INTERVIEW,
  // Builder 軌
  'software_eng:builder:1-0': SWE_EXPLORE,
  'software_eng:builder:1-1': SWE_EXPLORE,
  'software_eng:builder:1-2': SWE_PREPARE,
  'software_eng:builder:1-3': SWE_PREPARE,
  'software_eng:builder:2-1': SWE_PREPARE,
  'software_eng:builder:2-2': SWE_PREPARE,
  'software_eng:builder:2-3': SWE_PREPARE,
  'software_eng:builder:3-1': SWE_PREPARE,
  'software_eng:builder:3-2': SWE_PREPARE,
  'software_eng:builder:3-3': SWE_PREPARE,
  'software_eng:builder:3-4': SWE_PREPARE,
  'software_eng:builder:4-1': SWE_INTERVIEW,
  'software_eng:builder:4-2': SWE_INTERVIEW,
  'software_eng:builder:4-3': SWE_INTERVIEW,
  // Sprint 軌
  'software_eng:sprint:1-0': SWE_EXPLORE,
  'software_eng:sprint:1-1': SWE_EXPLORE,
  'software_eng:sprint:1-2': SWE_PREPARE,
  'software_eng:sprint:2-1': SWE_PREPARE,
  'software_eng:sprint:2-2': SWE_PREPARE,
  'software_eng:sprint:3-1': SWE_INTERVIEW,
  'software_eng:sprint:3-2': SWE_INTERVIEW,
  'software_eng:sprint:3-3': SWE_INTERVIEW,
  'software_eng:sprint:4-1': SWE_INTERVIEW,
  'software_eng:sprint:4-2': SWE_INTERVIEW,

  // ── data_analyst ──────────────────────────────────
  'data_analyst:explorer:0-1': DATA_EXPLORE,
  'data_analyst:explorer:0-2': DATA_EXPLORE,
  'data_analyst:explorer:0-3': DATA_EXPLORE,
  'data_analyst:builder:0-1': DATA_EXPLORE,
  'data_analyst:builder:0-2': DATA_EXPLORE,
  'data_analyst:builder:0-3': DATA_EXPLORE,
  'data_analyst:sprint:0-1': DATA_EXPLORE,
  'data_analyst:sprint:0-2': DATA_EXPLORE,
  'data_analyst:sprint:0-3': DATA_EXPLORE,
  'data_analyst:explorer:1-1': DATA_EXPLORE,
  'data_analyst:explorer:1-2': DATA_EXPLORE,
  'data_analyst:explorer:1-3': DATA_EXPLORE,
  'data_analyst:explorer:1-4': DATA_EXPLORE,
  'data_analyst:explorer:2-1': DATA_PREPARE,
  'data_analyst:explorer:2-2': DATA_PREPARE,
  'data_analyst:explorer:2-3': DATA_PREPARE,
  'data_analyst:explorer:3-1': DATA_INTERVIEW,
  'data_analyst:explorer:3-2': DATA_INTERVIEW,
  'data_analyst:explorer:4-1': DATA_INTERVIEW,
  'data_analyst:explorer:4-2': DATA_INTERVIEW,
  'data_analyst:explorer:4-3': DATA_INTERVIEW,
  'data_analyst:builder:1-0': DATA_EXPLORE,
  'data_analyst:builder:1-1': DATA_EXPLORE,
  'data_analyst:builder:1-2': DATA_PREPARE,
  'data_analyst:builder:1-3': DATA_PREPARE,
  'data_analyst:builder:2-1': DATA_PREPARE,
  'data_analyst:builder:2-2': DATA_PREPARE,
  'data_analyst:builder:2-3': DATA_PREPARE,
  'data_analyst:builder:3-1': DATA_PREPARE,
  'data_analyst:builder:3-2': DATA_PREPARE,
  'data_analyst:builder:3-3': DATA_PREPARE,
  'data_analyst:builder:3-4': DATA_PREPARE,
  'data_analyst:builder:4-1': DATA_INTERVIEW,
  'data_analyst:builder:4-2': DATA_INTERVIEW,
  'data_analyst:builder:4-3': DATA_INTERVIEW,
  'data_analyst:sprint:1-0': DATA_EXPLORE,
  'data_analyst:sprint:1-1': DATA_EXPLORE,
  'data_analyst:sprint:1-2': DATA_PREPARE,
  'data_analyst:sprint:2-1': DATA_PREPARE,
  'data_analyst:sprint:2-2': DATA_PREPARE,
  'data_analyst:sprint:3-1': DATA_INTERVIEW,
  'data_analyst:sprint:3-2': DATA_INTERVIEW,
  'data_analyst:sprint:3-3': DATA_INTERVIEW,
  'data_analyst:sprint:4-1': DATA_INTERVIEW,
  'data_analyst:sprint:4-2': DATA_INTERVIEW,

  // ── ux_researcher ─────────────────────────────────
  'ux_researcher:explorer:0-1': UXR_EXPLORE,
  'ux_researcher:explorer:0-2': UXR_EXPLORE,
  'ux_researcher:explorer:0-3': UXR_EXPLORE,
  'ux_researcher:builder:0-1': UXR_EXPLORE,
  'ux_researcher:builder:0-2': UXR_EXPLORE,
  'ux_researcher:builder:0-3': UXR_EXPLORE,
  'ux_researcher:sprint:0-1': UXR_EXPLORE,
  'ux_researcher:sprint:0-2': UXR_EXPLORE,
  'ux_researcher:sprint:0-3': UXR_EXPLORE,
  'ux_researcher:explorer:1-1': UXR_EXPLORE,
  'ux_researcher:explorer:1-2': UXR_EXPLORE,
  'ux_researcher:explorer:1-3': UXR_EXPLORE,
  'ux_researcher:explorer:1-4': UXR_EXPLORE,
  'ux_researcher:explorer:2-1': UXR_PREPARE,
  'ux_researcher:explorer:2-2': UXR_PREPARE,
  'ux_researcher:explorer:2-3': UXR_PREPARE,
  'ux_researcher:explorer:3-1': UXR_INTERVIEW,
  'ux_researcher:explorer:3-2': UXR_INTERVIEW,
  'ux_researcher:explorer:4-1': UXR_INTERVIEW,
  'ux_researcher:explorer:4-2': UXR_INTERVIEW,
  'ux_researcher:explorer:4-3': UXR_INTERVIEW,
  'ux_researcher:builder:1-0': UXR_EXPLORE,
  'ux_researcher:builder:1-1': UXR_EXPLORE,
  'ux_researcher:builder:1-2': UXR_PREPARE,
  'ux_researcher:builder:1-3': UXR_PREPARE,
  'ux_researcher:builder:2-1': UXR_PREPARE,
  'ux_researcher:builder:2-2': UXR_PREPARE,
  'ux_researcher:builder:2-3': UXR_PREPARE,
  'ux_researcher:builder:3-1': UXR_PREPARE,
  'ux_researcher:builder:3-2': UXR_PREPARE,
  'ux_researcher:builder:3-3': UXR_PREPARE,
  'ux_researcher:builder:3-4': UXR_PREPARE,
  'ux_researcher:builder:4-1': UXR_INTERVIEW,
  'ux_researcher:builder:4-2': UXR_INTERVIEW,
  'ux_researcher:builder:4-3': UXR_INTERVIEW,
  'ux_researcher:sprint:1-0': UXR_EXPLORE,
  'ux_researcher:sprint:1-1': UXR_EXPLORE,
  'ux_researcher:sprint:1-2': UXR_PREPARE,
  'ux_researcher:sprint:2-1': UXR_PREPARE,
  'ux_researcher:sprint:2-2': UXR_PREPARE,
  'ux_researcher:sprint:3-1': UXR_INTERVIEW,
  'ux_researcher:sprint:3-2': UXR_INTERVIEW,
  'ux_researcher:sprint:3-3': UXR_INTERVIEW,
  'ux_researcher:sprint:4-1': UXR_INTERVIEW,
  'ux_researcher:sprint:4-2': UXR_INTERVIEW,

  // ── hr ────────────────────────────────────────────
  'hr:explorer:0-1': HR_EXPLORE,
  'hr:explorer:0-2': HR_EXPLORE,
  'hr:explorer:0-3': HR_EXPLORE,
  'hr:builder:0-1': HR_EXPLORE,
  'hr:builder:0-2': HR_EXPLORE,
  'hr:builder:0-3': HR_EXPLORE,
  'hr:sprint:0-1': HR_EXPLORE,
  'hr:sprint:0-2': HR_EXPLORE,
  'hr:sprint:0-3': HR_EXPLORE,
  'hr:explorer:1-1': HR_EXPLORE,
  'hr:explorer:1-2': HR_EXPLORE,
  'hr:explorer:1-3': HR_EXPLORE,
  'hr:explorer:1-4': HR_EXPLORE,
  'hr:explorer:2-1': HR_PREPARE,
  'hr:explorer:2-2': HR_PREPARE,
  'hr:explorer:2-3': HR_PREPARE,
  'hr:explorer:3-1': HR_INTERVIEW,
  'hr:explorer:3-2': HR_INTERVIEW,
  'hr:explorer:4-1': HR_INTERVIEW,
  'hr:explorer:4-2': HR_INTERVIEW,
  'hr:explorer:4-3': HR_INTERVIEW,
  'hr:builder:1-0': HR_EXPLORE,
  'hr:builder:1-1': HR_EXPLORE,
  'hr:builder:1-2': HR_PREPARE,
  'hr:builder:1-3': HR_PREPARE,
  'hr:builder:2-1': HR_PREPARE,
  'hr:builder:2-2': HR_PREPARE,
  'hr:builder:2-3': HR_PREPARE,
  'hr:builder:3-1': HR_PREPARE,
  'hr:builder:3-2': HR_PREPARE,
  'hr:builder:3-3': HR_PREPARE,
  'hr:builder:3-4': HR_PREPARE,
  'hr:builder:4-1': HR_INTERVIEW,
  'hr:builder:4-2': HR_INTERVIEW,
  'hr:builder:4-3': HR_INTERVIEW,
  'hr:sprint:1-0': HR_EXPLORE,
  'hr:sprint:1-1': HR_EXPLORE,
  'hr:sprint:1-2': HR_PREPARE,
  'hr:sprint:2-1': HR_PREPARE,
  'hr:sprint:2-2': HR_PREPARE,
  'hr:sprint:3-1': HR_INTERVIEW,
  'hr:sprint:3-2': HR_INTERVIEW,
  'hr:sprint:3-3': HR_INTERVIEW,
  'hr:sprint:4-1': HR_INTERVIEW,
  'hr:sprint:4-2': HR_INTERVIEW,
};
