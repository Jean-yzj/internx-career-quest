// RIASEC 18-question interest quiz — pure rules, no LLM
// Questions are verbatim from spec §4

export const RIASEC_QUESTIONS = [
  { id: 1,  type: 'R' as const, text: '我喜歡動手組裝、修理或操作工具設備' },
  { id: 2,  type: 'R' as const, text: '比起討論想法，我更喜歡實際做出一個東西' },
  { id: 3,  type: 'R' as const, text: '戶外或勞作型的活動讓我有成就感' },
  { id: 4,  type: 'I' as const, text: '我喜歡研究問題背後的原因' },
  { id: 5,  type: 'I' as const, text: '分析資料或查證資訊讓我很投入' },
  { id: 6,  type: 'I' as const, text: '我常想了解事情運作的原理' },
  { id: 7,  type: 'A' as const, text: '我喜歡創作內容（文字、影像、設計）' },
  { id: 8,  type: 'A' as const, text: '我重視用自己的方式表達想法' },
  { id: 9,  type: 'A' as const, text: '沒有標準答案的任務讓我興奮' },
  { id: 10, type: 'S' as const, text: '幫助別人解決問題讓我有能量' },
  { id: 11, type: 'S' as const, text: '我擅長傾聽並理解別人的感受' },
  { id: 12, type: 'S' as const, text: '我喜歡教別人或帶新人' },
  { id: 13, type: 'E' as const, text: '我喜歡說服別人接受我的想法' },
  { id: 14, type: 'E' as const, text: '帶領團隊或主導專案讓我興奮' },
  { id: 15, type: 'E' as const, text: '我對談判、銷售或爭取資源有興趣' },
  { id: 16, type: 'C' as const, text: '我喜歡把資料整理得井井有條' },
  { id: 17, type: 'C' as const, text: '按部就班、有明確規則的工作讓我安心' },
  { id: 18, type: 'C' as const, text: '我會注意細節與正確性' },
];

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

// Tiebreak order
const TIEBREAK_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export function computeHollandCode(answers: number[]): { scores: Record<HollandType, number>; code: string } {
  const scores: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  RIASEC_QUESTIONS.forEach((q, i) => {
    scores[q.type] += (answers[i] ?? 0);
  });

  // Sort by score desc, tiebreak by RIASEC order
  const sorted = (Object.keys(scores) as HollandType[]).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return TIEBREAK_ORDER.indexOf(a) - TIEBREAK_ORDER.indexOf(b);
  });

  return { scores, code: sorted[0] + sorted[1] };
}

// RIASEC pair (unordered) -> recommended role IDs (can be mapped by sorting the code)
const RIASEC_ROLE_MAP: Record<string, string[]> = {
  'RI': ['software_eng', 'data_analyst', 'consultant'],
  'RA': ['software_eng', 'ux_researcher', 'marketing'],
  'RS': ['ux_researcher', 'hr', 'software_eng'],
  'RE': ['business_dev', 'product_manager', 'software_eng'],
  'RC': ['data_analyst', 'finance', 'software_eng'],
  'IA': ['ux_researcher', 'data_analyst', 'marketing'],
  'IS': ['ux_researcher', 'hr', 'consultant'],
  'IE': ['consultant', 'business_analyst', 'product_manager'],
  'IC': ['data_analyst', 'business_analyst', 'finance'],
  'AS': ['marketing', 'hr', 'ux_researcher'],
  'AE': ['marketing', 'business_dev', 'product_manager'],
  'AC': ['marketing', 'business_analyst', 'ux_researcher'],
  'SE': ['hr', 'business_dev', 'product_manager'],
  'SC': ['hr', 'finance', 'business_analyst'],
  'EC': ['finance', 'business_dev', 'business_analyst'],
};

export function getTopRoleIds(hollandCode: string): string[] {
  if (hollandCode.length < 2) return [];
  const a = hollandCode[0];
  const b = hollandCode[1];
  // Normalize to canonical sorted key
  const key = a < b ? a + b : b + a;
  return RIASEC_ROLE_MAP[key] ?? [];
}

// NOTE: mapping is initial version, can be adjusted based on feedback
// 15 RIASEC pair personality type names (2-5 chars each, positive framing)
export const RIASEC_TYPE_NAMES: Record<string, { name: string; desc: string }> = {
  'RI': { name: '實踐探究者', desc: '你同時喜歡動手做與追根究底。面對問題時，你既想理解原理，也不滿足於只停留在理論層面。' },
  'RA': { name: '工藝創造者', desc: '你擅長把想法化為有形成果。藝術感與動手能力讓你能創作出兼具美感和實用性的作品。' },
  'RS': { name: '實務協助者', desc: '你踏實、可靠，樂於以具體行動幫助他人。喜歡有條理地完成任務，並在過程中支持夥伴。' },
  'RE': { name: '行動推進者', desc: '你有強烈的執行力與領導欲。不只是說說，你習慣直接出手把計畫推進到位。' },
  'RC': { name: '精準執行者', desc: '你注重細節與準確性，做事有條不紊。對於需要精確執行的工作，你能做到幾乎零失誤。' },
  'IA': { name: '洞察創作者', desc: '你兼具分析力與創造力。不滿足於現有答案，喜歡從深層研究中找到新的表達角度。' },
  'IS': { name: '研究關懷者', desc: '你用理解力和同理心接近世界。喜歡研究人的行為，並把洞察轉化為對他人有意義的幫助。' },
  'IE': { name: '策略說服者', desc: '你善於把複雜的分析轉化為有力的論點，並推動他人採取行動。' },
  'IC': { name: '系統思考者', desc: '你擅長建立嚴謹的框架，把龐雜資訊整理成清晰的結構，讓每個人都看得懂。' },
  'AS': { name: '創意連結者', desc: '你用創意與溫度感染他人。喜歡透過藝術或說故事建立人與人之間的共鳴。' },
  'AE': { name: '企劃領航者', desc: '你充滿創意又有推動力，能把天馬行空的想法包裝成讓人信服的提案。' },
  'AC': { name: '美感整合者', desc: '你同時具備藝術品味與細心，能在創意與規格之間找到完美平衡。' },
  'SE': { name: '人際推進者', desc: '你在人際關係中充滿能量，擅長激勵他人、化解衝突，把眾人導向共同目標。' },
  'SC': { name: '穩定支柱者', desc: '你是組織裡最可靠的那個人。細心、體貼，能在混亂中維持秩序，讓團隊放心交付。' },
  'EC': { name: '務實領導者', desc: '你目標清晰，執行嚴謹，能在有限資源下做出最有效率的決策。' },
};

export function getTypeName(hollandCode: string): { name: string; desc: string } {
  if (hollandCode.length < 2) return { name: '探索中', desc: '繼續完成測驗以獲得結果。' };
  const a = hollandCode[0];
  const b = hollandCode[1];
  const key = a < b ? a + b : b + a;
  return RIASEC_TYPE_NAMES[key] ?? { name: '獨特組合', desc: '你的興趣組合相當獨特，適合跨領域發展。' };
}
