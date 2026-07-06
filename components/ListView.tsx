'use client';

import { useState } from 'react';
import type { Application, Status, Industry } from '@/lib/types';
import { getListGroup, GROUP_LABELS } from '@/lib/types';
import type { ListGroup } from '@/lib/types';
import AppCard from './AppCard';
import Filters from './Filters';
import { IconChevronDown, IconChevronRight } from './Icons';

interface ListViewProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onStatusChange: (app: Application, status: Status) => void;
  onAddExample: () => void;
}

const GROUP_ORDER: ListGroup[] = ['wishlist', 'preparing', 'active', 'interviewing', 'offer', 'ended'];

export default function ListView({ applications, onEdit, onStatusChange, onAddExample }: ListViewProps) {
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([]);
  const [onlyWithDeadline, setOnlyWithDeadline] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<ListGroup>>(new Set(['ended']));

  function toggleIndustry(ind: Industry) {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  }

  function toggleGroup(group: ListGroup) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  const filtered = applications.filter((app) => {
    if (selectedIndustries.length > 0 && !selectedIndustries.includes(app.industry)) return false;
    if (onlyWithDeadline && !app.deadline) return false;
    return true;
  });

  const groups: Record<ListGroup, Application[]> = {
    wishlist: [], preparing: [], active: [], interviewing: [], offer: [], ended: [],
  };

  for (const app of filtered) {
    groups[getListGroup(app.status)].push(app);
  }

  const total = applications.length;
  const active = applications.filter((a) =>
    ['submitted', 'screening', 'interviewing'].includes(a.status)
  ).length;
  const interviewing = applications.filter((a) => a.status === 'interviewing').length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;

  if (total === 0) {
    return (
      <div className="list-empty-state">
        <h3 className="empty-title">還沒有申請紀錄</h3>
        <ol className="empty-steps">
          <li>在上方貼上職缺內容</li>
          <li>確認 AI 辨識的欄位</li>
          <li>按「存入我的日曆」完成</li>
        </ol>
        <button type="button" className="btn-ghost" onClick={onAddExample}>
          載入範例卡看看
        </button>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-stats" role="region" aria-label="申請統計">
        <span>總計 <strong>{total}</strong></span>
        <span>進行中 <strong>{active}</strong></span>
        <span>面試中 <strong>{interviewing}</strong></span>
        <span>Offer <strong>{offerCount}</strong></span>
      </div>

      <Filters
        selectedIndustries={selectedIndustries}
        onToggleIndustry={toggleIndustry}
        onlyWithDeadline={onlyWithDeadline}
        onToggleDeadline={() => setOnlyWithDeadline((v) => !v)}
      />

      {GROUP_ORDER.map((group) => {
        const apps = groups[group];
        const isCollapsed = collapsedGroups.has(group);

        return (
          <div key={group} className="list-group">
            <button
              type="button"
              className="list-group-header"
              onClick={() => toggleGroup(group)}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
              <span className="list-group-name">{GROUP_LABELS[group]}</span>
              <span className="list-group-count">{apps.length}</span>
            </button>

            {!isCollapsed && apps.length > 0 && (
              <div className="list-group-cards">
                {apps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}

            {!isCollapsed && apps.length === 0 && (
              <p className="list-group-empty">此群組目前沒有符合條件的申請。</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
