'use client';

import { useMemo } from 'react';
import type { Application } from '@/lib/types';
import { loadQuest } from '@/lib/quest-store';
import { calculateResumeMatch } from '@/lib/resume-match';

export default function ResumeMatchPanel({ app }: { app: Application }) {
  const result = useMemo(() => calculateResumeMatch(app, loadQuest().analysis), [app]);
  if (!result) {
    return (
      <div className="resume-match-panel resume-match-empty">
        <strong>履歷配對</strong>
        <p>先完成一次履歷分析，就能在每張職缺看到準備吻合度與優先缺口。</p>
        <a href="/analysis">開始履歷分析</a>
      </div>
    );
  }
  return (
    <section className="resume-match-panel" aria-label="履歷與職缺配對">
      <div className="resume-match-head">
        <div><strong>準備吻合度</strong><p>依最近一次目標職位分析估算，不讀取履歷原文。</p></div>
        <span>{result.score}%</span>
      </div>
      <div className="resume-match-track"><span style={{ width: `${result.score}%` }} /></div>
      {result.matched.length > 0 && <p><b>已有證據：</b>{result.matched.join('、')}</p>}
      {result.missing.length > 0 && <p><b>優先補強：</b>{result.missing.join('、')}</p>}
      {result.actions.length > 0 && <ul>{result.actions.map((action) => <li key={action}>{action}</li>)}</ul>}
    </section>
  );
}
