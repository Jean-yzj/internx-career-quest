'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import Mascot from '@/components/Mascot';
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

function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#E8A800" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="6" fill="none" stroke="#E8A800" strokeWidth="1"/>
      <path d="M10 6l1.2 2.5h2.6l-2.1 1.6.8 2.6L10 11.3l-2.5 1.4.8-2.6L6.2 8.5h2.6Z" fill="#E8A800" opacity=".8"/>
    </svg>
  );
}

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
      const filled = next.map((v) => v ?? 0);
      const { scores, code } = computeHollandCode(filled);
      const topRoleIds = getTopRoleIds(code);
      const { name: typeName, desc: typeDesc } = getTypeName(code);
      const r = { hollandCode: code, scores, topRoleIds, typeName, typeDesc };
      setResult(r);
      const data = loadQuest();
      data.interest = { hollandCode: code, topRoleIds, scores, at: new Date().toISOString() };
      saveQuest(data);
      award('interest_quiz', 30, '完成興趣方向測驗', true);
      setPhase('result');
    }
  }

  function handleSetAsTarget(roleId: string) {
    const data = loadQuest();
    if (!data.profile) {
      data.profile = { careerStatus: 'exploring', targetRoleId: roleId, customRoleLabel: null, createdAt: new Date().toISOString() };
    } else {
      data.profile.targetRoleId = roleId;
    }
    saveQuest(data);
    router.push('/island');
  }

  if (phase === 'quiz') {
    const q = RIASEC_QUESTIONS[current];
    const answered = answers.filter((a) => a !== null).length;
    const total = 18;
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/quiz/interest" />
        <main className="site-main" id="main-content">
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>興趣方向測驗</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: 14 }}>18 題，每題評估符合程度</p>
            {/* segmented candy progress bar */}
            <div className="quiz-progress-segments" aria-label={`第 ${current + 1} 題，共 18 題`}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`quiz-seg${i < answered ? ' quiz-seg-done' : i === current ? ' quiz-seg-current' : ''}`}
                />
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', textAlign: 'right', marginBottom: 18 }}>
              {answered}/{total}
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
              <button type="button" className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setCurrent(current - 1)}>
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
          {/* Big medal result */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="result-medal-wrap">
              <Mascot size={72} variant="cheer" className="mascot-idle" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className="result-medal">{result.hollandCode}</div>
                <div style={{ marginTop: 18 }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{typeInfo.name}</h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.6, textAlign: 'center', maxWidth: 380 }}>{typeInfo.desc}</p>
              </div>
            </div>
          </div>

          {/* Score bars */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>六型得分分佈</h3>
            {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((t) => {
              const typeLabels: Record<string, string> = { R: '實用型', I: '研究型', A: '藝術型', S: '社會型', E: '企業型', C: '傳統型' };
              const score = result.scores[t] ?? 0;
              return (
                <div key={t} className="dim-bar-row" style={{ marginBottom: 8 }}>
                  <span className="dim-bar-label">{typeLabels[t]}</span>
                  <div className="dim-bar-track">
                    <div className="dim-bar-fill" style={{ width: `${(score / 9) * 100}%` }} />
                  </div>
                  <span className="dim-bar-score">{score}/9</span>
                </div>
              );
            })}
          </div>

          {/* Recommended roles */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>推薦探索的方向</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.topRoleIds.map((roleId) => {
                const role = getRoleById(roleId);
                if (!role) return null;
                return (
                  <div key={roleId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--sky-soft)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{role.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 2 }}>{role.description}</div>
                    </div>
                    <button type="button" className="btn-game" style={{ padding: '8px 16px', fontSize: '0.875rem', boxShadow: '0 3px 0 var(--brand-deep)' }} onClick={() => handleSetAsTarget(roleId)}>
                      設為目標
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points earned notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--sand-soft)', border: '1.5px solid var(--sand)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20 }}>
            <CoinIcon size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--sand-deep)' }}>+30 金幣解鎖</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>完成「興趣方向測驗」任務</span>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/report" className="btn-game" style={{ flex: 1 }}>看你的專屬探索報告</a>
            <a href="/island" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>直接去闖關島</a>
          </div>
          <div style={{ marginTop: 10 }}>
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
