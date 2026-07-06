'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import { RIASEC_QUESTIONS, computeHollandCode, getTopRoleIds, getTypeName } from '@/lib/interest-quiz';
import { loadQuest, saveQuest, award } from '@/lib/quest-store';
import { getRoleById } from '@/lib/roles';

type Phase = 'quiz' | 'result';

const OPTIONS = [
  { value: 0, label: '不像我' },
  { value: 1, label: '有點像' },
  { value: 2, label: '蠻像' },
  { value: 3, label: '很像' },
];

export default function InterestQuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<(number | null)[]>(Array(18).fill(null));
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<{
    hollandCode: string;
    scores: Record<string, number>;
    topRoleIds: string[];
    typeName: string;
    typeDesc: string;
  } | null>(null);

  function handleAnswer(val: number) {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
    if (current < RIASEC_QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      // All answered — compute result
      const filled = next.map((v) => v ?? 0);
      const { scores, code } = computeHollandCode(filled);
      const topRoleIds = getTopRoleIds(code);
      const { name: typeName, desc: typeDesc } = getTypeName(code);
      const r = { hollandCode: code, scores, topRoleIds, typeName, typeDesc };
      setResult(r);

      // Save to quest store
      const data = loadQuest();
      data.interest = {
        hollandCode: code,
        topRoleIds,
        scores,
        at: new Date().toISOString(),
      };
      saveQuest(data);
      award('interest_quiz', 30, '完成興趣方向測驗', true);
      setPhase('result');
    }
  }

  function handleSetAsTarget(roleId: string) {
    const data = loadQuest();
    if (!data.profile) {
      data.profile = {
        careerStatus: 'exploring',
        targetRoleId: roleId,
        customRoleLabel: null,
        createdAt: new Date().toISOString(),
      };
    } else {
      data.profile.targetRoleId = roleId;
    }
    saveQuest(data);
    router.push('/island');
  }

  if (phase === 'quiz') {
    const q = RIASEC_QUESTIONS[current];
    const answered = answers.filter((a) => a !== null).length;
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/quiz/interest" />
        <main className="site-main" id="main-content">
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6 }}>興趣方向測驗</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: 16 }}>18 題，每題評估符合程度（不需要過度思考）</p>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${(answered / 18) * 100}%` }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', textAlign: 'right', marginBottom: 20 }}>
              {answered}/18
            </p>

            <div className="quiz-question">
              <p className="quiz-q-num">題目 {current + 1}</p>
              <p className="quiz-q-text">{q.text}</p>
              <div className="quiz-options">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`quiz-opt-btn${answers[current] === opt.value ? ' quiz-opt-btn-selected' : ''}`}
                    onClick={() => handleAnswer(opt.value)}
                  >
                    <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{opt.value}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {current > 0 && (
              <button
                type="button"
                className="btn-ghost"
                style={{ marginTop: 8 }}
                onClick={() => setCurrent(current - 1)}
              >
                上一題
              </button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Result phase
  if (!result) return null;
  const typeInfo = getTypeName(result.hollandCode);

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/quiz/interest" />
      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 4 }}>你的 Holland 前二碼</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', marginBottom: 6 }}>
              {result.hollandCode}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{typeInfo.name}</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{typeInfo.desc}</p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>六型得分分佈</h3>
            {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((t) => {
              const typeLabels: Record<string, string> = {
                R: '實用型',
                I: '研究型',
                A: '藝術型',
                S: '社會型',
                E: '企業型',
                C: '傳統型',
              };
              const score = result.scores[t] ?? 0;
              return (
                <div key={t} className="dim-bar-row">
                  <span className="dim-bar-label">{typeLabels[t]}</span>
                  <div className="dim-bar-track">
                    <div className="dim-bar-fill" style={{ width: `${(score / 9) * 100}%` }} />
                  </div>
                  <span className="dim-bar-score">{score}</span>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>推薦探索的方向</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.topRoleIds.map((roleId) => {
                const role = getRoleById(roleId);
                if (!role) return null;
                return (
                  <div key={roleId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{role.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 2 }}>{role.description}</div>
                    </div>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleSetAsTarget(roleId)}
                    >
                      設為目標
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/island" className="btn-primary" style={{ flex: 1 }}>前往闖關島</a>
            <button type="button" className="btn-ghost" onClick={() => { setPhase('quiz'); setAnswers(Array(18).fill(null)); setCurrent(0); }}>
              重新測驗
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
