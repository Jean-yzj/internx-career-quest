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

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="6" cy="6" r="1.3" fill="currentColor"/>
      <path d="M3.5 12l3.2-3 2.1 1.8 1.7-1.6 2 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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

  function downloadShareImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#EAF4FF';
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#B8D8FF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(72, 64, 1056, 502, 28);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0182FD';
    ctx.beginPath();
    ctx.arc(132, 126, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('職', 132, 138);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1861A8';
    ctx.font = '700 28px sans-serif';
    ctx.fillText('職涯闖關島', 184, 137);

    function drawWrapped(text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
      const chars = Array.from(text);
      let line = '';
      let lineIndex = 0;
      for (const char of chars) {
        const next = line + char;
        if (ctx!.measureText(next).width > maxWidth && line) {
          ctx!.fillText(line, x, y + lineIndex * lineHeight);
          line = char;
          lineIndex += 1;
          if (lineIndex >= maxLines) return;
        } else {
          line = next;
        }
      }
      if (lineIndex < maxLines && line) ctx!.fillText(line, x, y + lineIndex * lineHeight);
    }

    ctx.fillStyle = '#18233A';
    ctx.font = '700 54px "Noto Sans TC", sans-serif';
    drawWrapped(title, 112, 250, 930, 72, 2);
    ctx.fillStyle = '#5A6880';
    ctx.font = '400 32px "Noto Sans TC", sans-serif';
    drawWrapped(body, 112, 405, 930, 48, 2);
    ctx.fillStyle = '#0182FD';
    ctx.font = '700 25px "Noto Sans TC", sans-serif';
    ctx.fillText('quest.lazybearlife.com', 112, 520);
    const link = document.createElement('a');
    link.download = 'career-quest-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
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
        <button type="button" className="btn-ghost share-card-btn" onClick={downloadShareImage}>
          <ImageIcon />
          下載圖片
        </button>
      </div>
    </div>
  );
}
