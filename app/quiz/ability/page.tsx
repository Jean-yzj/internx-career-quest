'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import { ABILITY_QUESTIONS, computeDimensionScores, getAbilityLevel, getWeakestDimensions, DIMENSION_LABELS, ABILITY_LEVEL_LABELS } from '@/lib/ability-quiz';
import { loadQuest, saveQuest, award } from '@/lib/quest-store';
import { getRoleById, ROLES } from '@/lib/roles';
import type { RoleId } from '@/lib/roles';

type Phase = 'select' | 'quiz' | 'result';

const ANSWER_OPTIONS = [
  { value: 2, label: '是' },
  { value: 1, label: '部分' },
  { value: 0, label: '否' },
];

export default function AbilityQuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('select');
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [current, setCurrent] = useState(0);

  const questions = roleId ? ABILITY_QUESTIONS[roleId] : null;

  function handleRoleSelect(id: RoleId) {
    setRoleId(id);
    setAnswers(Array(10).fill(null));
    setCurrent(0);
    setPhase('quiz');
  }

  function handleAnswer(val: number) {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
    if (current < 9) {
      setCurrent(current + 1);
    } else {
      // Done — save
      if (!roleId || !questions) return;
      const filled = next.map((v) => v ?? 0);
      const score = filled.reduce((s, v) => s + v, 0);
      const level = getAbilityLevel(score);
      const dimScores = computeDimensionScores(filled, questions);

      const data = loadQuest();
      data.ability = {
        roleId,
        answers: filled,
        score,
        level,
        dimensionScores: dimScores,
        at: new Date().toISOString(),
      };
      saveQuest(data);
      award('ability_quiz', 30, '完成能力水平測驗', true);
      setPhase('result');
    }
  }

  if (phase === 'select') {
    const data = typeof window !== 'undefined' ? null : null;
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/quiz/ability" />
        <main className="site-main" id="main-content">
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>能力水平測驗</h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: 24 }}>
              選一個目標職位，10 題自評了解你目前的準備程度。
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  style={{ padding: '14px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--line)', background: 'var(--card)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s' }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginTop: 2 }}>{r.shortName}</div>
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === 'quiz' && questions) {
    const q = questions[current];
    const answered = answers.filter((a) => a !== null).length;
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/quiz/ability" />
        <main className="site-main" id="main-content">
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6 }}>
              {getRoleById(roleId!)?.name} 能力測驗
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 16 }}>
              依據實際情況回答，是(2)／部分(1)／否(0)
            </p>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${(answered / 10) * 100}%` }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', textAlign: 'right', marginBottom: 20 }}>
              {answered}/10
            </p>
            <div className="quiz-question">
              <p className="quiz-q-num">題目 {current + 1}｜{DIMENSION_LABELS[q.dimension]}</p>
              <p className="quiz-q-text">{q.text}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {ANSWER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`quiz-opt-btn${answers[current] === opt.value ? ' quiz-opt-btn-selected' : ''}`}
                    style={{ minWidth: 80 }}
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
  const role = getRoleById(roleId!);
  const filled = answers.map((v) => v ?? 0);
  const score = filled.reduce((s, v) => s + v, 0);
  const level = getAbilityLevel(score);
  const dimScores = computeDimensionScores(filled, questions!);
  const weakest = getWeakestDimensions(dimScores);
  const levelInfo = ABILITY_LEVEL_LABELS[level];

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/quiz/ability" />
      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 4 }}>{role?.name} 能力測驗結果</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>
              {score}<span style={{ fontSize: '1.25rem', color: 'var(--ink-2)' }}>/20</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{levelInfo.label}</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{levelInfo.desc}</p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>六面向得分</h3>
            {(Object.entries(dimScores) as [string, { got: number; max: number }][]).map(([dim, v]) => (
              <div key={dim} className="dim-bar-row">
                <span className="dim-bar-label">{DIMENSION_LABELS[dim as keyof typeof DIMENSION_LABELS]}</span>
                <div className="dim-bar-track">
                  <div className="dim-bar-fill" style={{ width: v.max > 0 ? `${(v.got / v.max) * 100}%` : '0%' }} />
                </div>
                <span className="dim-bar-score">{v.got}/{v.max}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>優先補強的三個面向</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weakest.map((dim) => (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{DIMENSION_LABELS[dim]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/island" className="btn-primary" style={{ flex: 1 }}>查看推薦任務</a>
            <button type="button" className="btn-ghost" onClick={() => setPhase('select')}>
              換職位測驗
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
