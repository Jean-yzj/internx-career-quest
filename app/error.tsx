'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <h1>500</h1>
      <h2>出了點問題</h2>
      <p>頁面載入時發生錯誤，請再試一次。</p>
      <button type="button" className="btn-primary" onClick={reset}>重新載入</button>
    </main>
  );
}
