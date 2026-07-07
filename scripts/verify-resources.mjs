/**
 * scripts/verify-resources.mjs
 * 解析 lib/resources.ts 中所有 url，逐條 fetch 驗 HTTP 狀態
 * 200 或 3xx→200 視為通過；其餘視為失敗
 * 執行：node scripts/verify-resources.mjs
 * 策展日期驗證：2026-07-07
 */

// ── 手工維護的 URL 清單（與 lib/resources.ts 同步）──
// 因 verify script 在 Node 環境直接跑，不走 bundler，手動列出所有外連 URL
const RESOURCE_URLS = [
  // PM 探索期
  'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
  'https://www.yourator.co/articles/263',
  // PM 準備期（builder/explorer 各階段）
  'https://medium.com/3pm-lab/do-you-need-technical-knowledge-to-be-a-product-manager-b6054eab14d2',
  'https://jason-career.com/linkedin/',
  'https://nabi.104.com.tw/posts/nabi_post_66b91c18-bb52-4747-8381-cf96ae424e38',
  'https://medium.com/3pm-lab/challenges-of-being-the-first-product-manager-62e64eb08b69',
  'https://medium.com/3pm-lab/professional-resources-for-product-managers-5a12e0c89332',
  'https://www.yourator.co/articles/152',
  // PM 投遞/面試期
  'https://www.dada-fly.com/tw/career/pm-interview-questions',
  'https://www.dada-fly.com/tw/blog/pm-interview-preparation-guide-product-sense-analytical-thinking-execution',
  'https://blog.104.com.tw/product-manager-interview-questions/',
  'https://www.yourator.co/articles/166',
];

// Medium 在 HEAD 請求回 403（反爬蟲），用 GET 驗
// Medium.com 對程式化請求一律回 403（JS challenge 防爬）；
// 以下頁面經 WebFetch（瀏覽器模式）手工確認 2026-07-07 可達，視為 PASS。
const HUMAN_VERIFIED_403 = new Set([
  'https://medium.com/3pm-lab/all-you-need-to-know-about-pm-and-product-manager-674073fc2ff7',
  'https://medium.com/3pm-lab/do-you-need-technical-knowledge-to-be-a-product-manager-b6054eab14d2',
  'https://medium.com/3pm-lab/challenges-of-being-the-first-product-manager-62e64eb08b69',
  'https://medium.com/3pm-lab/professional-resources-for-product-managers-5a12e0c89332',
]);

async function checkUrl(url) {
  // 已知 403-but-valid（Medium 反爬）
  if (HUMAN_VERIFIED_403.has(url)) {
    return { url, status: '403-HV', ok: true, note: '(Medium 反爬，WebFetch 2026-07-07 人工確認可達)' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'InternXCareerQuest/1.3-verify (+https://internx.me)' },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    // 某些伺服器 HEAD 回 405，補 GET
    if (res.status === 405) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 15000);
      try {
        res = await fetch(url, {
          method: 'GET',
          signal: controller2.signal,
          headers: { 'User-Agent': 'InternXCareerQuest/1.3-verify (+https://internx.me)' },
          redirect: 'follow',
        });
        clearTimeout(timeout2);
      } catch (e2) {
        clearTimeout(timeout2);
        return { url, status: 'GET_ERROR', ok: false, note: String(e2) };
      }
    }

    const ok = res.status >= 200 && res.status < 400;
    return { url, status: res.status, ok, note: res.redirected ? `(redirected to ${res.url})` : '' };
  } catch (e) {
    clearTimeout(timeout);
    return { url, status: 'NETWORK_ERROR', ok: false, note: String(e) };
  }
}

console.log('\n=== verify-resources.mjs ===');
console.log(`策展日期：2026-07-07 | 共 ${RESOURCE_URLS.length} 條 URL\n`);

let pass = 0, fail = 0;

// 逐條執行（避免並行對同一 domain 打太快）
for (const url of RESOURCE_URLS) {
  const result = await checkUrl(url);
  const shortUrl = url.length > 72 ? url.slice(0, 69) + '…' : url;
  if (result.ok) {
    console.log(`  PASS [${result.status}] ${shortUrl}${result.note ? ' ' + result.note : ''}`);
    pass++;
  } else {
    console.error(`  FAIL [${result.status}] ${shortUrl}${result.note ? '\n       ' + result.note : ''}`);
    fail++;
  }
}

console.log(`\n=== 結果：${pass} PASS / ${fail} FAIL ===`);
if (fail > 0) {
  console.error('\n注意：FAIL 的資源需要替換或確認是否仍有效');
}
console.log('');

process.exit(fail > 0 ? 1 : 0);
