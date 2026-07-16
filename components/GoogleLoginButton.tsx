'use client';

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId, getProfile, saveProfile, type Profile } from '@/lib/profile';

interface MeResp {
  enabled: boolean;
  authenticated: boolean;
  email?: string | null;
  profile?: Profile;
}

// 以「設定卡的一列」呈現。未設定 Google（enabled=false）時整列不顯示。
// 從父層傳入 CSS module 的 row/label class，確保與其他設定列視覺一致。
export default function GoogleLoginButton({
  rowClass,
  labelClass,
}: {
  rowClass?: string;
  labelClass?: string;
}) {
  const [state, setState] = useState<MeResp | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: MeResp) => {
        if (!alive) return;
        setState(data);
        // 跨裝置找回：伺服器的正規檔案與本機不同 → 採用之並重新整理
        if (data.authenticated && data.profile) {
          const local = getProfile();
          if (!local || local.deviceId !== data.profile.deviceId) {
            saveProfile(data.profile);
            window.location.reload();
          }
        }
      })
      .catch(() => {
        if (alive) setState({ enabled: false, authenticated: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!state || !state.enabled) return null;

  function login() {
    const device = getOrCreateDeviceId();
    window.location.href = `/api/auth/google/start?device=${encodeURIComponent(device)}`;
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    window.location.reload();
  }

  return (
    <div className={rowClass}>
      <span className={labelClass}>帳號</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
        {state.authenticated ? (
          <>
            <span style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>
              已用 Google 登入{state.email ? ` · ${state.email}` : ''}
            </span>
            <button type="button" className="btn-small" onClick={logout} disabled={busy}>
              {busy ? '…' : '登出'}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-small" onClick={login} disabled={busy}>
              使用 Google 登入
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
              換裝置也能一鍵找回進度
            </span>
          </>
        )}
      </div>
    </div>
  );
}
