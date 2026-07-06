// Ability quiz — 10 questions per role, self-assessment (Yes=2 / Partly=1 / No=0)
// PM questions are verbatim from spec §5; others are drafts, pending HR review
// NOTE: 草稿，待人資校準

import type { RoleId } from './roles';

export type Dimension = 'experience' | 'skills' | 'portfolio' | 'resume' | 'network' | 'readiness';

export interface QuizQuestion {
  text: string;
  dimension: Dimension;
}

export type AbilityLevel = 'explorer' | 'starter' | 'builder' | 'applicant' | 'finalist';

export const ABILITY_LEVEL_LABELS: Record<AbilityLevel, { label: string; desc: string }> = {
  explorer:  { label: '新手探索者', desc: '剛開始認識這個方向，現在是打基礎、多嘗試的好時機。' },
  starter:   { label: '準備起步者', desc: '有一些基礎，但還有幾塊缺口需要補強，建議先從核心能力入手。' },
  builder:   { label: '履歷強化者', desc: '具備基本條件，可以透過精修履歷與補充作品，讓自己更有競爭力。' },
  applicant: { label: '投遞準備者', desc: '準備程度不錯，建議開始廣泛投遞、累積面試經驗。' },
  finalist:  { label: '面試衝刺者', desc: '實力紮實，現在的重點是練習面試表達，準備好每個問題的故事。' },
};

export function getAbilityLevel(score: number): AbilityLevel {
  if (score <= 6)  return 'explorer';
  if (score <= 10) return 'starter';
  if (score <= 14) return 'builder';
  if (score <= 17) return 'applicant';
  return 'finalist';
}

// Verbatim PM questions from spec §5 (dimension order: experience, portfolio, skills×3, portfolio, readiness, network, readiness, resume)
const PM_QUESTIONS: QuizQuestion[] = [
  { text: '你有過擔任功能規劃、流程改善或需求訪談的實際經驗（實習/社團/個人專案）', dimension: 'experience' },
  { text: '你有過從零做到有、可以展示的產品或系統（App、網站、工具、活動平台等）', dimension: 'portfolio' },
  { text: '你用過 Excel、SQL 或 Google Analytics 等工具分析數據，並做出某個判斷', dimension: 'skills' },
  { text: '你有和「不懂技術的人」或「不懂業務的人」協調、說服對方的實際案例', dimension: 'skills' },
  { text: '你知道什麼是 PRD、User Story、北極星指標，並能用自己的話解釋', dimension: 'skills' },
  { text: '你的履歷或作品集有使用者研究（訪談、問卷、回饋分析）的紀錄', dimension: 'portfolio' },
  { text: '你對目標公司有基本了解，並能說出你為什麼選這家而非競爭對手', dimension: 'readiness' },
  { text: '你認識至少一位已在業界的 PM，或參加過 PM 相關的讀書會/社群', dimension: 'network' },
  { text: '你練習過「為什麼想做 PM」「說說你主導的一個專案」等行為面試題', dimension: 'readiness' },
  { text: '你的履歷上有至少 2 個量化成果，並且整份文件在 1 頁以內', dimension: 'resume' },
];

// NOTE: 草稿，待人資校準
const BA_QUESTIONS: QuizQuestion[] = [
  { text: '你曾使用 SQL 或 Python 從資料中找出實際可用的洞察', dimension: 'skills' },
  { text: '你做過一份以數據為核心的分析報告或 case study', dimension: 'portfolio' },
  { text: '你知道 MECE、Issue Tree 等結構化問題拆解方法，並實際用過', dimension: 'skills' },
  { text: '你有以視覺化圖表（Tableau/Power BI/matplotlib）呈現結論的作品', dimension: 'portfolio' },
  { text: '你參加過個案競賽，或模擬過商業問題的分析與建議', dimension: 'experience' },
  { text: '你能從一份財務報表中找出至少 3 個有意義的觀察', dimension: 'skills' },
  { text: '你的履歷有清楚的量化成果，例如分析影響了某個決策', dimension: 'resume' },
  { text: '你認識或觀摩過真實的 BA 工作，清楚日常任務與技能需求', dimension: 'readiness' },
  { text: '你在學術或實習中有實際蒐集並清理資料的經驗', dimension: 'experience' },
  { text: '你能用 Excel 製作樞紐分析表並解釋結果', dimension: 'skills' },
];

// NOTE: 草稿，待人資校準
const MARKETING_QUESTIONS: QuizQuestion[] = [
  { text: '你獨立（或主導）運營過社群帳號，並有成效數字可以說', dimension: 'portfolio' },
  { text: '你規劃過一場活動或行銷企劃，從提案到執行都親自負責', dimension: 'experience' },
  { text: '你能用 Google Analytics 或社群後台解讀流量與受眾資料', dimension: 'skills' },
  { text: '你有一份可以展示的文案或視覺設計作品', dimension: 'portfolio' },
  { text: '你對目標族群（學生/上班族/特定興趣群）有具體的洞察與描述', dimension: 'skills' },
  { text: '你做過 A/B 測試或效果追蹤，能說出哪個版本更好、為什麼', dimension: 'skills' },
  { text: '你的履歷上有以「觸及人數/互動率/業績轉換」為單位的成果', dimension: 'resume' },
  { text: '你熟悉 Canva、Figma 或 Adobe 工具，做過圖文或短影音', dimension: 'skills' },
  { text: '你閱讀過行銷相關書籍或課程，並實際套用過某個框架', dimension: 'readiness' },
  { text: '你認識至少一位行銷從業者，或主動在 LinkedIn 關注業界動態', dimension: 'network' },
];

// NOTE: 草稿，待人資校準
const HR_QUESTIONS: QuizQuestion[] = [
  { text: '你負責過社團招募、選才或新生訓練，有實際流程設計與執行經驗', dimension: 'experience' },
  { text: '你能描述一個你解決「人際衝突」或「溝通卡關」的具體案例', dimension: 'skills' },
  { text: '你知道《勞動基準法》的基本規定，例如工時上限、特休計算', dimension: 'skills' },
  { text: '你規劃過活動、教育訓練或工作坊，並執行到完成', dimension: 'portfolio' },
  { text: '你的履歷清楚展示帶人、溝通、協調的角色與成果', dimension: 'resume' },
  { text: '你有擔任過幹部、隊長或小組負責人，並管理過至少 3 人', dimension: 'experience' },
  { text: '你熟悉或使用過 ATS（應徵者追蹤系統）或 HR 工具', dimension: 'skills' },
  { text: '你主動了解過 HR 的不同功能（招募/訓練/薪酬/員關）', dimension: 'readiness' },
  { text: '你認識至少一位 HR 從業者，或參加過 HR 相關社群活動', dimension: 'network' },
  { text: '你的履歷呈現細緻、格式整齊、無錯字，讓人感受到你的細心', dimension: 'resume' },
];

// NOTE: 草稿，待人資校準
const BD_QUESTIONS: QuizQuestion[] = [
  { text: '你曾主動聯繫陌生對象（客戶/合作方/廠商）並成功建立合作', dimension: 'experience' },
  { text: '你有可以展示的提案書、pitch deck 或業務計畫', dimension: 'portfolio' },
  { text: '你能說出一個你靠說服力或談判達成目標的具體故事', dimension: 'skills' },
  { text: '你對目標行業的市場結構、主要玩家有基本了解', dimension: 'skills' },
  { text: '你的履歷有可量化的業績、開發成果或合作達成率', dimension: 'resume' },
  { text: '你有在高壓或被拒絕後仍持續推進的實際案例', dimension: 'skills' },
  { text: '你使用過 CRM 工具（Salesforce/HubSpot/Excel 客戶表）管理聯絡人', dimension: 'skills' },
  { text: '你了解業務開發的基本流程（開發→提案→談判→簽約→售後）', dimension: 'readiness' },
  { key: 'network', text: '你有業界人脈，或主動參加業務/BD 相關的社群或活動', dimension: 'network' } as QuizQuestion,
  { text: '你能清楚說明你選擇業務開發的理由，並對長期挑戰有心理準備', dimension: 'readiness' },
];

// NOTE: 草稿，待人資校準
const CONSULTANT_QUESTIONS: QuizQuestion[] = [
  { text: '你參加過個案競賽（BCG/McKinsey 等）並進入決賽或獲獎', dimension: 'experience' },
  { text: '你有一份以 MECE/Issue Tree 為基礎的簡報作品，可以展示', dimension: 'portfolio' },
  { text: '你的 GPA 在 3.5（或系上前 20%）以上', dimension: 'skills' },
  { text: '你能用英文做一份完整的商業簡報，包括口頭說明', dimension: 'skills' },
  { text: '你曾主導或深度參與過一個需要大量研究與報告的專案', dimension: 'experience' },
  { text: '你在學業或實習中有量化分析（財務建模/市場規模估算）的實際練習', dimension: 'skills' },
  { text: '你的履歷清楚展示結構化思考與成果，而不只是職責清單', dimension: 'resume' },
  { text: '你了解顧問公司的日常工作、升遷路徑與主要挑戰', dimension: 'readiness' },
  { text: '你認識至少一位顧問從業者，或參加過校友分享/info session', dimension: 'network' },
  { text: '你做過至少 5 個個案練習，並且有人給過你回饋', dimension: 'readiness' },
];

// NOTE: 草稿，待人資校準
const SWE_QUESTIONS: QuizQuestion[] = [
  { text: '你有放在 GitHub 上、功能完整的 side project 或作品集', dimension: 'portfolio' },
  { text: '你在 LeetCode 或類似平台練習過演算法題，並能解 Medium 難度', dimension: 'skills' },
  { text: '你能說出一個你從零設計並開發完成的系統，說明技術選型理由', dimension: 'portfolio' },
  { text: '你熟悉至少一種主流語言（Python/Java/JavaScript/Go）與對應框架', dimension: 'skills' },
  { text: '你參與過有版本控制（Git）的團隊協作開發', dimension: 'experience' },
  { text: '你能解釋 HTTP 請求流程、資料庫索引或常見設計模式中的任一個', dimension: 'skills' },
  { text: '你的履歷清楚列出技術棧，並有量化成果（效能提升/用戶數）', dimension: 'resume' },
  { text: '你有實習或參與開源的經驗，並理解工程師的日常工作', dimension: 'experience' },
  { text: '你認識至少一位軟體工程師，並了解你感興趣的團隊或技術方向', dimension: 'network' },
  { text: '你練習過技術面試（系統設計/coding interview），並得到過實際回饋', dimension: 'readiness' },
];

// NOTE: 草稿，待人資校準
const DATA_QUESTIONS: QuizQuestion[] = [
  { text: '你能寫出完整的 SQL 查詢，包含 JOIN、GROUP BY 和子查詢', dimension: 'skills' },
  { text: '你用 Python 做過端到端的資料分析，從清理到視覺化', dimension: 'portfolio' },
  { text: '你了解常用的統計概念（均值/標準差/p-value/相關性）', dimension: 'skills' },
  { text: '你用 Tableau、Power BI 或 Matplotlib 做過可展示的儀表板或圖表', dimension: 'portfolio' },
  { text: '你有在 Kaggle 或真實資料集上完成過一個分析專案', dimension: 'experience' },
  { text: '你能把一個複雜的數據結論用非技術的語言說清楚', dimension: 'skills' },
  { text: '你的履歷展示了分析工具的熟練度與帶有數字的結論', dimension: 'resume' },
  { text: '你熟悉資料清理的常見挑戰（缺漏值/離群值/重複資料）並有處理經驗', dimension: 'skills' },
  { text: '你了解數據分析師在公司的角色與常見業務問題', dimension: 'readiness' },
  { text: '你認識至少一位數據分析師，或參加過相關的讀書會/活動', dimension: 'network' },
];

// NOTE: 草稿，待人資校準
const UXR_QUESTIONS: QuizQuestion[] = [
  { text: '你做過深度訪談，有完整的訪綱與逐字稿或筆記', dimension: 'experience' },
  { text: '你有一份可展示的使用者研究報告，包含洞察與設計建議', dimension: 'portfolio' },
  { text: '你能說清楚「田野調查」「情境訪談」「卡片分類」的區別與適用時機', dimension: 'skills' },
  { text: '你設計過問卷，並分析過回收結果，做出有意義的結論', dimension: 'skills' },
  { text: '你做過可用性測試，包含任務設計、觀察與問題歸因', dimension: 'experience' },
  { text: '你修過認知心理學、行為科學或統計相關課程，並能應用', dimension: 'skills' },
  { text: '你的履歷清楚展示研究場次數量、方法論與洞察影響', dimension: 'resume' },
  { text: '你熟悉 Figma 或其他原型工具，並能與設計師有效溝通', dimension: 'portfolio' },
  { text: '你了解 UXR 與 UX Design 的差異，以及 Research 在產品流程中的位置', dimension: 'readiness' },
  { text: '你認識至少一位 UXR 從業者，或在 Medium/Matters 等平台發表過研究心得', dimension: 'network' },
];

// NOTE: 草稿，待人資校準
const FINANCE_QUESTIONS: QuizQuestion[] = [
  { text: '你能看懂一份上市公司的損益表和資產負債表，並找出 3 個觀察', dimension: 'skills' },
  { text: '你用 Excel 做過財務建模或估值練習（DCF/比較法）', dimension: 'portfolio' },
  { text: '你的 GPA 或學業成績明顯優異，或有金融相關獎學金', dimension: 'skills' },
  { text: '你考過或正在備考金融相關證照（金研院/CFA L1/CFP）', dimension: 'skills' },
  { text: '你做過股票研究、產業報告或投資組合模擬的作品', dimension: 'portfolio' },
  { text: '你能用英文閱讀金融新聞，並了解主要央行政策的意涵', dimension: 'skills' },
  { text: '你的履歷上有分析相關成果，細心度展示（無錯字、格式整齊）', dimension: 'resume' },
  { text: '你有金融實習、投資社團或 CFA 讀書會的參與經驗', dimension: 'experience' },
  { text: '你了解你申請職位（IB/AM/研究/Corp Fin）的日常工作與文化', dimension: 'readiness' },
  { text: '你認識至少一位金融從業者，並和他交流過職涯路徑', dimension: 'network' },
];

export const ABILITY_QUESTIONS: Record<RoleId, QuizQuestion[]> = {
  product_manager: PM_QUESTIONS,
  business_analyst: BA_QUESTIONS,
  marketing: MARKETING_QUESTIONS,
  hr: HR_QUESTIONS,
  business_dev: BD_QUESTIONS,
  consultant: CONSULTANT_QUESTIONS,
  software_eng: SWE_QUESTIONS,
  data_analyst: DATA_QUESTIONS,
  ux_researcher: UXR_QUESTIONS,
  finance: FINANCE_QUESTIONS,
};

export function computeDimensionScores(answers: number[], questions: QuizQuestion[]): Record<Dimension, { got: number; max: number }> {
  const dims: Dimension[] = ['experience', 'skills', 'portfolio', 'resume', 'network', 'readiness'];
  const result = {} as Record<Dimension, { got: number; max: number }>;
  for (const d of dims) {
    result[d] = { got: 0, max: 0 };
  }
  questions.forEach((q, i) => {
    result[q.dimension].got += (answers[i] ?? 0);
    result[q.dimension].max += 2;
  });
  return result;
}

export function getWeakestDimensions(dimScores: Record<Dimension, { got: number; max: number }>): Dimension[] {
  const pcts = Object.entries(dimScores)
    .filter(([, v]) => v.max > 0)
    .map(([d, v]) => ({ d: d as Dimension, pct: v.got / v.max }))
    .sort((a, b) => a.pct - b.pct);
  return pcts.slice(0, 3).map((x) => x.d);
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  experience: '實習/經歷',
  skills: '技能',
  portfolio: '作品集',
  resume: '履歷品質',
  network: '人脈網絡',
  readiness: '投遞準備',
};
