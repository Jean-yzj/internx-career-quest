'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ParsedJob } from '@/lib/parse-schema';
import { IconSpinner, IconOffline, IconWarning } from './Icons';

interface ParseResult extends ParsedJob {
  engine: 'ai' | 'fallback';
}

interface PasteBoxProps {
  onResult: (result: ParseResult, rawText: string) => void;
  collapsed?: boolean;
  clearSignal?: number;
}

const MAX_CHARS = 15000;
const MIN_CHARS = 30;

export default function PasteBox({ onResult, collapsed, clearSignal }: PasteBoxProps) {
  const [text, setText] = useState('');

  // 存入成功後由父層遞增 clearSignal，清空輸入避免重複建卡
  useEffect(() => {
    if (clearSignal) setText('');
  }, [clearSignal]);
  const [loading, setLoading] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const longWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent instanceof InputEvent && e.nativeEvent.isComposing) return;
    const val = e.target.value;
    if (val.length > MAX_CHARS) {
      setText(val.slice(0, MAX_CHARS));
      setError(`已截斷至 ${MAX_CHARS} 字上限`);
    } else {
      setText(val);
      if (error && error.startsWith('已截斷')) setError(null);
    }
  }, [error]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.length > MAX_CHARS) {
      e.preventDefault();
      setText(pasted.slice(0, MAX_CHARS));
      setError(`貼上內容已截斷至 ${MAX_CHARS} 字上限`);
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    if (longWaitTimer.current) clearTimeout(longWaitTimer.current);
    if (autoFallbackTimer.current) clearTimeout(autoFallbackTimer.current);
    setLoading(false);
    setLongWait(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();

    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      setOffline(true);
      return;
    }
    setOffline(false);

    if (trimmed.length < MIN_CHARS) {
      setError('內容太短，請貼完整一點（至少 30 字）');
      return;
    }

    setError(null);
    setLoading(true);
    setLongWait(false);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    longWaitTimer.current = setTimeout(() => setLongWait(true), 10_000);

    // 20s client-side auto-abort then fallback
    autoFallbackTimer.current = setTimeout(() => {
      ctrl.abort();
    }, 20_000);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
        signal: ctrl.signal,
      });

      if (longWaitTimer.current) clearTimeout(longWaitTimer.current);
      if (autoFallbackTimer.current) clearTimeout(autoFallbackTimer.current);

      const json = await res.json();

      if (!json.ok) {
        setError(json.error?.message ?? '辨識失敗，請重試。');
        setLoading(false);
        setLongWait(false);
        return;
      }

      setLoading(false);
      setLongWait(false);
      onResult(json.data as ParseResult, trimmed);
    } catch (err: unknown) {
      if (longWaitTimer.current) clearTimeout(longWaitTimer.current);
      if (autoFallbackTimer.current) clearTimeout(autoFallbackTimer.current);

      const isAbort = err instanceof Error && err.name === 'AbortError';
      setLoading(false);
      setLongWait(false);

      if (isAbort) {
        // Timed out — try fallback directly
        try {
          const res = await fetch('/api/parse', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: trimmed }),
          });
          const json = await res.json();
          if (json.ok) {
            onResult({ ...json.data, engine: 'fallback' } as ParseResult, trimmed);
            return;
          }
        } catch {
          // ignore
        }
        setError('辨識逾時，請重試。');
      } else if (!window.navigator.onLine) {
        setOffline(true);
      } else {
        setError('網路錯誤，請重試。');
      }
    }
  }, [text, onResult]);

  if (collapsed) return null;

  const trimmed = text.trim();
  const canSubmit = !loading && trimmed.length >= MIN_CHARS && trimmed.length <= MAX_CHARS;

  return (
    <section className="paste-box-section">
      <h2 className="paste-box-title">貼上職缺內容，自動辨識欄位</h2>

      {offline && (
        <div className="paste-offline" role="alert">
          <IconOffline size={16} />
          <span>網路斷了，請檢查連線後再試。</span>
        </div>
      )}

      <div className="paste-box-wrap">
        <textarea
          className="paste-textarea"
          value={text}
          onChange={handleTextChange}
          onPaste={handlePaste}
          placeholder="把職缺內容整段貼進來（104、CakeResume、LinkedIn、IG 貼文都可以）"
          rows={8}
          disabled={loading}
          aria-label="職缺內容"
        />
        <p className="paste-hint">請貼職缺內容就好，不需要貼你的個人資料。</p>
        {text.length > 0 && (
          <p className="paste-charcount" aria-live="polite">
            {text.length} / {MAX_CHARS} 字
          </p>
        )}
        {error && (
          <p className="paste-error" role="alert">
            <IconWarning size={14} />
            {' '}{error}
          </p>
        )}
      </div>

      <div className="paste-cta-row">
        <button
          type="button"
          className="btn-primary paste-cta"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <IconSpinner size={16} />
              {longWait ? '再等一下，快好了' : 'AI 辨識中，約 5–10 秒'}
            </>
          ) : (
            '開始辨識'
          )}
        </button>

        {loading && (
          <button type="button" className="btn-ghost" onClick={handleCancel}>
            取消
          </button>
        )}
      </div>
    </section>
  );
}
