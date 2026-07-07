/**
 * lib/resources-batch-a.ts — Batch A（策展日期：2026-07-08）
 * 職位：business_analyst / marketing / consultant / finance / business_dev
 *
 * 整合說明（與 batch-b 完全相同格式，一行 spread 合併）：
 *   import { BATCH_A_ENTRIES } from './resources-batch-a';
 *   const COMBINED_MAP = { ...PM_RESOURCE_MAP, ...BATCH_A_ENTRIES, ...BATCH_B_ENTRIES };
 *
 * Key 格式：`${roleId}:${trackId}:${stageCode}`
 * 與 PM_RESOURCE_MAP 的 `${trackId}:${stageCode}` 格式不同，不會 key 衝突。
 * 整合者在 getStageResources 函式裡，若 goalRoleId 非 'product_manager'，
 * 額外查找 `${goalRoleId}:${trackId}:${stageCode}` 即可命中本批次資源。
 *
 * StageResource.roles 欄位同步設定，方便整合者如需 flatten 合併也能按 role 篩選。
 *
 * 外連驗證：全部 URL 於 2026-07-08 以 curl -sL 追蹤轉址驗 HTTP 200 通過。
 * cake.me 網域為 cakeresume.com 轉址目的地，均可直接使用。
 */

import type { StageResource } from './resources';

type ResourceMap = Record<string, StageResource[]>;

// ══════════════════════════════════════════════
// 1. BUSINESS_ANALYST（商業分析）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼、適不適合 */
const BA_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '什麼是商業分析？商業分析師工作內容、薪水、應徵方式大解密！',
    url: 'https://www.cake.me/resources/industry-job-overview/business-analyst',
    note: 'Cake 整理的台灣 BA 入門指南，說明 BA 如何把商業需求轉譯為解決方案，是選方向前最完整的一頁參考',
    roles: ['business_analyst'],
  },
  {
    type: 'article',
    title: '【職業開箱】認識商業分析師與數據分析師的 9 大差異',
    url: 'https://www.yourator.co/articles/340',
    note: 'BA 和 DA 在台灣求職時常被搞混，這篇把兩者職責、工具、思考角度拆開比較，確認自己要走哪條路再投遞',
    roles: ['business_analyst'],
  },
  {
    type: 'club',
    title: '探索期建議：找你的第一個分析題目',
    note: '這階段不急著學工具：從你最熟悉的產品或服務出發，試著問「這個功能滿足了誰的什麼需求、資料能怎麼支撐這個判斷」——有持續往下追的衝動，才值得深入走 BA；可以加入學校商業個案社或資料分析社旁聽幾次',
    roles: ['business_analyst'],
  },
];

/** 準備期：SQL 技能、分析專案、學生履歷 */
const BA_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '商業分析師需要哪些關鍵能力？與數據分析師有何不同？',
    url: 'https://blog.104.com.tw/business-analyst/',
    note: '104 整理的 BA 技能清單，對照看自己哪些能力已有、哪些要在準備期補強，幫你規劃學習優先序',
    roles: ['business_analyst'],
  },
  {
    type: 'article',
    title: 'Business Analyst 履歷範本與撰寫攻略',
    url: 'https://www.cake.me/resources/resume/business-analyst-resume',
    note: 'Cake 的 BA 履歷範本含實際條目示範，重點看「如何把分析專案寫成量化成果條目」，沒有工作經驗也能照格式套',
    roles: ['business_analyst'],
  },
  {
    type: 'guide',
    title: 'BA 學生履歷的三個核心展示點',
    note: '面試官看 BA 履歷最在意三件事：(1) SQL 或 Excel 分析專案——能說清楚「分析了什麼資料、發現了什麼、建議了什麼」；(2) 溝通跨部門的經歷——任何你橋接不同立場的故事；(3) 邏輯結構化的書面產出——會議紀錄、需求文件、簡報都算。沒有正式工作也能找到這三種材料',
    roles: ['business_analyst'],
  },
  {
    type: 'guide',
    title: 'BA 方向的學生可以做的小型分析練習',
    note: '不需要公司資料：(1) 找一個公開資料集（政府開放資料或 Kaggle），用 Excel 或 Google Sheets 做一份分析報告，結尾給出一個「若是產品負責人，你會怎麼做」的建議；(2) 寫一份「某 app 功能改版的需求分析文件」，說明問題背景、利害關係人需求、建議功能與成功指標——這就是 BA 面試最常問的作品類型',
    roles: ['business_analyst'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：商業個案社或資料分析社——練習拆解商業問題和用數字說話；次選：參加商業競賽（ICAN 個案競賽、各校 Business Competition），讓你練習在時間壓力下整理需求並提出建議，這個過程和 BA 日常工作高度重疊',
    roles: ['business_analyst'],
  },
];

/** 投遞面試期：面試常見題、邏輯與個案練習 */
const BA_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '面試準備無頭緒？套入 6W2H 法，快速演練必考面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: 'BA 面試最常考「描述你如何整理複雜需求」，6W2H 框架正好對應 BA 需求分析的思路，練完後直接用在面試作答',
    roles: ['business_analyst'],
  },
  {
    type: 'article',
    title: '面試「情境考題」需分析規劃，面試官想聽什麼？5 重點找想法',
    url: 'https://blog.104.com.tw/situational-interview/',
    note: 'BA 面試的情境題（「如果兩個部門的需求互相衝突，你怎麼處理」）和這篇的五個重點直接對應，投 BA 前花 20 分鐘讀完並練習兩題',
    roles: ['business_analyst'],
  },
  {
    type: 'guide',
    title: 'BA 面試常考三種題型',
    note: 'BA 面試通常考：(1) 情境分析題（給一個業務問題，問你如何收集需求、如何分析）：先說「我會找誰訪談、問什麼」再說「我如何整理」；(2) SQL 或 Excel 實作（GROUP BY、VLOOKUP、pivot table 是基本要求）；(3) 過去案例（把你的分析報告或競賽提案拿出來說，重點是「你的分析改變了什麼決策」）',
    roles: ['business_analyst'],
  },
];

// ══════════════════════════════════════════════
// 2. MARKETING（行銷企劃）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼、適不適合 */
const MARKETING_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '【職業開箱】想成為行銷人嗎？數位行銷、內容行銷、廣告行銷工作內容＆薪水完整攻略',
    url: 'https://www.yourator.co/articles/470',
    note: '一篇看懂行銷各次專業的日常分工與薪資，選數位行銷還是品牌行銷還是社群行銷，先讀這篇再決定方向',
    roles: ['marketing'],
  },
  {
    type: 'article',
    title: '【社群行銷/社群小編 工作直擊】畢業找工作！職業介紹',
    url: 'https://blog.104.com.tw/social-media-marketing/',
    note: '台灣最常見的行銷實習入口——社群小編的真實日常，看完你就會知道「每天發文」之外還有哪些工作',
    roles: ['marketing'],
  },
  {
    type: 'club',
    title: '探索期建議：先找一個你願意觀察的品牌',
    note: '這階段不急著投履歷：選一個你喜歡的品牌，追蹤它三個月的社群和廣告，記下「它在對誰說話、用什麼訊息、哪個貼文互動最高」——這個習慣本身就是行銷思維的練習，也是面試時最真實的作品素材；可以加入學校社群小編或行銷相關社團',
    roles: ['marketing'],
  },
];

/** 準備期：成效數字、作品集、行銷履歷 */
const MARKETING_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '沒有行銷經歷，該怎麼做行銷作品集？3 大方向 4 個步驟帶領你成為行銷人！',
    url: 'https://www.yourator.co/articles/201',
    note: '行銷人沒有作品集等於沒有入場券，這篇從零開始告訴你怎麼用自選題目建立第一個行銷案例',
    roles: ['marketing'],
  },
  {
    type: 'article',
    title: '【數位行銷履歷範本】行銷履歷怎麼寫？數位行銷人必學 4 大撰寫技巧',
    url: 'https://www.yourator.co/articles/92',
    note: 'Yourator 整理的行銷履歷寫法，重點看「成效數字怎麼呈現」——沒有數字的行銷條目比沒有條目更傷害你',
    roles: ['marketing'],
  },
  {
    type: 'article',
    title: '【行銷企劃履歷範本】專案經驗是關鍵！彈性履歷模板做出加分項',
    url: 'https://blog.104.com.tw/marketing-resume/',
    note: '104 的行銷企劃履歷範本，對照看你的條目有沒有「動詞 ＋ 執行內容 ＋ 成效數字」三段，沒有就按這份範本改寫',
    roles: ['marketing'],
  },
  {
    type: 'guide',
    title: '行銷學生履歷的量化公式',
    note: '行銷條目的寫法：動詞（操盤/撰寫/規劃）＋ 管道或工具 ＋ 成效數字 ＋ 時間範圍。例：「操盤 IG 帳號三個月，貼文平均互動率從 2.1% 提升至 4.8%，追蹤人數成長 1,200 人」。沒有品牌數據就用課堂或社團的小活動數字，比沒有數字好很多',
    roles: ['marketing'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：擔任學校社團或活動的社群小編——哪怕只管一個 FB 粉絲頁，有數字就能寫進履歷；次選：加入行銷實習計畫（各大電商平台常開暑期行銷實習）或報名 Google 數位人才培育計畫（有結業證書可放履歷）',
    roles: ['marketing'],
  },
];

/** 投遞面試期：行銷面試常見題、術科準備 */
const MARKETING_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '行銷面試準備 4 步驟！行銷面試前準備、行銷面試常見問題',
    url: 'https://www.yourator.co/articles/338',
    note: 'Yourator 整理的行銷面試攻略，從研究公司、準備案例到模擬作答，投出第一份 CV 前花 30 分鐘按步驟走一遍',
    roles: ['marketing'],
  },
  {
    type: 'article',
    title: '數位行銷新手如何選對管道？Meta 行銷長：5 步驟找到成長突破口',
    url: 'https://blog.104.com.tw/digital-marketing/',
    note: '面試前了解業界怎麼思考行銷策略，讓你在「你會怎麼幫我們做行銷」這類開放題時能說出更有架構的答案',
    roles: ['marketing'],
  },
  {
    type: 'guide',
    title: '行銷面試的三種考法與準備方式',
    note: '台灣行銷面試通常考：(1) 作品走覽（帶面試官看你做過的案例，重點是「你設定了什麼目標、如何達成、數字是什麼」）；(2) 即興案例（「幫我們的新產品設計一個 IG 推廣方案」，建議說出目標受眾、訊息策略、管道選擇、成效衡量）；(3) 看法題（「你最近看到什麼有趣的行銷案例」）：投遞前準備 2-3 個你真心喜歡的台灣品牌案例，能分析為什麼有效',
    roles: ['marketing'],
  },
];

// ══════════════════════════════════════════════
// 3. CONSULTANT（顧問）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼、適不適合 */
const CONSULTANT_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '【職業開箱】揭密商學院人才的夢幻職業！想轉職成為管理顧問，應該具備哪些必備能力？',
    url: 'https://www.yourator.co/articles/520',
    note: 'Yourator 整理的管顧入門文，說明顧問日常工作、MBB 三大巨頭、必備能力，探索期最完整的一頁概覽',
    roles: ['consultant'],
  },
  {
    type: 'article',
    title: '管理顧問工作大公開！開箱全台只有 200 人的夢幻職業——精算師的管顧職涯',
    url: 'https://www.yourator.co/articles/610',
    note: 'Deloitte Taiwan 管理顧問部門真實訪談，從業者視角理解顧問日常比讀 JD 更有說服力，確認自己對「高壓但高成長」有沒有接受度',
    roles: ['consultant'],
  },
  {
    type: 'club',
    title: '探索期建議：先接觸個案思維',
    note: '顧問最核心的能力是「結構化拆解問題」：不需要等進公司才練習——讀幾篇 McKinsey Insights 的中文摘要、聽「想了解顧問工作」Podcast（Yourator 795），觀察真實顧問如何描述問題。有感覺的話，報名一場商業個案競賽親身感受；加入學校個案研究社是最直接的入口',
    roles: ['consultant'],
  },
];

/** 準備期：個案競賽、結構化表達、履歷 */
const CONSULTANT_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '想了解顧問工作？5 集 Podcast 聽不同類型的顧問日常！',
    url: 'https://www.yourator.co/articles/795',
    note: 'Yourator 整理的顧問 Podcast 清單，涵蓋管理顧問、IT 顧問、財務顧問等不同類型，準備期聽完有助於確認你要走哪個方向',
    roles: ['consultant'],
  },
  {
    type: 'article',
    title: '大學生必追資源整理：實習、商業競賽、培訓計畫、儲備幹部（MA）',
    url: 'https://www.yourator.co/articles/191',
    note: 'Yourator 整理的台灣商業競賽清單就在這裡——顧問實習申請者最該優先報名個案競賽，這份清單幫你找到適合的場次',
    roles: ['consultant'],
  },
  {
    type: 'guide',
    title: '顧問學生履歷的差異化重點',
    note: '沒有工作經驗的顧問應聘者，可以放這些：(1) 商業個案競賽——名次不重要，重要的是你能說清楚「你的團隊如何拆解問題、你貢獻了什麼」；(2) 跨領域的課堂報告——顧問面試很喜歡問「你如何把複雜的東西說清楚」，把課堂報告整理成半頁的「問題→分析→建議」結構，就是你的材料；(3) 任何你帶過分析並對決策有影響的事，都值得寫進去',
    roles: ['consultant'],
  },
  {
    type: 'guide',
    title: '個案競賽就是顧問面試的試煉場',
    note: '台灣大學生可以參加的顧問/商業個案競賽：ICAN 個案競賽、各校 Business Competition、BCG 或 McKinsey 的學生挑戰賽（不定期開放，值得追蹤官網）。準備策略：(1) 先學一個分析框架（SWOT、5C、Porter Five Forces 選一個吃透）；(2) 找 1-2 個搭檔練習 20 分鐘案例討論；(3) 競賽結束後把你的分析流程整理成一頁紙，就是你的作品',
    roles: ['consultant'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：學校個案研究社或商業競賽社——直接接觸個案思維，練習和不同背景的人合作提出解方；次選：Consulting Club（部分大學有）或 NTU/NCCU 的商學院活動——接觸業界顧問，知道「好的分析簡報」長什麼樣',
    roles: ['consultant'],
  },
];

/** 投遞面試期：個案面試、結構化作答 */
const CONSULTANT_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '【外商面試攻略】外商面試常見環節、面試技巧、題庫推薦',
    url: 'https://www.yourator.co/articles/620',
    note: '顧問公司幾乎都是外商或準外商，這篇整理外商面試流程與技巧，含個案面試（Case Interview）的常見環節說明，投遞前必讀',
    roles: ['consultant'],
  },
  {
    type: 'article',
    title: '面試準備無頭緒？套入 6W2H 法，快速演練必考面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: 'Behavioral question（「描述你解決複雜問題的故事」）在顧問面試佔很大比重，用 6W2H 框架把你的競賽或課堂案例整理清楚，確保覆蓋問題情境、你的分析方法與最終建議',
    roles: ['consultant'],
  },
  {
    type: 'guide',
    title: '顧問面試的三種考法與準備方式',
    note: '顧問面試通常考：(1) Case Interview（個案面試）——給你一個業務問題，你需要結構化拆解、提問、假設、分析、結論，練習重點是「說出你的思維過程」而不是找到正確答案；(2) Behavioral（「說一個你說服他人的案例」）用 STAR 架構整理；(3) 市場估算（費米估算）——「台灣有多少輛腳踏車」這類題，練習用人口、家戶、使用率分層估算。三種都要準備，通常第一關就是個案面試',
    roles: ['consultant'],
  },
];

// ══════════════════════════════════════════════
// 4. FINANCE（金融）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼、適不適合 */
const FINANCE_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '金控基層薪資榜 第一金稱冠 業界歷來最高',
    url: 'https://blog.104.com.tw/financial-industry/',
    note: '台灣金融業薪資現況的真實數據，幫助你在選方向前了解不同金融機構的薪酬差距，避免只憑印象做職涯決定',
    roles: ['finance'],
  },
  {
    type: 'article',
    title: 'CFA 特許金融分析師——證照等級、報考資格、國內外職缺薪水',
    url: 'https://www.cake.me/resources/career-planning/cfa-career',
    note: '台灣金融業最重要的國際證照全解析，探索期讀完你就知道「金融」下面細分哪些方向，以及每個方向對應的證照路徑',
    roles: ['finance'],
  },
  {
    type: 'club',
    title: '探索期建議：先接觸真實的金融數字',
    note: '不需要等進公司才接觸金融：(1) 開一個模擬投資帳戶（台灣有免費的模擬股票平台），觀察自己對「讀財報、追蹤市場」有沒有持續的熱情；(2) 加入學校的證券研習社或投資社，聽前輩分享在金融機構的實際工作，比讀 JD 更有感',
    roles: ['finance'],
  },
];

/** 準備期：證照規劃、Excel 建模、金融履歷 */
const FINANCE_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '金融分析師履歷範本與撰寫攻略',
    url: 'https://www.cake.me/resume-examples/finance/financial-analyst',
    note: 'Cake 的金融分析師履歷範本，含台灣在地化公司案例，特別看「技術能力欄位如何呈現 Excel 建模與財報分析」',
    roles: ['finance'],
  },
  {
    type: 'article',
    title: '面試準備無頭緒？套入 6W2H 法，快速演練必考面試問題',
    url: 'https://blog.104.com.tw/interview-questions/',
    note: '金融面試的情境題（「如果你要分析這家公司值不值得投資，你會怎麼做」）和 6W2H 框架高度吻合，練完後直接用在面試作答',
    roles: ['finance'],
  },
  {
    type: 'guide',
    title: '金融學生履歷的三個加分要素',
    note: '(1) 證照進度：CFA Level 1 候選人資格（大三起可報考）、金融研訓院的初階證照（銀行內控、投信投顧）——有在考或已通過都值得寫；(2) Excel 建模證據：把課堂的財報分析或估值模型截圖，說明你做了什麼分析、用了什麼工具；(3) 金融相關課程：計量經濟、財務管理、衍生性商品列出來，這些讓面試官知道你的基礎扎實',
    roles: ['finance'],
  },
  {
    type: 'guide',
    title: '大學生進金融業的三條路徑',
    note: '路徑一：銀行儲備幹部（MA）——各大銀行暑期有計畫，入口門檻最低，適合還在探索的學生；路徑二：券商/投信實習——需要金融相關科系背景或初階證照，但能最快接觸投資分析工作；路徑三：FinTech 新創——技術加金融的複合型需求，適合有程式底子的學生。確認自己在哪條路，準備才有方向',
    roles: ['finance'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：證券研習社或投資社——能接觸模擬交易、財報研讀、業界演講，部分社團有和券商合作的參訪機會；次選：台灣金融研訓院（TABF）的學生課程或 CFA Institute 的學生會員計畫——這兩個都有助於擴展金融圈的人脈網絡',
    roles: ['finance'],
  },
];

/** 投遞面試期：金融面試常見題、財報考題 */
const FINANCE_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '面試「情境考題」需分析規劃，面試官想聽什麼？5 重點找想法',
    url: 'https://blog.104.com.tw/situational-interview/',
    note: '金融面試很常考「情境判斷題」（「如果一個客戶的風險承受度很低但要求高報酬，你怎麼建議」），這篇的五個框架直接適用',
    roles: ['finance'],
  },
  {
    type: 'article',
    title: '【2026 實習全攻略】暑期實習、履歷面試、作品集一站解答',
    url: 'https://www.yourator.co/articles/206',
    note: '金融業暑期實習是最多學生的第一個入口，這份 2026 年更新的實習求職攻略幫你搞清楚申請時間軸和面試準備重點',
    roles: ['finance'],
  },
  {
    type: 'guide',
    title: '金融面試的三種考法與準備方式',
    note: '台灣金融機構面試通常考：(1) 財務知識問答（時間價值、現金流折現、P/E ratio 是什麼）：這類題準備重點是「說得清楚」不是背公式；(2) 財報分析（帶你看一份真實財報，問你注意到什麼）：練習從損益表、資產負債表找出三個有趣的數字並說明意義；(3) Behavioral（「為什麼選金融業」「說一個你分析過的投資機會」）：提前準備一個你真心研究過的公司或產業案例',
    roles: ['finance'],
  },
];

// ══════════════════════════════════════════════
// 5. BUSINESS_DEV（業務開發）
// ══════════════════════════════════════════════

/** 探索期：這職位在做什麼、適不適合 */
const BD_EXPLORE: StageResource[] = [
  {
    type: 'article',
    title: '【職業開箱】BD、Sales 有什麼區別？應徵前必知的商業開發 VS 業務 3 項關鍵差異！',
    url: 'https://www.yourator.co/articles/331',
    note: 'BD 和 Sales 在台灣求職時常被混淆，這篇把兩者的工作範疇、KPI、思維角度拆開比較，選方向前必讀',
    roles: ['business_dev'],
  },
  {
    type: 'article',
    title: '對產品的信念，是業務最重要的動力——專訪 Yourator 雲端服務業務經理 Allen',
    url: 'https://www.yourator.co/articles/310',
    note: '新創 BD 的真實工作樣貌：從業者視角看商業開發如何找潛在客戶、談合作、管理客戶關係，比讀職位說明書更有感',
    roles: ['business_dev'],
  },
  {
    type: 'club',
    title: '探索期建議：先培養「說服別人」的感覺',
    note: '業務開發的核心是讓對方相信合作的價值。不用等進公司才練習：在社團或課堂上主動擔任提案的人，觀察自己在說服他人時的感受——如果你享受這個過程，BD 很適合你；加入校園大使計畫或業務實習（外商常開）是最直接的探索方式',
    roles: ['business_dev'],
  },
];

/** 準備期：可量化業績、提案作品、BD 履歷 */
const BD_PREPARE: StageResource[] = [
  {
    type: 'article',
    title: '業務履歷面試心法｜履歷把握兩大原則，展現業務特質、挑戰高薪',
    url: 'https://blog.104.com.tw/sales-job/',
    note: '104 整理的業務/BD 履歷攻略，重點看「如何把提案和拉新的成果量化寫進條目」——BD 履歷沒有業績數字幾乎不會被看見',
    roles: ['business_dev'],
  },
  {
    type: 'article',
    title: 'Business Development 履歷範本與撰寫攻略',
    url: 'https://www.cake.me/resume-examples/management-business/business-development',
    note: 'Cake 的 BD 履歷範本，含台灣在地化公司案例（台積電、台灣大哥大等），重點看「每個條目如何展示可量化的業務成果」',
    roles: ['business_dev'],
  },
  {
    type: 'guide',
    title: 'BD 學生履歷的差異化重點',
    note: '沒有正式業務工作也能寫出 BD 感的履歷：(1) 任何你「說服別人、拉到資源、帶來合作」的經驗——社團贊助拉到多少錢、為活動談到多少廠商、推動了什麼跨組合作；(2) 可量化的業績：「負責聯絡 20 家廠商，成功簽約 8 家」比「協助廠商聯絡」有力 10 倍；(3) 提案記錄：任何你寫過的合作提案或企劃書，說明提案的商業邏輯',
    roles: ['business_dev'],
  },
  {
    type: 'guide',
    title: 'BD 方向的學生可以做的三件事',
    note: '(1) 加入校園大使計畫（各科技公司、外商常開放）：你的主要工作就是「代表品牌說服同學參加活動或使用產品」，這就是最接近 BD 的學生工作；(2) 參加商業競賽的提案組：練習用數字說明市場機會、合作方案的 ROI；(3) 主動幫一個你覺得不錯的社團或活動找贊助——從規劃提案到拿到第一張回函，整個過程就是 BD 工作的縮影',
    roles: ['business_dev'],
  },
  {
    type: 'club',
    title: '準備期加入什麼社群',
    note: '首選：校園大使計畫（各大科技公司和外商的學生大使）——直接接觸 BD 流程；次選：主動找業務相關的實習（新創公司的 BD 實習，通常比大公司更能接觸完整流程）；加入創業社或提案型社團也很有幫助',
    roles: ['business_dev'],
  },
];

/** 投遞面試期：BD 面試常見題、提案演練 */
const BD_INTERVIEW: StageResource[] = [
  {
    type: 'article',
    title: '文組生也能轉戰科技新創！Kdan Mobile 業務助理實習生心得分享',
    url: 'https://www.yourator.co/articles/670',
    note: '真實新創 BD 實習的第一人稱心得，看懂面試關卡、試用期要求和日常工作，投遞前讀完讓你對面試官的期待有更準確的估計',
    roles: ['business_dev'],
  },
  {
    type: 'article',
    title: '面試「情境考題」需分析規劃，面試官想聽什麼？5 重點找想法',
    url: 'https://blog.104.com.tw/situational-interview/',
    note: 'BD 面試最常考情境題（「如果你要去開發一個完全沒有合作過的市場，你第一步怎麼做」），這篇的五重點直接適用，投前花 20 分鐘讀完',
    roles: ['business_dev'],
  },
  {
    type: 'guide',
    title: 'BD 面試常考三種題型與準備方式',
    note: 'BD 面試通常考：(1) 提案模擬（「幫我們的產品向 [某類型客戶] 提案」）：準備架構——客戶痛點、我們的解法、合作模式、預期效益，說完後主動問面試官回饋；(2) Behavioral（「說一個你成功拿到合作的故事」）用 STAR 架構整理，重點是結果要有數字；(3) 市場思維（「你覺得我們的目標客群還有哪些沒開發的」）：提前研究公司的現有客戶和競爭對手，來一個有根據的回答',
    roles: ['business_dev'],
  },
];

// ══════════════════════════════════════════════
// 合併輸出：BATCH_A_ENTRIES
// ══════════════════════════════════════════════

/**
 * Key 格式：`${roleId}:${trackId}:${stageCode}`
 *
 * 整合者在 getStageResources 裡，非 PM 職位時額外查找：
 *   const batchKey = `${goalRoleId}:${trackId}:${stageCode}`;
 *   const batchResult = COMBINED_MAP[batchKey];
 *   if (batchResult?.length) return batchResult.slice(0, 4);
 *
 * 探索章（0-x）與 batch-b 做法一致，直接指向各職位的探索期陣列。
 * 格式與 BATCH_B_ENTRIES 完全相同：整合者 spread 合併兩個物件即可，無衝突。
 */
export const BATCH_A_ENTRIES: ResourceMap = {
  // ── business_analyst ──────────────────────────
  'business_analyst:explorer:0-1': BA_EXPLORE,
  'business_analyst:explorer:0-2': BA_EXPLORE,
  'business_analyst:explorer:0-3': BA_EXPLORE,
  'business_analyst:builder:0-1': BA_EXPLORE,
  'business_analyst:builder:0-2': BA_EXPLORE,
  'business_analyst:builder:0-3': BA_EXPLORE,
  'business_analyst:sprint:0-1': BA_EXPLORE,
  'business_analyst:sprint:0-2': BA_EXPLORE,
  'business_analyst:sprint:0-3': BA_EXPLORE,
  // Explorer 軌
  'business_analyst:explorer:1-1': BA_EXPLORE,
  'business_analyst:explorer:1-2': BA_EXPLORE,
  'business_analyst:explorer:1-3': BA_EXPLORE,
  'business_analyst:explorer:1-4': BA_EXPLORE,
  'business_analyst:explorer:2-1': BA_PREPARE,
  'business_analyst:explorer:2-2': BA_PREPARE,
  'business_analyst:explorer:2-3': BA_PREPARE,
  'business_analyst:explorer:3-1': BA_INTERVIEW,
  'business_analyst:explorer:3-2': BA_INTERVIEW,
  'business_analyst:explorer:4-1': BA_INTERVIEW,
  'business_analyst:explorer:4-2': BA_INTERVIEW,
  'business_analyst:explorer:4-3': BA_INTERVIEW,
  // Builder 軌
  'business_analyst:builder:1-0': BA_EXPLORE,
  'business_analyst:builder:1-1': BA_EXPLORE,
  'business_analyst:builder:1-2': BA_PREPARE,
  'business_analyst:builder:1-3': BA_PREPARE,
  'business_analyst:builder:2-1': BA_PREPARE,
  'business_analyst:builder:2-2': BA_PREPARE,
  'business_analyst:builder:2-3': BA_PREPARE,
  'business_analyst:builder:3-1': BA_PREPARE,
  'business_analyst:builder:3-2': BA_PREPARE,
  'business_analyst:builder:3-3': BA_PREPARE,
  'business_analyst:builder:3-4': BA_PREPARE,
  'business_analyst:builder:4-1': BA_INTERVIEW,
  'business_analyst:builder:4-2': BA_INTERVIEW,
  'business_analyst:builder:4-3': BA_INTERVIEW,
  // Sprint 軌
  'business_analyst:sprint:1-0': BA_EXPLORE,
  'business_analyst:sprint:1-1': BA_EXPLORE,
  'business_analyst:sprint:1-2': BA_PREPARE,
  'business_analyst:sprint:2-1': BA_PREPARE,
  'business_analyst:sprint:2-2': BA_PREPARE,
  'business_analyst:sprint:3-1': BA_INTERVIEW,
  'business_analyst:sprint:3-2': BA_INTERVIEW,
  'business_analyst:sprint:3-3': BA_INTERVIEW,
  'business_analyst:sprint:4-1': BA_INTERVIEW,
  'business_analyst:sprint:4-2': BA_INTERVIEW,

  // ── marketing ─────────────────────────────────
  'marketing:explorer:0-1': MARKETING_EXPLORE,
  'marketing:explorer:0-2': MARKETING_EXPLORE,
  'marketing:explorer:0-3': MARKETING_EXPLORE,
  'marketing:builder:0-1': MARKETING_EXPLORE,
  'marketing:builder:0-2': MARKETING_EXPLORE,
  'marketing:builder:0-3': MARKETING_EXPLORE,
  'marketing:sprint:0-1': MARKETING_EXPLORE,
  'marketing:sprint:0-2': MARKETING_EXPLORE,
  'marketing:sprint:0-3': MARKETING_EXPLORE,
  // Explorer 軌
  'marketing:explorer:1-1': MARKETING_EXPLORE,
  'marketing:explorer:1-2': MARKETING_EXPLORE,
  'marketing:explorer:1-3': MARKETING_EXPLORE,
  'marketing:explorer:1-4': MARKETING_EXPLORE,
  'marketing:explorer:2-1': MARKETING_PREPARE,
  'marketing:explorer:2-2': MARKETING_PREPARE,
  'marketing:explorer:2-3': MARKETING_PREPARE,
  'marketing:explorer:3-1': MARKETING_INTERVIEW,
  'marketing:explorer:3-2': MARKETING_INTERVIEW,
  'marketing:explorer:4-1': MARKETING_INTERVIEW,
  'marketing:explorer:4-2': MARKETING_INTERVIEW,
  'marketing:explorer:4-3': MARKETING_INTERVIEW,
  // Builder 軌
  'marketing:builder:1-0': MARKETING_EXPLORE,
  'marketing:builder:1-1': MARKETING_EXPLORE,
  'marketing:builder:1-2': MARKETING_PREPARE,
  'marketing:builder:1-3': MARKETING_PREPARE,
  'marketing:builder:2-1': MARKETING_PREPARE,
  'marketing:builder:2-2': MARKETING_PREPARE,
  'marketing:builder:2-3': MARKETING_PREPARE,
  'marketing:builder:3-1': MARKETING_PREPARE,
  'marketing:builder:3-2': MARKETING_PREPARE,
  'marketing:builder:3-3': MARKETING_PREPARE,
  'marketing:builder:3-4': MARKETING_PREPARE,
  'marketing:builder:4-1': MARKETING_INTERVIEW,
  'marketing:builder:4-2': MARKETING_INTERVIEW,
  'marketing:builder:4-3': MARKETING_INTERVIEW,
  // Sprint 軌
  'marketing:sprint:1-0': MARKETING_EXPLORE,
  'marketing:sprint:1-1': MARKETING_EXPLORE,
  'marketing:sprint:1-2': MARKETING_PREPARE,
  'marketing:sprint:2-1': MARKETING_PREPARE,
  'marketing:sprint:2-2': MARKETING_PREPARE,
  'marketing:sprint:3-1': MARKETING_INTERVIEW,
  'marketing:sprint:3-2': MARKETING_INTERVIEW,
  'marketing:sprint:3-3': MARKETING_INTERVIEW,
  'marketing:sprint:4-1': MARKETING_INTERVIEW,
  'marketing:sprint:4-2': MARKETING_INTERVIEW,

  // ── consultant ────────────────────────────────
  'consultant:explorer:0-1': CONSULTANT_EXPLORE,
  'consultant:explorer:0-2': CONSULTANT_EXPLORE,
  'consultant:explorer:0-3': CONSULTANT_EXPLORE,
  'consultant:builder:0-1': CONSULTANT_EXPLORE,
  'consultant:builder:0-2': CONSULTANT_EXPLORE,
  'consultant:builder:0-3': CONSULTANT_EXPLORE,
  'consultant:sprint:0-1': CONSULTANT_EXPLORE,
  'consultant:sprint:0-2': CONSULTANT_EXPLORE,
  'consultant:sprint:0-3': CONSULTANT_EXPLORE,
  // Explorer 軌
  'consultant:explorer:1-1': CONSULTANT_EXPLORE,
  'consultant:explorer:1-2': CONSULTANT_EXPLORE,
  'consultant:explorer:1-3': CONSULTANT_EXPLORE,
  'consultant:explorer:1-4': CONSULTANT_EXPLORE,
  'consultant:explorer:2-1': CONSULTANT_PREPARE,
  'consultant:explorer:2-2': CONSULTANT_PREPARE,
  'consultant:explorer:2-3': CONSULTANT_PREPARE,
  'consultant:explorer:3-1': CONSULTANT_INTERVIEW,
  'consultant:explorer:3-2': CONSULTANT_INTERVIEW,
  'consultant:explorer:4-1': CONSULTANT_INTERVIEW,
  'consultant:explorer:4-2': CONSULTANT_INTERVIEW,
  'consultant:explorer:4-3': CONSULTANT_INTERVIEW,
  // Builder 軌
  'consultant:builder:1-0': CONSULTANT_EXPLORE,
  'consultant:builder:1-1': CONSULTANT_EXPLORE,
  'consultant:builder:1-2': CONSULTANT_PREPARE,
  'consultant:builder:1-3': CONSULTANT_PREPARE,
  'consultant:builder:2-1': CONSULTANT_PREPARE,
  'consultant:builder:2-2': CONSULTANT_PREPARE,
  'consultant:builder:2-3': CONSULTANT_PREPARE,
  'consultant:builder:3-1': CONSULTANT_PREPARE,
  'consultant:builder:3-2': CONSULTANT_PREPARE,
  'consultant:builder:3-3': CONSULTANT_PREPARE,
  'consultant:builder:3-4': CONSULTANT_PREPARE,
  'consultant:builder:4-1': CONSULTANT_INTERVIEW,
  'consultant:builder:4-2': CONSULTANT_INTERVIEW,
  'consultant:builder:4-3': CONSULTANT_INTERVIEW,
  // Sprint 軌
  'consultant:sprint:1-0': CONSULTANT_EXPLORE,
  'consultant:sprint:1-1': CONSULTANT_EXPLORE,
  'consultant:sprint:1-2': CONSULTANT_PREPARE,
  'consultant:sprint:2-1': CONSULTANT_PREPARE,
  'consultant:sprint:2-2': CONSULTANT_PREPARE,
  'consultant:sprint:3-1': CONSULTANT_INTERVIEW,
  'consultant:sprint:3-2': CONSULTANT_INTERVIEW,
  'consultant:sprint:3-3': CONSULTANT_INTERVIEW,
  'consultant:sprint:4-1': CONSULTANT_INTERVIEW,
  'consultant:sprint:4-2': CONSULTANT_INTERVIEW,

  // ── finance ───────────────────────────────────
  'finance:explorer:0-1': FINANCE_EXPLORE,
  'finance:explorer:0-2': FINANCE_EXPLORE,
  'finance:explorer:0-3': FINANCE_EXPLORE,
  'finance:builder:0-1': FINANCE_EXPLORE,
  'finance:builder:0-2': FINANCE_EXPLORE,
  'finance:builder:0-3': FINANCE_EXPLORE,
  'finance:sprint:0-1': FINANCE_EXPLORE,
  'finance:sprint:0-2': FINANCE_EXPLORE,
  'finance:sprint:0-3': FINANCE_EXPLORE,
  // Explorer 軌
  'finance:explorer:1-1': FINANCE_EXPLORE,
  'finance:explorer:1-2': FINANCE_EXPLORE,
  'finance:explorer:1-3': FINANCE_EXPLORE,
  'finance:explorer:1-4': FINANCE_EXPLORE,
  'finance:explorer:2-1': FINANCE_PREPARE,
  'finance:explorer:2-2': FINANCE_PREPARE,
  'finance:explorer:2-3': FINANCE_PREPARE,
  'finance:explorer:3-1': FINANCE_INTERVIEW,
  'finance:explorer:3-2': FINANCE_INTERVIEW,
  'finance:explorer:4-1': FINANCE_INTERVIEW,
  'finance:explorer:4-2': FINANCE_INTERVIEW,
  'finance:explorer:4-3': FINANCE_INTERVIEW,
  // Builder 軌
  'finance:builder:1-0': FINANCE_EXPLORE,
  'finance:builder:1-1': FINANCE_EXPLORE,
  'finance:builder:1-2': FINANCE_PREPARE,
  'finance:builder:1-3': FINANCE_PREPARE,
  'finance:builder:2-1': FINANCE_PREPARE,
  'finance:builder:2-2': FINANCE_PREPARE,
  'finance:builder:2-3': FINANCE_PREPARE,
  'finance:builder:3-1': FINANCE_PREPARE,
  'finance:builder:3-2': FINANCE_PREPARE,
  'finance:builder:3-3': FINANCE_PREPARE,
  'finance:builder:3-4': FINANCE_PREPARE,
  'finance:builder:4-1': FINANCE_INTERVIEW,
  'finance:builder:4-2': FINANCE_INTERVIEW,
  'finance:builder:4-3': FINANCE_INTERVIEW,
  // Sprint 軌
  'finance:sprint:1-0': FINANCE_EXPLORE,
  'finance:sprint:1-1': FINANCE_EXPLORE,
  'finance:sprint:1-2': FINANCE_PREPARE,
  'finance:sprint:2-1': FINANCE_PREPARE,
  'finance:sprint:2-2': FINANCE_PREPARE,
  'finance:sprint:3-1': FINANCE_INTERVIEW,
  'finance:sprint:3-2': FINANCE_INTERVIEW,
  'finance:sprint:3-3': FINANCE_INTERVIEW,
  'finance:sprint:4-1': FINANCE_INTERVIEW,
  'finance:sprint:4-2': FINANCE_INTERVIEW,

  // ── business_dev ──────────────────────────────
  'business_dev:explorer:0-1': BD_EXPLORE,
  'business_dev:explorer:0-2': BD_EXPLORE,
  'business_dev:explorer:0-3': BD_EXPLORE,
  'business_dev:builder:0-1': BD_EXPLORE,
  'business_dev:builder:0-2': BD_EXPLORE,
  'business_dev:builder:0-3': BD_EXPLORE,
  'business_dev:sprint:0-1': BD_EXPLORE,
  'business_dev:sprint:0-2': BD_EXPLORE,
  'business_dev:sprint:0-3': BD_EXPLORE,
  // Explorer 軌
  'business_dev:explorer:1-1': BD_EXPLORE,
  'business_dev:explorer:1-2': BD_EXPLORE,
  'business_dev:explorer:1-3': BD_EXPLORE,
  'business_dev:explorer:1-4': BD_EXPLORE,
  'business_dev:explorer:2-1': BD_PREPARE,
  'business_dev:explorer:2-2': BD_PREPARE,
  'business_dev:explorer:2-3': BD_PREPARE,
  'business_dev:explorer:3-1': BD_INTERVIEW,
  'business_dev:explorer:3-2': BD_INTERVIEW,
  'business_dev:explorer:4-1': BD_INTERVIEW,
  'business_dev:explorer:4-2': BD_INTERVIEW,
  'business_dev:explorer:4-3': BD_INTERVIEW,
  // Builder 軌
  'business_dev:builder:1-0': BD_EXPLORE,
  'business_dev:builder:1-1': BD_EXPLORE,
  'business_dev:builder:1-2': BD_PREPARE,
  'business_dev:builder:1-3': BD_PREPARE,
  'business_dev:builder:2-1': BD_PREPARE,
  'business_dev:builder:2-2': BD_PREPARE,
  'business_dev:builder:2-3': BD_PREPARE,
  'business_dev:builder:3-1': BD_PREPARE,
  'business_dev:builder:3-2': BD_PREPARE,
  'business_dev:builder:3-3': BD_PREPARE,
  'business_dev:builder:3-4': BD_PREPARE,
  'business_dev:builder:4-1': BD_INTERVIEW,
  'business_dev:builder:4-2': BD_INTERVIEW,
  'business_dev:builder:4-3': BD_INTERVIEW,
  // Sprint 軌
  'business_dev:sprint:1-0': BD_EXPLORE,
  'business_dev:sprint:1-1': BD_EXPLORE,
  'business_dev:sprint:1-2': BD_PREPARE,
  'business_dev:sprint:2-1': BD_PREPARE,
  'business_dev:sprint:2-2': BD_PREPARE,
  'business_dev:sprint:3-1': BD_INTERVIEW,
  'business_dev:sprint:3-2': BD_INTERVIEW,
  'business_dev:sprint:3-3': BD_INTERVIEW,
  'business_dev:sprint:4-1': BD_INTERVIEW,
  'business_dev:sprint:4-2': BD_INTERVIEW,
};
