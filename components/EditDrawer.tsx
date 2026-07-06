'use client';

import { useState, useEffect } from 'react';
import type { Application, Interview, Industry, Status } from '@/lib/types';
import { INDUSTRIES, STATUS_LABELS, getTodayStr } from '@/lib/types';
import { generateIcs, downloadIcs } from '@/lib/ics';
import {
  IconClose, IconPlus, IconTrash, IconLink, IconCopy, IconCheck, IconDownload
} from './Icons';

interface EditDrawerProps {
  app: Application | null;
  onSave: (updated: Application) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function EditDrawer({ app, onSave, onDelete, onClose }: EditDrawerProps) {
  const [form, setForm] = useState<Application | null>(null);
  const [copyState, setCopyState] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm(app ? { ...app, interviews: [...app.interviews] } : null);
    setConfirmDelete(false);
    setCopyState(false);
  }, [app]);

  if (!form) return null;

  function updateField<K extends keyof Application>(key: K, value: Application[K]) {
    if (!form) return;
    setForm({ ...form, [key]: value, updatedAt: new Date().toISOString() });
  }

  function handleStars(n: number) {
    updateField('stars', n as 1 | 2 | 3 | 4 | 5);
  }

  function addInterview() {
    if (!form) return;
    const newIv: Interview = {
      id: generateId(),
      round: form.interviews.length + 1,
      date: getTodayStr(),
    };
    setForm({ ...form, interviews: [...form.interviews, newIv] });
  }

  function updateInterview(id: string, field: keyof Interview, value: string) {
    if (!form) return;
    setForm({
      ...form,
      interviews: form.interviews.map((iv) =>
        iv.id === id ? { ...iv, [field]: value } : iv
      ),
    });
  }

  function removeInterview(id: string) {
    if (!form) return;
    setForm({ ...form, interviews: form.interviews.filter((iv) => iv.id !== id) });
  }

  function handleSave() {
    if (!form || !form.company.trim() || !form.title.trim()) return;
    onSave({ ...form, updatedAt: new Date().toISOString() });
  }

  function handleCopyLink() {
    if (!form?.link) return;
    const canClipboard = typeof navigator !== 'undefined' && navigator.clipboard;
    if (canClipboard) {
      navigator.clipboard.writeText(form.link).then(() => {
        setCopyState(true);
        setTimeout(() => setCopyState(false), 2000);
      }).catch(() => {
        window.prompt('複製連結：', form.link);
      });
    } else {
      window.prompt('複製連結：', form.link);
    }
  }

  function handleExportIcs() {
    if (!form) return;
    const content = generateIcs([form]);
    downloadIcs(content);
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true" aria-label="編輯申請">
      <div className="drawer-panel">
        <div className="drawer-header">
          <h2 className="drawer-title">編輯申請</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="關閉">
            <IconClose size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-field-group">
            <label className="field-label">公司名稱 *</label>
            <input type="text" value={form.company} onChange={(e) => updateField('company', e.target.value)} />
          </div>

          <div className="drawer-field-group">
            <label className="field-label">職稱 *</label>
            <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          </div>

          <div className="drawer-field-row">
            <div className="drawer-field-group">
              <label className="field-label">行業</label>
              <select value={form.industry} onChange={(e) => updateField('industry', e.target.value as Industry)}>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="drawer-field-group">
              <label className="field-label">狀態</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value as Status)}>
                {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([s, label]) => (
                  <option key={s} value={s}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="drawer-field-group">
            <label className="field-label">意願星數</label>
            <div className="stars-edit-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${n <= form.stars ? 'star-btn-active' : ''}`}
                  onClick={() => handleStars(n)}
                  aria-label={`${n} 顆星`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="drawer-field-row">
            <div className="drawer-field-group">
              <label className="field-label">投遞截止日</label>
              <input type="date" value={form.deadline ?? ''} onChange={(e) => updateField('deadline', e.target.value || undefined)} />
            </div>
            <div className="drawer-field-group">
              <label className="field-label">Offer 回覆期限</label>
              <input type="date" value={form.offerDeadline ?? ''} onChange={(e) => updateField('offerDeadline', e.target.value || undefined)} />
            </div>
          </div>

          <div className="drawer-field-group">
            <label className="field-label">地點</label>
            <input type="text" value={form.location ?? ''} onChange={(e) => updateField('location', e.target.value || undefined)} />
          </div>

          <div className="drawer-field-group">
            <label className="field-label">薪資</label>
            <input type="text" value={form.salaryText ?? ''} onChange={(e) => updateField('salaryText', e.target.value || undefined)} />
          </div>

          <div className="drawer-field-group">
            <label className="field-label">職缺連結</label>
            <div className="link-field-row">
              <input
                type="url"
                value={form.link ?? ''}
                onChange={(e) => updateField('link', e.target.value || undefined)}
                placeholder="https://..."
              />
              {form.link && (
                <>
                  <a
                    href={form.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                    aria-label="開啟連結"
                    title="開啟連結"
                  >
                    <IconLink size={16} />
                  </a>
                  <button type="button" className="btn-icon" onClick={handleCopyLink} aria-label="複製連結" title="複製連結">
                    {copyState ? <IconCheck size={16} style={{ color: 'var(--ok)' }} /> : <IconCopy size={16} />}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="drawer-field-group">
            <label className="field-label">技能（用頓號或逗號分隔）</label>
            <input
              type="text"
              value={form.skills.join('、')}
              onChange={(e) => updateField('skills', e.target.value.split(/[、,，\s]+/).filter(Boolean))}
            />
          </div>

          <div className="drawer-field-group">
            <label className="field-label">備注（履歷相關）</label>
            <textarea
              value={form.resumeNote ?? ''}
              onChange={(e) => updateField('resumeNote', e.target.value || undefined)}
              rows={2}
            />
          </div>

          <div className="drawer-field-group">
            <label className="field-label">個人筆記</label>
            <textarea
              value={form.note ?? ''}
              onChange={(e) => updateField('note', e.target.value || undefined)}
              rows={3}
            />
          </div>

          <div className="drawer-interviews">
            <div className="interviews-header">
              <span className="field-label">面試場次</span>
              <button type="button" className="btn-small" onClick={addInterview}>
                <IconPlus size={14} /> 新增
              </button>
            </div>

            {form.interviews.map((iv) => (
              <div key={iv.id} className="interview-row">
                <span className="interview-round">第 {iv.round} 輪</span>
                <input
                  type="date"
                  value={iv.date}
                  onChange={(e) => updateInterview(iv.id, 'date', e.target.value)}
                  aria-label="面試日期"
                />
                <input
                  type="time"
                  value={iv.time ?? ''}
                  onChange={(e) => updateInterview(iv.id, 'time', e.target.value || '')}
                  aria-label="面試時間"
                />
                <select
                  value={iv.mode ?? ''}
                  onChange={(e) => updateInterview(iv.id, 'mode', e.target.value as '線上' | '實體' | '電話')}
                  aria-label="面試方式"
                >
                  <option value="">方式</option>
                  <option value="線上">線上</option>
                  <option value="實體">實體</option>
                  <option value="電話">電話</option>
                </select>
                <button type="button" className="btn-icon btn-danger-ghost" onClick={() => removeInterview(iv.id)} aria-label="刪除此場次">
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="drawer-export-row">
            <button type="button" className="btn-small" onClick={handleExportIcs}>
              <IconDownload size={14} /> 匯出 .ics
            </button>
          </div>
        </div>

        <div className="drawer-footer">
          <div className="drawer-footer-left">
            {!confirmDelete ? (
              <button type="button" className="btn-ghost btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
                <IconTrash size={16} /> 刪除
              </button>
            ) : (
              <div className="delete-confirm-row">
                <span>確定刪除？</span>
                <button type="button" className="btn-ghost btn-danger-ghost" onClick={() => { onDelete(form.id); onClose(); }}>
                  確定
                </button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>
                  取消
                </button>
              </div>
            )}
          </div>
          <div className="drawer-footer-right">
            <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={!form.company.trim() || !form.title.trim()}
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
