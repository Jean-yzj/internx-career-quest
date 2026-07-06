import Link from 'next/link';
import Mascot from '@/components/Mascot';

export default function NotFound() {
  return (
    <main className="error-page">
      <div style={{ marginBottom: 8 }}>
        <Mascot size={80} variant="think" className="mascot-idle" />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--brand)' }}>404</h1>
      <h2>頁面不存在</h2>
      <p>這片島嶼好像還沒有地圖，你要找的頁面已移走或從未存在。</p>
      <Link href="/" className="btn-game">回到首頁</Link>
    </main>
  );
}
