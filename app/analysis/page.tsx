'use client';

import { useState } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import { ROLES } from '@/lib/roles';
import { loadQuest, saveQuest, award, regenerateQuestLine } from '@/lib/quest-store';
import type { ResumeAnalysisResult } from '@/lib/types';

type Phase = 'input' | 'loading' | 'result' | 'unavailable';

interface FullResult extends ResumeAnalysisResult {
  roleId: string;
  gaps: { skillKey: string; label: string; weight: number; strength: number; gapScore: number }[];
}

const DIM_LABELS: Record<string, string> = {
  relevance: '相關性',
  evidence: '具體度',
  completeness: '完整性',
  readability: '可讀性',
  credibility: '可信度',
  industry_fit: '行業適合',
};

function RadarSVGStyled({ dims }: { dims: Record<string, number> }) {
  const keys = Object.keys(dims);
  const n = keys.length;
  const cx = 100, cy = 100, r = 75;
  const pts = keys.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const val = (dims[keys[i]] ?? 1) / 5;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  });
  const gridPts = keys.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-label="六維雷達圖">
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
        const scalePts = keys.map((_, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
        }).join(' ');
        return <polygon key={scale} points={scalePts} fill="none" stroke="var(--line)" strokeWidth="0.8" />;
      })}
      {gridPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="0.8" />
      ))}
      {/* gradient fill */}
      <defs>
        <linearGradient id="radar-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#0182FD" stopOpacity="0.18"/>
        </linearGradient>
      </defs>
      <polygon points={polyline} fill="url(#radar-grad)" stroke="#0182FD" strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0182FD" />
      ))}
      {keys.map((k, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        const textAnchor = Math.abs(lx - cx) < 10 ? 'middle' : lx < cx ? 'end' : 'start';
        return (
          <text key={k} x={lx} y={ly + 4} textAnchor={textAnchor} fill="var(--ink-2)" fontSize="9" fontWeight="600">
            {DIM_LABELS[k] ?? k}
          </text>
        );
      })}
    </svg>
  );
}

function RadarSVG({ dims }: { dims: Record<string, number> }) {
  const keys = Object.keys(dims);
  const n = keys.length;
  const cx = 100, cy = 100, r = 75;
  const pts = keys.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const val = (dims[keys[i]] ?? 1) / 5;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  });
  const gridPts = keys.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const grid = gridPts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-label="六維雷達圖">
      {/* Grid lines */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
        const scalePts = keys.map((_, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
        }).join(' ');
        return <polygon key={scale} points={scalePts} fill="none" stroke="var(--line)" strokeWidth="0.5" />;
      })}
      {/* Axis lines */}
      {gridPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon points={polyline} fill="var(--brand)" fillOpacity="0.15" stroke="var(--brand)" strokeWidth="1.5" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--brand)" />
      ))}
      {/* Labels */}
      {keys.map((k, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        const textAnchor = Math.abs(lx - cx) < 10 ? 'middle' : lx < cx ? 'end' : 'start';
        return (
          <text key={k} x={lx} y={ly + 4} textAnchor={textAnchor} fill="var(--ink-2)" fontSize="9">
            {DIM_LABELS[k] ?? k}
          </text>
        );
      })}
    </svg>
  );
}

export default function AnalysisPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [resumeText, setResumeText] = useState('');
  const [roleId, setRoleId] = useState('product_manager');
  const [result, setResult] = useState<FullResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit() {
    if (resumeText.trim().length < 100) {
      setErrorMsg('請貼上至少 100 字的履歷文字。');
      return;
    }
    setErrorMsg('');
    setPhase('loading');
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText, roleId }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json?.error?.code === 'AI_UNAVAILABLE') {
          setPhase('unavailable');
          return;
        }
        if (res.status === 429) {
          setErrorMsg(json?.error?.message ?? '已達每日分析上限（5 次）。');
          setPhase('input');
          return;
        }
        setErrorMsg(json?.error?.message ?? '分析失敗，請稍後再試。');
        setPhase('input');
        return;
      }
      const r = json.data as FullResult;
      r.roleId = roleId;
      setResult(r);

      // Save to quest store
      const data = loadQuest();
      const prev = data.analysis?.checklist ? { checklist: data.analysis.checklist } : null;
      data.analysisPrev = prev;
      data.analysis = { ...r, roleId, at: new Date().toISOString() };

      // Check portfolio/quantified changes
      const prevChecklist = prev?.checklist ?? {};
      const newChecklist = r.checklist ?? {};
      if (!prevChecklist['portfolio'] && newChecklist['portfolio']) award('portfolio_added', 20, '新版履歷補上了作品集連結', true);
      if (!prevChecklist['quantified'] && newChecklist['quantified']) award('quantified_added', 20, '新版履歷補上了量化成果', true);

      // Award analysis tasks
      award('resume_analyzed', 50, '完成第一次 AI 履歷分析', true);
      if (data.analysis && Object.keys(data.analysisPrev?.checklist ?? {}).length > 0) {
        award('resume_improve', 40, '依建議修改履歷後重新分析');
      }
      saveQuest(data);

      // 分析完成後重新生成關卡線（插入特訓班章）
      try {
        const rawProfile = localStorage.getItem('profile.v1');
        if (rawProfile) {
          const profileV1 = JSON.parse(rawProfile);
          const analysisSummary = { checklist: r.checklist ?? {}, overall: r.overall };
          regenerateQuestLine(profileV1, new Date().toISOString(), analysisSummary);
        }
      } catch { /* ignore */ }

      setPhase('result');
    } catch {
      setErrorMsg('網路錯誤，請確認連線後再試。');
      setPhase('input');
    }
  }

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/analysis" />
      <main className="site-main" id="main-content">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 8 }}>履歷分析</h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: 24 }}>
            貼上履歷純文字，AI 從六個維度評分並找出具體缺口。
          </p>

          {phase === 'input' && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="field-group">
                <label className="field-label" htmlFor="role-select">目標職位</label>
                <select id="role-select" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="resume-text">履歷文字（100-20,000 字）</label>
                <textarea
                  id="resume-text"
                  className="paste-textarea"
                  style={{ minHeight: 200 }}
                  placeholder="請直接貼上履歷的純文字內容（可從 PDF 複製後貼入）"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <span className="paste-charcount">{resumeText.length}/20,000</span>
              </div>
              {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 12 }}>{errorMsg}</p>}
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={resumeText.trim().length < 100}>
                開始分析
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginTop: 12 }}>
                免責聲明：AI 分析為參考建議，非錄取保證。分析文字即時處理後不儲存。
                <a href="mailto:internx.me@gmail.com" style={{ color: 'var(--brand-dark)', marginLeft: 6 }}>分析不準？回饋給我們</a>
              </p>
            </div>
          )}

          {phase === 'loading' && (
            <div className="card">
              <div className="analysis-loading">
                <div className="mascot-bob">
                  <Mascot size={72} variant="think" />
                </div>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>藍藍正在讀你的履歷...</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>約 10-20 秒，請稍候</p>
                </div>
                {/* 3-stage loading text */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                  {['解析內容', '比對職位', '生成建議'].map((s, i) => (
                    <span key={i} style={{ fontSize: '0.8125rem', background: 'var(--sky-soft)', color: 'var(--sky-deep)', border: '1.5px solid var(--sky)', borderRadius: 99, padding: '3px 10px', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === 'unavailable' && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" stroke="var(--line)" strokeWidth="2"/>
                  <path d="M24 14v12" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="24" cy="34" r="1.5" fill="var(--ink-2)"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>AI 分析未啟用</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
                此功能需要 OpenAI API 金鑰。你仍可使用興趣測驗、能力測驗與投遞戰情室。
              </p>
              <a href="/island" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>前往闖關島</a>
            </div>
          )}

          {phase === 'result' && result && (
            <>
              {/* Overall score */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="result-medal-wrap">
                  <Mascot size={60} variant="cheer" className="mascot-idle" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="result-medal" style={{ width: 70, height: 70, fontSize: '1.5rem' }}>
                      {result.overall}
                    </div>
                    <div style={{ marginTop: 12 }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>整體評分（滿分 100）</p>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
                      信心度：{result.confidence === 'high' ? '高' : result.confidence === 'medium' ? '中' : '低'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>六維分析</h3>
                <div className="radar-container">
                  <RadarSVGStyled dims={result.dimensions} />
                </div>
                <div className="dimension-bars">
                  {Object.entries(result.dimensions).map(([k, v]) => (
                    <div key={k} className="dim-bar-row">
                      <span className="dim-bar-label">{DIM_LABELS[k] ?? k}</span>
                      <div className="dim-bar-track">
                        <div className="dim-bar-fill" style={{ width: `${(v / 5) * 100}%` }} />
                      </div>
                      <span className="dim-bar-score">{v}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>發現的問題（{result.issues.length}）</h3>
                  {result.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`issue-item ${issue.severity === '紅線' ? 'issue-severity-red' : issue.severity === '警告' ? 'issue-severity-amber' : 'issue-severity-ok'}`}
                    >
                      <span className={`issue-badge ${issue.severity === '紅線' ? 'issue-badge-red' : issue.severity === '警告' ? 'issue-badge-amber' : 'issue-badge-ok'}`}>
                        {issue.severity}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{issue.category}</div>
                        {issue.quote && <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: 4 }}>「{issue.quote}」</div>}
                        <div style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>{issue.suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>亮點</h3>
                  <ul style={{ paddingLeft: 20 }}>
                    {result.strengths.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 6, lineHeight: 1.6 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {result.gaps.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>建議優先補強的技能缺口</h3>
                  {result.gaps.map((g) => (
                    <div key={g.skillKey} className="dim-bar-row" style={{ marginBottom: 8 }}>
                      <span className="dim-bar-label">{g.label}</span>
                      <div className="dim-bar-track">
                        <div className="dim-bar-fill" style={{ width: `${(g.strength / 2) * 100}%`, background: g.strength === 0 ? 'var(--danger)' : g.strength === 1 ? 'var(--amber)' : 'var(--ok)' }} />
                      </div>
                      <span className="dim-bar-score">{g.strength}/2</span>
                    </div>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginBottom: 16 }}>
                免責聲明：以上分析為 AI 參考建議，非錄取保證。
                <a href="mailto:internx.me@gmail.com" style={{ color: 'var(--brand-dark)', marginLeft: 6 }}>分析不準？</a>
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="/island" className="btn-game">查看推薦任務</a>
                <button type="button" className="btn-ghost" onClick={() => { setPhase('input'); setResult(null); }}>
                  重新分析
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
