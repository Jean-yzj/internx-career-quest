'use client';

import type { Application } from '@/lib/types';
import { buildWeeklyReview, getReviewWeekLabel } from '@/lib/weekly-review';
import { downloadIcs, generateWeeklyReviewIcs } from '@/lib/ics';

export default function WeeklyReview({ applications }: { applications: Application[] }) {
  const review = buildWeeklyReview(applications);
  return (
    <section className="weekly-review" aria-labelledby="weekly-review-title">
      <div className="weekly-review-head">
        <div><p>{getReviewWeekLabel()}</p><h2 id="weekly-review-title">本週投遞回顧</h2></div>
        <button type="button" className="btn-small" onClick={() => downloadIcs(generateWeeklyReviewIcs(), 'internx-weekly-review.ics')}>加入每週提醒</button>
      </div>
      <div className="weekly-review-stats">
        <span><strong>{review.added}</strong>新增</span><span><strong>{review.submitted}</strong>投遞</span>
        <span><strong>{review.interviews}</strong>面試</span><span><strong>{review.responseRate}%</strong>回覆率</span>
      </div>
      <div className="weekly-review-actions"><strong>接下來先做</strong><ol>{review.actions.map((action) => <li key={action}>{action}</li>)}</ol></div>
    </section>
  );
}
