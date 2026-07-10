import type { MetadataRoute } from 'next';

const BASE = 'https://quest.lazybearlife.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // 只列未註冊者也看得到內容的公開頁；island/profile 等需本地資料的頁不列
  const routes = ['', '/quiz/interest', '/quiz/ability', '/analysis', '/war-room', '/guilds', '/terms', '/privacy'];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));
}
