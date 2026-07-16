'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Application, Status } from '@/lib/types';
import { changeStatus } from '@/lib/store';
import { generateIcs, downloadIcs } from '@/lib/ics';
import type { ParsedJob } from '@/lib/parse-schema';
import { IconCalendar, IconList, IconDownload, IconUpload, IconWarning } from '@/components/Icons';
import PasteBox from '@/components/PasteBox';
import ConfirmCard from '@/components/ConfirmCard';
import CalendarView from '@/components/CalendarView';
import ListView from '@/components/ListView';
import DueStrip from '@/components/DueStrip';
import EditDrawer from '@/components/EditDrawer';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import JobsRadar from '@/components/JobsRadar';
import WeeklyReview from '@/components/WeeklyReview';
import { loadData, addApplication, updateApplication, deleteApplication, mergeImport } from '@/lib/store';
import { bridgeWarRoomEvents } from '@/lib/quest-store';
import type { WarRoomData } from '@/lib/types';
import { z } from 'zod';

interface ParseResult extends ParsedJob {
  engine: 'ai' | 'fallback';
}

type Tab = 'calendar' | 'list';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeExampleApp(): Application {
  const now = new Date().toISOString();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const deadlineStr = nextMonth.toISOString().split('T')[0];

  return {
    id: generateId(),
    company: '台積電（範例）',
    title: '製程整合工程師實習生',
    link: 'https://tsmc.com',
    industry: '科技',
    status: 'wishlist',
    stars: 4,
    deadline: deadlineStr,
    appliedAt: undefined,
    offerDeadline: undefined,
    interviews: [],
    skills: ['Python', '統計', '製程知識'],
    salaryText: '月薪 45,000',
    location: '新竹',
    resumeNote: undefined,
    note: '範例卡片——可刪除',
    jdRaw: '',
    source: 'manual',
    statusHistory: [{ to: 'wishlist', at: now }],
    createdAt: now,
    updatedAt: now,
  };
}

export default function WarRoomPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingResult, setPendingResult] = useState<{ result: ParseResult; rawText: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pasteClearSignal, setPasteClearSignal] = useState(0);
  const [xpToast, setXpToast] = useState<number | null>(null);

  useEffect(() => {
    const data = loadData();
    setApplications(data.applications);
  }, []);

  // 戰情室操作後即時把點數同步進 quest（bridge 冪等，重複呼叫不重複發點），
  // 並在當下顯示「+X XP」回饋——修正原本要跑去 /island 才會同步的缺口
  const syncAndNotify = useCallback(() => {
    const gained = bridgeWarRoomEvents();
    if (gained > 0) {
      setXpToast(gained);
      window.setTimeout(() => setXpToast(null), 2200);
    }
  }, []);

  const handleParseResult = useCallback((result: ParseResult, rawText: string) => {
    setPendingResult({ result, rawText });
  }, []);

  const handleConfirm = useCallback((app: Application) => {
    const data = addApplication(app);
    setApplications(data.applications);
    setPendingResult(null);
    setPasteClearSignal((c) => c + 1);
    setActiveTab('calendar');
    syncAndNotify();
  }, [syncAndNotify]);

  const handleCancelConfirm = useCallback(() => {
    setPendingResult(null);
  }, []);

  const handleEdit = useCallback((app: Application) => {
    setEditingApp(app);
  }, []);

  const handleSaveEdit = useCallback((updated: Application) => {
    const data = updateApplication(updated);
    setApplications(data.applications);
    setEditingApp(null);
    syncAndNotify();
  }, [syncAndNotify]);

  const handleDelete = useCallback((id: string) => {
    const data = deleteApplication(id);
    setApplications(data.applications);
  }, []);

  const handleStatusChange = useCallback((app: Application, newStatus: Status) => {
    const updated = changeStatus(app, newStatus);
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    syncAndNotify();
  }, [syncAndNotify]);

  const handleOpenCard = useCallback((id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) setEditingApp(app);
  }, [applications]);

  const handleAddExample = useCallback(() => {
    const example = makeExampleApp();
    const data = addApplication(example);
    setApplications(data.applications);
    setActiveTab('list');
    syncAndNotify();
  }, [syncAndNotify]);

  // 從職缺雷達預填職缺
  const handleAddFromRadar = useCallback((prefill: {
    company: string; title: string; link: string;
    location?: string; salaryText?: string;
  }) => {
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const app: Application = {
      id: generateId(),
      company: prefill.company,
      title: prefill.title,
      link: prefill.link,
      industry: '其他',
      status: 'wishlist',
      stars: 3,
      deadline: undefined,
      appliedAt: undefined,
      offerDeadline: undefined,
      interviews: [],
      skills: [],
      salaryText: prefill.salaryText,
      location: prefill.location,
      resumeNote: undefined,
      note: undefined,
      jdRaw: '',
      source: 'manual',
      statusHistory: [{ to: 'wishlist', at: now }],
      createdAt: now,
      updatedAt: now,
    };

    const data = addApplication(app);
    setApplications(data.applications);
    setActiveTab('list');
    syncAndNotify();
  }, [syncAndNotify]);

  const handleExportIcs = useCallback(() => {
    const content = generateIcs(applications);
    downloadIcs(content);
  }, [applications]);

  const handleExportJSON = useCallback(() => {
    const data: WarRoomData = { schemaVersion: 1, applications };
    const json = JSON.stringify(data, null, 2);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `war-room-backup-${today}.json`;
    const canBlob = typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    if (canBlob) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } else {
      window.prompt('複製 JSON 備份：', json);
    }
  }, [applications]);

  const handleImportJSON = useCallback(() => {
    setImportError(null);
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const WarRoomDataSchema = z.object({
          schemaVersion: z.literal(1),
          applications: z.array(z.object({ id: z.string(), company: z.string(), title: z.string(), updatedAt: z.string() }).passthrough()),
        });
        const result = WarRoomDataSchema.safeParse(parsed);
        if (!result.success) { setImportError('檔案格式不符，請確認是由本站匯出的備份檔。'); return; }
        const merged = mergeImport(parsed as WarRoomData);
        setApplications(merged.applications);
      } catch { setImportError('檔案解析失敗，請確認格式正確。'); }
    };
    input.click();
  }, []);

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/war-room" />

      <main className="site-main" id="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>投遞戰情室</h1>
          <div className="header-actions">
            <button type="button" className="btn-small" onClick={handleExportIcs} title="匯出 .ics 日曆" aria-label="匯出 .ics 日曆">
              <IconDownload size={14} /> <span className="btn-label">.ics</span>
            </button>
            <button type="button" className="btn-small" onClick={handleExportJSON} title="JSON 備份" aria-label="下載 JSON 備份">
              <IconDownload size={14} /> <span className="btn-label">備份</span>
            </button>
            <button type="button" className="btn-small" onClick={handleImportJSON} title="還原備份" aria-label="還原 JSON 備份">
              <IconUpload size={14} /> <span className="btn-label">還原</span>
            </button>
          </div>
        </div>

        {xpToast !== null && (
          <div style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--sand)', color: 'var(--ink)', fontWeight: 700, padding: '10px 18px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 6 }} role="status">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="var(--sand-deep)"/>
              <path d="M10 5.5v9M5.5 10h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            +{xpToast} XP 已入帳
          </div>
        )}

        {sizeWarning && (
          <div className="paste-error" style={{ marginBottom: 12 }} role="alert">
            <IconWarning size={14} />
            儲存資料接近上限（4.5MB），建議匯出備份後清理。
          </div>
        )}

        {importError && (
          <div className="paste-error" style={{ marginBottom: 12 }} role="alert">
            <IconWarning size={14} />
            {importError}
            <button type="button" style={{ marginLeft: 8, fontSize: '0.75rem', color: 'inherit', textDecoration: 'underline' }} onClick={() => setImportError(null)}>
              關閉
            </button>
          </div>
        )}

        <PasteBox onResult={handleParseResult} collapsed={pendingResult !== null} clearSignal={pasteClearSignal} />

        {pendingResult && (
          <ConfirmCard result={pendingResult.result} rawText={pendingResult.rawText} onConfirm={handleConfirm} onCancel={handleCancelConfirm} />
        )}

        <JobsRadar onAddJob={handleAddFromRadar} />

        <DueStrip applications={applications} onOpenCard={handleOpenCard} />

        <WeeklyReview applications={applications} />

        <nav className="tabs-bar" aria-label="檢視模式">
          <button type="button" className={`tab-btn ${activeTab === 'calendar' ? 'tab-btn-active' : ''}`} onClick={() => setActiveTab('calendar')} aria-current={activeTab === 'calendar' ? 'page' : undefined}>
            <IconCalendar size={16} /> 申請日曆
          </button>
          <button type="button" className={`tab-btn ${activeTab === 'list' ? 'tab-btn-active' : ''}`} onClick={() => setActiveTab('list')} aria-current={activeTab === 'list' ? 'page' : undefined}>
            <IconList size={16} /> 全部清單
          </button>
        </nav>

        {activeTab === 'calendar' && <CalendarView applications={applications} onOpenCard={handleOpenCard} />}
        {activeTab === 'list' && <ListView applications={applications} onEdit={handleEdit} onStatusChange={handleStatusChange} onAddExample={handleAddExample} />}
      </main>

      <Footer />

      {editingApp && (
        <EditDrawer app={editingApp} onSave={handleSaveEdit} onDelete={handleDelete} onClose={() => setEditingApp(null)} />
      )}
    </div>
  );
}
