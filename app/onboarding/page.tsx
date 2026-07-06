'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Avatar, { AVATAR_NAMES } from '@/components/Avatar';
import type { AvatarId } from '@/components/Avatar';
import Mascot from '@/components/Mascot';
import { loadQuest, saveQuest, award } from '@/lib/quest-store';
import { saveProfile, getOrCreateDeviceId, type Grade } from '@/lib/profile';
import { ROLES } from '@/lib/roles';
import styles from './onboarding.module.css';

// Sensitive word check (mirrors API)
const SENSITIVE = ['色情', '賭博', '詐騙', '援交', '開槍', '炸彈', 'fuck', 'shit'];
function hasSensitive(t: string) { return SENSITIVE.some((w) => t.toLowerCase().includes(w)); }

const AVATAR_IDS: AvatarId[] = [1, 2, 3, 4, 5, 6];

const GRADE_OPTIONS: { value: Grade; label: string }[] = [
  { value: 'y1', label: '大一' },
  { value: 'y2', label: '大二' },
  { value: 'y3', label: '大三' },
  { value: 'y4', label: '大四' },
  { value: 'grad', label: '碩士生' },
  { value: 'fresh', label: '應屆或已畢業' },
];

const BIRTH_YEARS = Array.from({ length: 11 }, (_, i) => 2000 + i);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 'celebrate'>(1);
  const [avatarId, setAvatarId] = useState<AvatarId>(1);
  const [nickname, setNickname] = useState('');
  const [nicknameErr, setNicknameErr] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [hasResume, setHasResume] = useState(false);
  const [hasClubExp, setHasClubExp] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [goalRoleId, setGoalRoleId] = useState<string | null>(null);
  const [transferCode, setTransferCode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferInput, setTransferInput] = useState('');
  const [transferErr, setTransferErr] = useState('');
  const [transferring, setTransferring] = useState(false);

  function validateNickname(v: string) {
    if (v.length < 2 || v.length > 12) return '暱稱需 2–12 字';
    if (hasSensitive(v)) return '暱稱含有不允許的詞彙';
    return '';
  }

  function handleStep1Next() {
    const err = validateNickname(nickname);
    if (err) { setNicknameErr(err); return; }
    setNicknameErr('');
    setStep(2);
  }

  function handleStep2Next() {
    if (!grade) return;
    setStep(3);
  }

  async function handleFinish() {
    if (registering) return;
    setRegistering(true);
    const deviceId = getOrCreateDeviceId();

    const profile = {
      deviceId,
      nickname,
      avatarId,
      grade: grade as Grade,
      hasResume,
      hasClubExp,
      hasApplied,
      birthYear: birthYear ? Number(birthYear) : null,
      goalRoleId: goalRoleId ?? null,
      transferCode: '', // filled from API
      registeredAt: new Date().toISOString(),
    };

    // Call register API
    let tc = '';
    try {
      const res = await fetch('/api/profile/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.transferCode) tc = data.transferCode;
    } catch {
      // DB unavailable — continue in local-only mode
    }

    profile.transferCode = tc || 'LOCAL-ONLY';
    saveProfile(profile);

    // Also award onboarding points
    const quest = loadQuest();
    if (!quest.profile) {
      quest.profile = {
        careerStatus: 'exploring',
        targetRoleId: goalRoleId,
        customRoleLabel: null,
        createdAt: new Date().toISOString(),
      };
      saveQuest(quest);
    }
    award('onboarding_done', 20, '完成闖關啟程', true);

    setTransferCode(tc);
    setRegistering(false);
    setStep('celebrate');
  }

  async function handleTransfer() {
    if (transferring) return;
    const code = transferInput.trim().toUpperCase();
    if (code.length !== 8) { setTransferErr('引繼碼為 8 碼'); return; }
    setTransferring(true);
    setTransferErr('');
    try {
      const newDeviceId = getOrCreateDeviceId();
      const res = await fetch('/api/profile/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferCode: code, newDeviceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.profile) {
        setTransferErr(data.error === 'NOT_FOUND' ? '引繼碼無效或已使用' : data.error || '引繼失敗');
        setTransferring(false);
        return;
      }
      const p = data.profile;
      saveProfile({
        deviceId: p.deviceId,
        nickname: p.nickname,
        avatarId: p.avatarId,
        grade: p.grade,
        hasResume: p.hasResume,
        hasClubExp: p.hasClubExp,
        hasApplied: p.hasApplied,
        birthYear: p.birthYear ?? null,
        goalRoleId: p.goalRoleId ?? null,
        transferCode: p.transferCode,
        registeredAt: p.registeredAt,
      });
      router.push('/island');
    } catch {
      setTransferErr('網路錯誤，請稍後再試');
      setTransferring(false);
    }
  }

  const totalSteps = 3;
  const stepNum = step === 'celebrate' ? 3 : Number(step);
  const progressPct = (stepNum / totalSteps) * 100;

  if (step === 'celebrate') {
    return (
      <div className="site-wrapper">
        <header className="site-header">
          <div className="site-header-inner">
            <a href="/" className="site-logo">職涯闖關島</a>
          </div>
        </header>
        <main className="site-main" id="main-content">
          <div className={styles.celebrateWrap}>
            <Mascot size={100} variant="cheer" className="mascot-idle" />
            <h1 className={styles.celebrateTitle}>出發了！</h1>
            <p className={styles.celebrateSubtitle}>地圖生成中，先看看你的島！</p>
            {transferCode && transferCode !== 'LOCAL-ONLY' && (
              <div className={styles.transferCodeCard}>
                <div className={styles.transferCodeLabel}>你的引繼碼（換裝置時使用）</div>
                <div className={styles.transferCodeValue}>{transferCode}</div>
                <div className={styles.transferCodeHint}>記下來！這是你的帳號鑰匙。</div>
              </div>
            )}
            <button
              type="button"
              className="btn-game"
              style={{ marginTop: 24 }}
              onClick={() => router.push('/island')}
            >
              前往我的島
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
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

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div className={styles.segBar}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`${styles.seg} ${s < stepNum ? styles.segDone : ''} ${s === stepNum ? styles.segCurrent : ''}`}
                />
              ))}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'right' }}>步驟 {stepNum}/3</p>
          </div>

          {/* Step 1: 捏角 */}
          {step === 1 && (
            <div>
              <h1 className={styles.stepTitle}>設計你的冒險角色</h1>
              <p className={styles.stepDesc}>選一個你喜歡的頭像，取個暱稱，一起出發！</p>

              {/* Transfer link */}
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                  onClick={() => setShowTransfer(!showTransfer)}
                >
                  已有帳號？輸入引繼碼接回進度
                </button>
                {showTransfer && (
                  <div className={styles.transferBox}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 8 }}>
                      引繼碼帶回你的等級、點數與排行榜身分（本地任務進度不還原）
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="8 碼引繼碼"
                        value={transferInput}
                        onChange={(e) => setTransferInput(e.target.value.toUpperCase())}
                        style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={transferring}
                        onClick={handleTransfer}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {transferring ? '接回中…' : '接回'}
                      </button>
                    </div>
                    {transferErr && <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: 4 }}>{transferErr}</p>}
                  </div>
                )}
              </div>

              {/* Avatar picker */}
              <div className={styles.avatarGrid}>
                {AVATAR_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.avatarBtn} ${avatarId === id ? styles.avatarBtnSelected : ''}`}
                    onClick={() => setAvatarId(id)}
                    aria-label={`選擇頭像 ${AVATAR_NAMES[id]}`}
                  >
                    <Avatar avatarId={id} size={52} />
                    <span className={styles.avatarName}>{AVATAR_NAMES[id]}</span>
                  </button>
                ))}
              </div>

              {/* Nickname */}
              <div className="field-group" style={{ marginTop: 20 }}>
                <label className="field-label" htmlFor="nickname">
                  冒險者暱稱
                  <span style={{ fontWeight: 400, color: 'var(--ink-2)' }}>（2–12 字）</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  maxLength={12}
                  value={nickname}
                  onChange={(e) => { setNickname(e.target.value); setNicknameErr(''); }}
                  placeholder="例：快樂小PM"
                />
                {nicknameErr && <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: 4 }}>{nicknameErr}</p>}
              </div>

              <button
                type="button"
                className="btn-game"
                disabled={!nickname}
                onClick={handleStep1Next}
                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
              >
                下一步
              </button>
            </div>
          )}

          {/* Step 2: 你走到哪了 */}
          {step === 2 && (
            <div>
              <h1 className={styles.stepTitle}>你走到哪了？</h1>
              <p className={styles.stepDesc}>讓我們幫你規劃最適合的冒險路線。</p>

              {/* Grade */}
              <div className={styles.fieldGroup}>
                <div className="field-label" style={{ marginBottom: 8 }}>目前年級</div>
                <div className={styles.gradeGrid}>
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.gradeBtn} ${grade === opt.value ? styles.gradeBtnSelected : ''}`}
                      onClick={() => setGrade(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth year */}
              <div className="field-group">
                <label className="field-label" htmlFor="birthYear">
                  出生年（選填）
                </label>
                <select
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- 略過 --</option>
                  {BIRTH_YEARS.map((y) => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
              </div>

              {/* Three quick questions */}
              <div className={styles.fieldGroup}>
                <div className="field-label" style={{ marginBottom: 10 }}>快問三題</div>
                {[
                  { key: 'hasResume', label: '已經有一份履歷了？', value: hasResume, set: setHasResume },
                  { key: 'hasClubExp', label: '參加過社團或做過專案？', value: hasClubExp, set: setHasClubExp },
                  { key: 'hasApplied', label: '投遞過實習或工作？', value: hasApplied, set: setHasApplied },
                ].map((q) => (
                  <button
                    key={q.key}
                    type="button"
                    className={styles.toggleRow}
                    onClick={() => q.set(!q.value)}
                    aria-pressed={q.value}
                  >
                    <span className={styles.toggleLabel}>{q.label}</span>
                    <span className={`${styles.toggle} ${q.value ? styles.toggleOn : ''}`}>
                      <span className={styles.toggleThumb} />
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>上一步</button>
                <button
                  type="button"
                  className="btn-game"
                  disabled={!grade}
                  onClick={handleStep2Next}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 想去哪 */}
          {step === 3 && (
            <div>
              <h1 className={styles.stepTitle}>想去哪裡冒險？</h1>
              <p className={styles.stepDesc}>選你最感興趣的目標職位，選完才能生成你的專屬地圖。</p>

              <div className={styles.roleGrid}>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`${styles.roleBtn} ${goalRoleId === role.id ? styles.roleBtnSelected : ''}`}
                    onClick={() => setGoalRoleId(role.id)}
                  >
                    <span className={styles.roleName}>{role.name}</span>
                    <span className={styles.roleShort}>{role.shortName}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.roleBtn} ${goalRoleId === null ? styles.roleBtnSelected : ''}`}
                  onClick={() => setGoalRoleId(null)}
                  style={{ gridColumn: 'span 2' }}
                >
                  <span className={styles.roleName}>還不知道，先探索</span>
                  <span className={styles.roleShort}>探索軌</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(2)}>上一步</button>
                <button
                  type="button"
                  className="btn-game"
                  disabled={registering}
                  onClick={handleFinish}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {registering ? '生成中…' : '生成我的冒險地圖'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
