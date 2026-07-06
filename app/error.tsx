'use client';

import { useEffect } from 'react';
import Mascot from '@/components/Mascot';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <div style={{ marginBottom: 8 }}>
        <Mascot size={80} variant="think" className="mascot-idle" />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--coral-deep)' }}>500</h1>
      <h2>出了點問題</h2>
      <p>藍藍也沒預料到這個錯誤，請再試一次。</p>
      <button type="button" className="btn-game" onClick={reset}>重新載入</button>
    </main>
  );
}
