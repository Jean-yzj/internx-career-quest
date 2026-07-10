/**
 * lib/report.ts — 探索報告頁輔助函式
 * 純粹計算/格式化；無副作用；可在 server/client 兩端使用
 */

import { RIASEC_TYPE_NAMES } from './interest-quiz';
import { getRoleById } from './roles';

/**
 * 建構「為什麼適合你」說明句
 * 規則：你是{型態name}，{型態desc第一句}。這和{role.name}最看重的「{skills[0].label}」很吻合。
 */
export function buildWhyFitText(hollandCode: string, roleId: string): string {
  const code = hollandCode.length >= 2
    ? (() => { const a = hollandCode[0]; const b = hollandCode[1]; return a < b ? a + b : b + a; })()
    : hollandCode;

  const typeInfo = RIASEC_TYPE_NAMES[code];
  const role = getRoleById(roleId);

  if (!typeInfo || !role) return '';

  // 取 desc 第一句（以句號、。、！、? 等結尾，或整段）
  const firstSentence = typeInfo.desc.split(/[。！？.!?]/)[0] ?? typeInfo.desc;
  const topSkillLabel = role.skills[0]?.label ?? '';

  return `你是${typeInfo.name}，${firstSentence}。這和${role.name}最看重的「${topSkillLabel}」很吻合。`;
}

/** RIASEC 六型標籤（短） */
export const RIASEC_SHORT_LABELS: Record<string, string> = {
  R: '實用型',
  I: '研究型',
  A: '藝術型',
  S: '社會型',
  E: '企業型',
  C: '傳統型',
};
