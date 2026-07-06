'use client';

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="網站連結">
        <a href="/terms">服務條款</a>
        <a href="/privacy">隱私權政策</a>
        <a href="https://internx.me" target="_blank" rel="noopener noreferrer">internx.me</a>
      </nav>
      <p className="footer-copy">
        客服：<a href="mailto:internx.me@gmail.com">internx.me@gmail.com</a>
        {' '}｜{' '}
        &copy; 2026 職途有限公司
      </p>
    </footer>
  );
}
