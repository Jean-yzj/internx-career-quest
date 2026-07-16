'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteNav from '@/components/SiteNav';
import { loadActionPlan, setActionPlanTaskCompleted, type ActionPlan } from '@/lib/action-plan';
import { loadActionPlanTaskWork, saveActionPlanTaskWork } from '@/lib/action-plan-work';
import { getRoleById } from '@/lib/roles';
import { getRoleGuide } from '@/lib/role-guide';
import { downloadIcs, generateWeeklyReviewIcs } from '@/lib/ics';
import styles from '@/app/plan/task/task.module.css';

interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  url: string;
  deadline: string | null;
}

type Values = Record<string, string>;

const DAY_LABELS = [
  '職位觀察筆記',
  'STAR 經歷盤點',
  '能力證據補強',
  '一頁式小作品規劃',
  '履歷句子產生器',
  '真實職缺比較表',
  '本週回顧與下週行動',
];

function Field({ label, name, value, onChange, hint, rows = 3, placeholder }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      <textarea
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function text(value: string | undefined): string {
  return value?.trim() ?? '';
}

function requirementsFor(day: number, values: Values): string[] {
  if (day === 1) return [
    !text(values.workChoice) && '選一項你想嘗試的工作',
    text(values.reason).length < 10 && '寫下至少 10 個字的原因',
  ].filter(Boolean) as string[];
  if (day === 2) return ['situation', 'task', 'action', 'result'].filter((key) => !text(values[key])).map(() => 'STAR 四格都要填寫');
  if (day === 3) return ['context', 'action', 'result'].filter((key) => !text(values[key])).map(() => '情境、行動與結果都要填寫');
  if (day === 4) return ['problem', 'audience', 'proposal', 'successMetric', 'nextStep'].filter((key) => !text(values[key])).map(() => '問題、對象、方案、指標與下一步都要填寫');
  if (day === 5) return ['resumeAction', 'resumeMethod', 'resumeResult'].filter((key) => !text(values[key])).map(() => '做了什麼、怎麼做、結果都要填寫');
  if (day === 6) {
    const missing: string[] = [];
    for (let index = 1; index <= 3; index += 1) {
      if (!text(values[`job${index}Company`]) || !text(values[`job${index}Title`]) || !text(values[`job${index}Url`]) || !text(values[`job${index}Requirement`])) {
        missing.push(`第 ${index} 筆職缺尚未完成`);
      } else if (!/^https?:\/\//i.test(text(values[`job${index}Url`]))) {
        missing.push(`第 ${index} 筆職缺網址格式不正確`);
      }
    }
    return missing;
  }
  return [
    !text(values.wins) && '寫下本週完成的證據',
    !text(values.focus) && '選出下週唯一重點',
    !text(values.firstAction) && '寫下第一個具體行動',
  ].filter(Boolean) as string[];
}

async function copyText(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    const area = document.createElement('textarea');
    area.value = content;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  } catch {
    return false;
  }
}

export default function PlanTaskWorkspace({ day }: { day: number }) {
  const [plan, setPlan] = useState<ActionPlan | null | undefined>(undefined);
  const [values, setValues] = useState<Values>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobSuggestion[]>([]);
  const [jobsState, setJobsState] = useState<'idle' | 'loading' | 'error'>('idle');

  const task = plan?.tasks.find((item) => item.day === day);
  const role = plan ? getRoleById(plan.roleId) : undefined;
  const guide = plan ? getRoleGuide(plan.roleId) : undefined;
  const missing = useMemo(() => requirementsFor(day, values), [day, values]);
  const uniqueMissing = [...new Set(missing)];
  const resumeBullet = [text(values.resumeAction), text(values.resumeMethod) && `透過${text(values.resumeMethod)}`, text(values.resumeResult)].filter(Boolean).join('，');

  useEffect(() => {
    const current = loadActionPlan();
    setPlan(current);
    const currentTask = current?.tasks.find((item) => item.day === day);
    if (!current || !currentTask) return;
    const work = loadActionPlanTaskWork(current.roleId, currentTask.id);
    if (work) {
      setValues(work.values);
      setSavedAt(work.updatedAt);
    }
  }, [day]);

  useEffect(() => {
    if (day !== 6 || !plan) return;
    setJobsState('loading');
    fetch(`/api/jobs?role=${encodeURIComponent(plan.roleId)}&limit=6`)
      .then(async (response) => {
        if (!response.ok) throw new Error('LOAD_FAILED');
        const data = await response.json() as { jobs?: JobSuggestion[] };
        setJobs(data.jobs ?? []);
        setJobsState('idle');
      })
      .catch(() => setJobsState('error'));
  }, [day, plan]);

  function persistValues(next: Values): boolean {
    if (!plan || !task) return false;
    setValues(next);
    try {
      const work = saveActionPlanTaskWork(plan.roleId, task.id, next);
      setSavedAt(work.updatedAt);
      setMessage(null);
      return true;
    } catch {
      setMessage('瀏覽器無法儲存草稿。請確認沒有使用封鎖本機儲存的私密模式，並先保留頁面內容。');
      return false;
    }
  }

  function updateValue(name: string, value: string) {
    persistValues({ ...values, [name]: value });
  }

  function addJob(job: JobSuggestion) {
    if (!plan || !task) return;
    if (Object.values(values).includes(job.url)) {
      setMessage('這筆職缺已經在比較表裡。');
      return;
    }
    let slot = 0;
    for (let index = 1; index <= 3; index += 1) {
      if (!text(values[`job${index}Title`])) {
        slot = index;
        break;
      }
    }
    if (slot === 0) {
      setMessage('比較表已有三筆；先清空其中一筆，再加入新的職缺。');
      return;
    }
    const next = {
      ...values,
      [`job${slot}Company`]: job.company,
      [`job${slot}Title`]: job.title,
      [`job${slot}Url`]: job.url,
      [`job${slot}Deadline`]: job.deadline ?? '',
    };
    persistValues(next);
  }

  function completeTask() {
    if (!task || uniqueMissing.length > 0) {
      setMessage(`還差：${uniqueMissing.join('、')}`);
      return;
    }
    try {
      const updated = setActionPlanTaskCompleted(task.id, true);
      if (updated) setPlan({ ...updated, tasks: [...updated.tasks] });
      setMessage('成果已儲存，這一天完成了。');
    } catch {
      setMessage('瀏覽器無法更新完成狀態，草稿仍留在目前頁面。請稍後再試。');
    }
  }

  if (plan === undefined) return null;
  if (!plan || !task || !role || !guide) {
    return (
      <div className="site-wrapper">
        <SiteNav activePath="/plan" />
        <main className="site-main" id="main-content">
          <section className={styles.empty}>
            <h1>先建立 7 天計畫</h1>
            <p>這個工作台需要先知道你的目標職位，才能準備對應內容。</p>
            <Link href="/plan" className="btn-game">回到計畫</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/plan" />
      <main className="site-main" id="main-content">
        <div className={styles.workspace}>
          <Link href="/plan" className={styles.backLink}>&larr; 回到 7 天計畫</Link>
          <header className={styles.header}>
            <div>
              <p>Day {day} · {role.name}</p>
              <h1>{DAY_LABELS[day - 1]}</h1>
              <span>{task.detail}</span>
            </div>
            <div className={task.completedAt ? styles.doneStatus : styles.dayStatus}>
              {task.completedAt ? '已完成' : `${day} / 7`}
            </div>
          </header>

          <section className={styles.formPanel}>
            {day === 1 && (
              <>
                <label className={styles.field}>
                  <span>我最想嘗試的一項工作</span>
                  <select value={values.workChoice ?? ''} onChange={(event) => updateValue('workChoice', event.target.value)}>
                    <option value="">選一項真實工作內容</option>
                    {guide.dayInLife.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <Field label="為什麼想嘗試？" name="reason" value={values.reason ?? ''} onChange={updateValue} placeholder="例如：我喜歡把模糊需求整理成可執行步驟..." />
                <Field label="我還需要確認的問題" name="question" value={values.question ?? ''} onChange={updateValue} placeholder="例如：實習生通常能參與到哪個決策階段？" />
              </>
            )}

            {day === 2 && (
              <div className={styles.twoColumns}>
                <Field label="S 情境" name="situation" value={values.situation ?? ''} onChange={updateValue} hint="當時發生什麼事？背景與限制是什麼？" />
                <Field label="T 任務" name="task" value={values.task ?? ''} onChange={updateValue} hint="你負責達成什麼目標？" />
                <Field label="A 行動" name="action" value={values.action ?? ''} onChange={updateValue} hint="你具體做了什麼？不要只寫團隊做了什麼。" />
                <Field label="R 結果" name="result" value={values.result ?? ''} onChange={updateValue} hint="造成什麼改變？盡量補數字或可驗證成果。" />
              </div>
            )}

            {day === 3 && (
              <>
                <div className={styles.focusBox}><strong>今天要補的能力</strong><span>{task.title.replace(/^補一個「|」證據$/g, '')}</span></div>
                <Field label="證據發生在哪個情境？" name="context" value={values.context ?? ''} onChange={updateValue} />
                <Field label="你做了哪個具體行動？" name="action" value={values.action ?? ''} onChange={updateValue} />
                <Field label="有什麼結果或他人回饋？" name="result" value={values.result ?? ''} onChange={updateValue} />
              </>
            )}

            {day === 4 && (
              <>
                <div className={styles.focusBox}><strong>作品題目</strong><span>{task.detail}</span></div>
                <div className={styles.twoColumns}>
                  <Field label="要解決的問題" name="problem" value={values.problem ?? ''} onChange={updateValue} />
                  <Field label="作品要給誰看／幫助誰" name="audience" value={values.audience ?? ''} onChange={updateValue} />
                  <Field label="你的方案或分析方法" name="proposal" value={values.proposal ?? ''} onChange={updateValue} rows={4} />
                  <Field label="成功指標" name="successMetric" value={values.successMetric ?? ''} onChange={updateValue} hint="用什麼數字或現象判斷方案有效？" />
                </div>
                <Field label="下一個 30 分鐘能做的事" name="nextStep" value={values.nextStep ?? ''} onChange={updateValue} placeholder="例如：找 3 個競品並截圖整理 onboarding 步驟" />
              </>
            )}

            {day === 5 && (
              <>
                <Field label="你做了什麼" name="resumeAction" value={values.resumeAction ?? ''} onChange={updateValue} placeholder="例如：重新設計新手註冊流程" />
                <Field label="你怎麼做" name="resumeMethod" value={values.resumeMethod ?? ''} onChange={updateValue} placeholder="例如：訪談 8 位使用者並分析漏斗數據" />
                <Field label="結果如何" name="resumeResult" value={values.resumeResult ?? ''} onChange={updateValue} placeholder="例如：把完成率從 54% 提升到 71%" />
                <div className={styles.outputBox}>
                  <div><strong>履歷句子預覽</strong><span>可直接貼進履歷，再依真實情況調整。</span></div>
                  <p>{resumeBullet || '填完上方三格，這裡會組成一段成果句。'}</p>
                  <button type="button" onClick={async () => setMessage(await copyText(resumeBullet) ? '履歷句子已複製。' : '無法自動複製，請直接選取文字。')} disabled={!resumeBullet}>複製句子</button>
                </div>
              </>
            )}

            {day === 6 && (
              <>
                <div className={styles.jobFinder}>
                  <div><strong>目前開放的 {role.name} 職缺</strong><span>點一下加入比較，再打開原文找共同要求。</span></div>
                  {jobsState === 'loading' && <p>正在載入職缺...</p>}
                  {jobsState === 'error' && <p>暫時無法載入推薦職缺，你仍可在下方手動填寫。</p>}
                  {jobs.length > 0 && (
                    <ul>{jobs.map((job) => (
                      <li key={job.id}>
                        <div><strong>{job.title}</strong><span>{job.company}{job.deadline ? ` · 截止 ${job.deadline}` : ''}</span></div>
                        <a href={job.url} target="_blank" rel="noopener noreferrer">看原文</a>
                        <button type="button" onClick={() => addJob(job)} disabled={Object.values(values).includes(job.url)}>
                          {Object.values(values).includes(job.url) ? '已加入' : '加入比較'}
                        </button>
                      </li>
                    ))}</ul>
                  )}
                </div>
                {[1, 2, 3].map((index) => (
                  <fieldset key={index} className={styles.jobSlot}>
                    <legend>職缺 {index}</legend>
                    <div className={styles.jobGrid}>
                      <label><span>公司</span><input value={values[`job${index}Company`] ?? ''} onChange={(event) => updateValue(`job${index}Company`, event.target.value)} /></label>
                      <label><span>職稱</span><input value={values[`job${index}Title`] ?? ''} onChange={(event) => updateValue(`job${index}Title`, event.target.value)} /></label>
                      <label className={styles.wideField}><span>職缺網址</span><input type="url" inputMode="url" value={values[`job${index}Url`] ?? ''} onChange={(event) => updateValue(`job${index}Url`, event.target.value)} /></label>
                      <label><span>截止日</span><input type="date" value={values[`job${index}Deadline`] ?? ''} onChange={(event) => updateValue(`job${index}Deadline`, event.target.value)} /></label>
                      <label className={styles.wideField}><span>這份職缺最重要的一項要求</span><input value={values[`job${index}Requirement`] ?? ''} onChange={(event) => updateValue(`job${index}Requirement`, event.target.value)} /></label>
                    </div>
                  </fieldset>
                ))}
              </>
            )}

            {day === 7 && (
              <>
                <div className={styles.weekStats}>
                  {plan.tasks.slice(0, 6).map((item) => <span key={item.id} className={item.completedAt ? styles.statDone : ''}>Day {item.day} {item.completedAt ? '完成' : '未完成'}</span>)}
                </div>
                <Field label="這週完成了哪些可驗證成果？" name="wins" value={values.wins ?? ''} onChange={updateValue} />
                <Field label="哪一步最卡？原因是什麼？" name="stuck" value={values.stuck ?? ''} onChange={updateValue} />
                <Field label="下週唯一最重要的重點" name="focus" value={values.focus ?? ''} onChange={updateValue} />
                <Field label="第一個具體行動" name="firstAction" value={values.firstAction ?? ''} onChange={updateValue} hint="寫到可以直接放進行事曆，例如：週一 19:00 修改 PM 履歷第一段。" />
                <button type="button" className={styles.calendarButton} onClick={() => downloadIcs(generateWeeklyReviewIcs(), '職涯闖關島-每週回顧.ics')}>下載每週回顧提醒</button>
              </>
            )}
          </section>

          <aside className={styles.saveBar} aria-live="polite">
            <div>
              <strong>{savedAt ? '草稿已自動儲存' : '開始填寫後會自動儲存'}</strong>
              <span>{uniqueMissing.length === 0 ? '完成條件已達成' : `還有 ${uniqueMissing.length} 項完成條件`}</span>
            </div>
            <button type="button" className="btn-game" onClick={completeTask}>{task.completedAt ? '更新成果' : '儲存並完成'}</button>
          </aside>
          {message && <p className={message.startsWith('還差') ? styles.errorMessage : styles.successMessage} aria-live="polite">{message}</p>}

          <nav className={styles.dayNav} aria-label="計畫天數導覽">
            {day > 1 ? <Link href={`/plan/task/${day - 1}`}>&larr; Day {day - 1}</Link> : <span />}
            {day < 7 ? <Link href={`/plan/task/${day + 1}`}>Day {day + 1} &rarr;</Link> : <Link href="/plan">查看完整計畫</Link>}
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
}
