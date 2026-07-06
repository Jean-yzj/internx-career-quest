'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import type { CareerStatus } from '@/lib/types';
import { loadQuest, saveQuest, award } from '@/lib/quest-store';
import { ROLES } from '@/lib/roles';
import { getTodayStr } from '@/lib/types';

const CAREER_STATUS_OPTIONS: { value: CareerStatus; label: string; desc: string }[] = [
  { value: 'exploring',  label: '還在探索方向', desc: '對職涯方向還沒有定見，想先了解各種可能性。' },
  { value: 'narrowing',  label: '縮小目標中', desc: '有 1-3 個感興趣的方向，正在深入了解。' },
  { value: 'targeting',  label: '目標明確', desc: '知道自己想做什麼，正在準備所需的技能與作品。' },
  { value: 'applying',   label: '積極投遞中', desc: '已開始投履歷，等待回音或準備面試。' },
  { value: 'leveling',   label: '已有工作/實習', desc: '現在有在職或實習，想繼續學習或尋找下一步。' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [careerStatus, setCareerStatus] = useState<CareerStatus | null>(null);
  const [targetRoleId, setTargetRoleId] = useState<string | null>(null);

  function handleStatusNext() {
    if (!careerStatus) return;
    if (careerStatus === 'exploring') {
      // Save with no target, go to interest quiz
      const data = loadQuest();
      data.profile = {
        careerStatus,
        targetRoleId: null,
        customRoleLabel: null,
        createdAt: new Date().toISOString(),
      };
      saveQuest(data);
      award('onboarding_done', 20, '完成闖關啟程', true);
      router.push('/quiz/interest');
    } else {
      setStep(2);
    }
  }

  function handleRoleSelect(roleId: string | null) {
    setTargetRoleId(roleId);
  }

  function handleFinish() {
    if (!careerStatus) return;
    const data = loadQuest();
    data.profile = {
      careerStatus,
      targetRoleId: targetRoleId,
      customRoleLabel: null,
      createdAt: new Date().toISOString(),
    };
    data.daily = { date: getTodayStr(), taskCodes: [], doneCodes: [] };
    saveQuest(data);
    award('onboarding_done', 20, '完成闖關啟程', true);
    router.push('/island');
  }

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-header-inner">
          <a href="/" className="site-logo">職涯闖關島</a>
        </div>
      </header>

      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'right' }}>步驟 {step}/2</p>
          </div>

          {step === 1 && (
            <>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 8 }}>目前的職涯狀態？</h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: 24 }}>這會幫助我們推薦最適合你的每日任務。</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CAREER_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCareerStatus(opt.value)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius)',
                      border: `2px solid ${careerStatus === opt.value ? 'var(--brand)' : 'var(--line)'}`,
                      background: careerStatus === opt.value ? '#EBF5FF' : 'var(--card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!careerStatus}
                  onClick={handleStatusNext}
                  style={{ flex: 1 }}
                >
                  下一步
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 8 }}>目標職位是？</h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: 24 }}>選一個最感興趣的方向，之後可以更改。不確定的話，去做興趣測驗找靈感。</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 'var(--radius)',
                      border: `2px solid ${targetRoleId === role.id ? 'var(--brand)' : 'var(--line)'}`,
                      background: targetRoleId === role.id ? '#EBF5FF' : 'var(--card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.9375rem' }}>{role.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginTop: 2 }}>{role.shortName}</div>
                  </button>
                ))}
              </div>
              <a
                href="/quiz/interest"
                style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', color: 'var(--brand-dark)', textDecoration: 'underline', marginBottom: 24 }}
              >
                還不知道？去做興趣測驗
              </a>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>上一步</button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!targetRoleId}
                  onClick={handleFinish}
                  style={{ flex: 1 }}
                >
                  開始闖關
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
