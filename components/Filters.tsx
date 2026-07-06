'use client';

import type { Industry } from '@/lib/types';
import { INDUSTRIES } from '@/lib/types';

interface FiltersProps {
  selectedIndustries: Industry[];
  onToggleIndustry: (ind: Industry) => void;
  onlyWithDeadline: boolean;
  onToggleDeadline: () => void;
}

export default function Filters({
  selectedIndustries,
  onToggleIndustry,
  onlyWithDeadline,
  onToggleDeadline,
}: FiltersProps) {
  return (
    <div className="filters-bar" role="group" aria-label="篩選">
      <div className="filter-industry-chips">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            type="button"
            className={`industry-chip ${selectedIndustries.includes(ind) ? 'industry-chip-active' : ''}`}
            onClick={() => onToggleIndustry(ind)}
            aria-pressed={selectedIndustries.includes(ind)}
          >
            {ind}
          </button>
        ))}
      </div>
      <label className="filter-deadline-toggle">
        <input
          type="checkbox"
          checked={onlyWithDeadline}
          onChange={onToggleDeadline}
        />
        <span>只看有截止日</span>
      </label>
    </div>
  );
}
