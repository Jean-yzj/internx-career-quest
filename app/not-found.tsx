import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page">
      <h1>404</h1>
      <h2>頁面不存在</h2>
      <p>你要找的頁面已移走或從未存在。</p>
      <Link href="/" className="btn-primary">回首頁</Link>
    </main>
  );
}
