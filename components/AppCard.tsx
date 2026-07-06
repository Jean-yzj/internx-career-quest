'use client';

import type { Application, Status } from '@/lib/types';
import { STATUS_LABELS, getNextDate, formatAbsoluteDate, isExpired, getTodayStr } from '@/lib/types';
import { IconStarFilled, IconStar, IconEdit } from './Icons';

interface AppCardProps {
  app: Application;
  onEdit: (app: Application) => void;
  onStatusChange: (app: Application, status: Status) => void;
  compact?: boolean;
}

const STATUS_OPTIONS: Status[] = [
  'wishlist', 'preparing', 'submitted', 'screening',
  'interviewing', 'offer', 'rejected', 'withdrawn',
];

export default function AppCard({ app, onEdit, onStatusChange, compact }: AppCardProps) {
  const { date: nextDate, kind: nextKind } = getNextDate(app);
  const today = getTodayStr();

  const isExpiredDeadline =
    (app.status === 'wishlist' || app.status === 'preparing') &&
    app.deadline &&
    app.deadline < today;

  const isExpiredOffer = app.status === 'offer' && app.offerDeadline && app.offerDeadline < today;

  return (
    <div className={`app-card ${isExpiredDeadline ? 'app-card-expired' : ''}`} role="article">
      <div className="app-card-header">
        <div className="app-card-title-row">
          <span className="app-card-company">{app.company}</span>
          <span className="app-card-industry-tag">{app.industry}</span>
        </div>
        <p className="app-card-title">{app.title}</p>
      </div>

      <div className="app-card-meta">
        <StarsDisplay stars={app.stars} />

        {isExpiredDeadline && (
          <span className="app-card-closed-badge">已截止</span>
        )}

        {nextDate && (
          <span className={`app-card-nextdate ${nextKind === 'offer' && isExpired(nextDate) ? 'app-card-nextdate-danger' : ''} ${nextDate < today ? 'app-card-nextdate-expired' : ''}`}>
            {nextKind === 'deadline' && '截止：'}
            {nextKind === 'interview' && '面試：'}
            {nextKind === 'offer' && 'Offer 期限：'}
            {formatAbsoluteDate(nextDate)}
            {isExpired(nextDate) && ' (已過期)'}
          </span>
        )}
      </div>

      {isExpiredOffer && (
        <p className="app-card-offer-warn">Offer 回覆期限已過，請確認狀態。</p>
      )}

      {!compact && (
        <div className="app-card-footer">
          <select
            className="app-card-status-select"
            value={app.status}
            onChange={(e) => onStatusChange(app, e.target.value as Status)}
            aria-label="申請狀態"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn-icon"
            onClick={() => onEdit(app)}
            aria-label="編輯"
            title="編輯"
          >
            <IconEdit size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function StarsDisplay({ stars }: { stars: number }) {
  return (
    <div className="stars-display" aria-label={`意願 ${stars} 顆星`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        n <= stars
          ? <IconStarFilled key={n} size={14} style={{ color: 'var(--amber)' }} />
          : <IconStar key={n} size={14} style={{ color: 'var(--line)' }} />
      ))}
    </div>
  );
}
