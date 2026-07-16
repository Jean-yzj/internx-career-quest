'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import Mascot from '@/components/Mascot';
import { buildActionPlan, loadActionPlan, saveActionPlan, toggleActionPlanTask, type ActionPlan } from '@/lib/action-plan';
import { loadQuest } from '@/lib/quest-store';
import { getRoleById, ROLES, type RoleId } from '@/lib/roles';
import { getActionPlanWorkTaskIds } from '@/lib/action-plan-work';
import styles from './plan.module.css';

export default function PlanPage() {
  const [plan, setPlan] = useState<ActionPlan | null | undefined>(undefined);
  const [roleId, setRoleId] = useState<RoleId>('product_manager');
  const [draftTaskIds, setDraftTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const existing = loadActionPlan();
    setPlan(existing);
    if (existing) {
      setRoleId(existing.roleId);
      setDraftTaskIds(getActionPlanWorkTaskIds(existing.roleId));
    }
  }, []);

  const completedCount = useMemo(
    () => plan?.tasks.filter((task) => task.completedAt).length ?? 0,
    [plan],
  );

  function handleCreate() {
    const next = buildActionPlan(roleId, loadQuest(), plan);
    saveActionPlan(next);
    setPlan(next);
  }

  function handleToggle(taskId: string) {
    const updated = toggleActionPlanTask(taskId);
    if (!updated) return;
    setPlan({ ...updated, tasks: [...updated.tasks] });
  }

  if (plan === undefined) return null;

  if (!plan) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/plan" />
        <main className="site-main" id="main-content">
          <section className={styles.emptyState}>
            <Mascot size={76} variant="think" className="mascot-idle" />
            <h1>建立你的 7 天求職計畫</h1>
            <p>選一個目標職位，我們會把準備工作拆成每天一個能完成的動作。</p>
            <label htmlFor="plan-role">目標職位</label>
            <select id="plan-role" value={roleId} onChange={(event) => setRoleId(event.target.value as RoleId)}>
              {ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            <button type="button" className="btn-game" onClick={handleCreate}>建立 7 天計畫</button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const role = getRoleById(plan.roleId);
  const progress = Math.round((completedCount / plan.tasks.length) * 100);

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/plan" />
      <main className="site-main" id="main-content">
        <div className={styles.shell}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{role?.name ?? '目標職位'}</p>
              <h1>我的 7 天求職計畫</h1>
              <p>每天完成一小步。做完後再回頭調整下一週，不必一次把所有事情做好。</p>
            </div>
            <div className={styles.progress} aria-label={`完成 ${progress}%`}>
              <strong>{completedCount}/{plan.tasks.length}</strong>
              <span>已完成</span>
            </div>
          </header>

          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <ol className={styles.taskList}>
            {plan.tasks.map((task) => (
              <li key={task.id} className={task.completedAt ? styles.taskDone : styles.taskItem}>
                <button type="button" className={styles.checkButton} onClick={() => handleToggle(task.id)} aria-label={`${task.completedAt ? '取消完成' : '標記完成'}：${task.title}`}>
                  {task.completedAt && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className={styles.taskCopy}>
                  <span>Day {task.day}</span>
                  <h2>{task.title}</h2>
                  <p>{task.detail}</p>
                </div>
                <Link href={`/plan/task/${task.day}`} className={styles.taskLink}>
                  {task.completedAt ? '查看成果' : draftTaskIds.has(task.id) ? '繼續完成' : '開始任務'}
                </Link>
              </li>
            ))}
          </ol>

          {completedCount === plan.tasks.length && (
            <section className={styles.completeBand}>
              <Mascot size={58} variant="cheer" />
              <div>
                <h2>這週完成了</h2>
                <p>到戰情室看看投遞成果，再建立下一週唯一最重要的行動。</p>
              </div>
              <Link href="/war-room" className="btn-game">查看本週投遞</Link>
            </section>
          )}

          <div className={styles.footerActions}>
            <button type="button" className="btn-ghost" onClick={() => { setPlan(null); setRoleId(plan.roleId); }}>重建計畫</button>
            <Link href={`/roles/${plan.roleId}`} className="btn-ghost">查看職位圖鑑</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
