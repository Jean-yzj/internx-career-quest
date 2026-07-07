'use client';

/**
 * components/AddToHome.tsx
 * 加入主畫面引導
 * 觸發條件：今日任務 3 個全完成 或 第一次過關
 * 每裝置一次（localStorage a2hs.v1）
 * standalone display-mode 時永不顯示
 */

import { useEffect, useState } from 'react';

interface AddToHomeProps {
  /** 今日任務是否全部完成 */
  allDailyDone: boolean;
  /** 是否有關卡剛過關（第一次 cleared） */
  justCleared: boolean;
}

export default function AddToHome({ allDailyDone, justCleared }: AddToHomeProps) {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // standalone 模式（已加入主畫面）→ 永不顯示
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // 已看過 → 不再顯示
    if (localStorage.getItem('a2hs.v1')) return;

    // 偵測 iOS Safari
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    setIsIOS(ios);

    // Android/Chrome：攔截 beforeinstallprompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (installed) return;
    if (localStorage.getItem('a2hs.v1')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (allDailyDone || justCleared) {
      setShow(true);
    }
  }, [allDailyDone, justCleared, installed]);

  function handleDismiss() {
    localStorage.setItem('a2hs.v1', '1');
    setShow(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    localStorage.setItem('a2hs.v1', '1');
    setShow(false);
    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="加入主畫面"
      style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 390,
        background: 'var(--card)', border: '1.5px solid var(--line)',
        borderRadius: 16, padding: '16px 18px', zIndex: 1000,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* 關閉按鈕 */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="關閉"
        style={{
          position: 'absolute', top: 12, right: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-2)', fontSize: '1.125rem', lineHeight: 1,
          padding: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        {/* 藍藍小圖示 */}
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z" fill="#4DA3FF" stroke="#1861A8" strokeWidth="3"/>
          <path d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z" fill="#EAF4FF"/>
          <circle cx="48" cy="50" r="4" fill="#1A2733"/><circle cx="72" cy="50" r="4" fill="#1A2733"/>
          <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 4 }}>
            加到主畫面，明天更快回來
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            不佔空間，連結比 App 快速。
          </div>
        </div>
      </div>

      {/* Android：原生安裝按鈕 */}
      {!isIOS && deferredPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          style={{
            width: '100%', background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px 0',
            fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
          }}
        >
          加入主畫面
        </button>
      )}

      {/* Android：沒有 deferredPrompt（瀏覽器不支援或已安裝） */}
      {!isIOS && !deferredPrompt && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
          在 Chrome 選單（右上角三點）中選「加到主畫面」。
        </p>
      )}

      {/* iOS Safari：兩步驟教學 */}
      {isIOS && (
        <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 }}>
            點底部中間的分享按鈕&nbsp;
            {/* iOS Share icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="分享" style={{ verticalAlign: 'middle', display: 'inline' }}>
              <path d="M12 2v12" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 6l4-4 4 4" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 11H3a1 1 0 00-1 1v9a1 1 0 001 1h18a1 1 0 001-1v-9a1 1 0 00-1-1h-2" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </li>
          <li style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 }}>
            向下捲，選「加入主畫面」，然後按「新增」
          </li>
        </ol>
      )}
    </div>
  );
}
