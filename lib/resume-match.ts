import type { Application, ResumeAnalysisResult } from './types';
import { getRoleById } from './roles';

export interface ResumeMatchResult {
  score: number;
  matched: string[];
  missing: string[];
  actions: string[];
}

export function calculateResumeMatch(
  app: Application,
  analysis: (ResumeAnalysisResult & { roleId: string }) | null,
): ResumeMatchResult | null {
  if (!analysis) return null;
  const role = getRoleById(analysis.roleId);
  if (!role) return null;
  const evidence = new Map(analysis.skillEvidence.map((item) => [item.skillKey, item.strength]));
  const totalWeight = role.skills.reduce((sum, skill) => sum + skill.weight, 0) || 1;
  const evidenceScore = role.skills.reduce(
    (sum, skill) => sum + ((evidence.get(skill.key) ?? 0) / 2) * skill.weight,
    0,
  ) / totalWeight;
  const score = Math.max(0, Math.min(100, Math.round(analysis.overall * 0.4 + evidenceScore * 60)));
  const matched = role.skills.filter((skill) => (evidence.get(skill.key) ?? 0) >= 2)
    .sort((a, b) => b.weight - a.weight).slice(0, 3).map((skill) => skill.label);
  const missing = role.skills.filter((skill) => (evidence.get(skill.key) ?? 0) < 2)
    .sort((a, b) => b.weight - a.weight).slice(0, 3).map((skill) => skill.label);
  const actions: string[] = [];
  if (missing[0]) actions.push(`先替「${missing[0]}」補一段可驗證的經歷或作品`);
  if (app.skills.length > 0) actions.push(`逐項對照職缺技能：${app.skills.slice(0, 3).join('、')}`);
  if (!app.resumeNote) actions.push('在這張職缺卡記下要調整的履歷版本與主打證據');
  return { score, matched, missing, actions: actions.slice(0, 3) };
}
