'use client';

import { useMemo, useState } from 'react';

type ShareCardProps = {
  title: string;
  body: string;
  cta?: string;
  url?: string;
};

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11 5l-6 3 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 6v6a2 2 0 002 2h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function ShareCard({ title, body, cta = '一起來職涯闖關島看看', url }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.origin : 'https://quest.lazybearlife.com');
  const shareText = useMemo(() => `${title}\n${body}\n${cta}\n${shareUrl}`, [body, cta, shareUrl, title]);

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyShareText();
      return;
    }
    try {
      await navigator.share({ title, text: `${body}\n${cta}`, url: shareUrl });
    } catch {
      // User cancelled or sharing failed. Keep the card quiet.
    }
  }

  return (
    <div className="share-card">
      <div className="share-card-copy">
        <span className="share-card-eyebrow">分享結果</span>
        <p className="share-card-title">{title}</p>
        <p className="share-card-body">{body}</p>
      </div>
      <div className="share-card-actions">
        <button type="button" className="btn-primary share-card-btn" onClick={nativeShare}>
          <ShareIcon />
          分享
        </button>
        <button type="button" className="btn-ghost share-card-btn" onClick={copyShareText}>
          <CopyIcon copied={copied} />
          {copied ? '已複製' : '複製'}
        </button>
      </div>
    </div>
  );
}
