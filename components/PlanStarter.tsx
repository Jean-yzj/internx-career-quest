'use client';

import { useRouter } from 'next/navigation';
import { createActionPlan } from '@/lib/action-plan';
import { loadQuest, saveQuest } from '@/lib/quest-store';
import type { RoleId } from '@/lib/roles';

export default function PlanStarter({ roleId, className }: { roleId: RoleId; className?: string }) {
  const router = useRouter();

  function handleStart() {
    const quest = loadQuest();
    if (!quest.profile) {
      quest.profile = {
        careerStatus: 'targeting',
        targetRoleId: roleId,
        customRoleLabel: null,
        createdAt: new Date().toISOString(),
      };
    } else {
      quest.profile.targetRoleId = roleId;
    }
    saveQuest(quest);
    createActionPlan(roleId, quest);
    router.push('/plan');
  }

  return (
    <button type="button" className={className} onClick={handleStart}>
      建立我的 7 天計畫
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
