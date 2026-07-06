'use client';

import { useState } from 'react';
import type { ParsedJob } from '@/lib/parse-schema';
import type { Application, Industry, Status } from '@/lib/types';
import { INDUSTRIES, getTodayStr } from '@/lib/types';
import { IconInfo } from './Icons';

interface ParseResult extends ParsedJob {
  engine: 'ai' | 'fallback';
}

interface ConfirmCardProps {
  result: ParseResult;
  rawText: string;
  onConfirm: (app: Application) => void;
  onCancel: () => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ConfirmCard({ result, rawText, onConfirm, onCancel }: ConfirmCardProps) {
  const [company, setCompany] = useState(result.company ?? '');
  const [title, setTitle] = useState(result.title ?? '');
  const [industry, setIndustry] = useState<Industry>((result.industryGuess as Industry) ?? '其他');
  const [location, setLocation] = useState(result.location ?? '');
  const [salaryText, setSalaryText] = useState(result.salaryText ?? '');
  const [deadline, setDeadline] = useState(result.deadline ?? '');
  const [skills, setSkills] = useState(
    [...result.skillsRequired, ...result.skillsNice].join('、')
  );
  const [link, setLink] = useState('');

  const fc = result.fieldConfidence;
  const isLow = (field: 'company' | 'title' | 'deadline') => fc[field] === 'l';

  function handleSave() {
    if (!company.trim() || !title.trim()) return;

    const now = new Date().toISOString();
    const app: Application = {
      id: generateId(),
      company: company.trim(),
      title: title.trim(),
      link: link.trim() || undefined,
      industry,
      status: 'wishlist' as Status,
      stars: 3,
      deadline: deadline || undefined,
      appliedAt: undefined,
      offerDeadline: undefined,
      interviews: [],
      skills: skills.split(/[、,，\s]+/).filter(Boolean),
      salaryText: salaryText.trim() || undefined,
      location: location.trim() || undefined,
      resumeNote: undefined,
      note: undefined,
      jdRaw: rawText,
      source: result.engine === 'ai' ? 'paste-ai' : 'paste-fallback',
      statusHistory: [{ to: 'wishlist', at: now }],
      createdAt: now,
      updatedAt: now,
    };

    onConfirm(app);
  }

  return (
    <div className="confirm-card" role="region" aria-label="確認職缺資訊">
      {result.engine === 'fallback' && (
        <div className="confirm-notice">
          <IconInfo size={14} />
          <span>以基本規則解析，辨識結果供參考，請確認後存入。</span>
        </div>
      )}

      <h3 className="confirm-title">確認職缺資訊</h3>
      <p className="confirm-subtitle">低信心欄位已標示，請確認後再存入日曆。</p>

      <div className="confirm-fields">
        <label className={`field-group ${isLow('company') ? 'field-low' : ''}`}>
          <span className="field-label">
            公司名稱 *
            {isLow('company') && <span className="low-badge">請確認</span>}
          </span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            placeholder="公司名稱"
          />
        </label>

        <label className={`field-group ${isLow('title') ? 'field-low' : ''}`}>
          <span className="field-label">
            職稱 *
            {isLow('title') && <span className="low-badge">請確認</span>}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="職稱"
          />
        </label>

        <label className="field-group">
          <span className="field-label">行業</span>
          <select value={industry} onChange={(e) => setIndustry(e.target.value as Industry)}>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </label>

        <label className={`field-group deadline-field ${isLow('deadline') ? 'field-low' : ''}`}>
          <span className="field-label">
            投遞截止日
            {isLow('deadline') && <span className="low-badge">請確認</span>}
          </span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={getTodayStr()}
          />
        </label>

        <label className="field-group">
          <span className="field-label">地點</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="台北、新竹…"
          />
        </label>

        <label className="field-group">
          <span className="field-label">薪資</span>
          <input
            type="text"
            value={salaryText}
            onChange={(e) => setSalaryText(e.target.value)}
            placeholder="月薪 40,000"
          />
        </label>

        <label className="field-group">
          <span className="field-label">技能（用頓號或逗號分隔）</span>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Python、統計、Excel"
          />
        </label>

        <label className="field-group">
          <span className="field-label">職缺連結</span>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="confirm-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={!company.trim() || !title.trim()}
        >
          存入我的日曆
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
