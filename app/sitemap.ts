import type { MetadataRoute } from 'next';
import { ROLE_IDS } from '@/lib/roles';

const BASE = 'https://quest.lazybearlife.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // 只列未註冊者也看得到內容的公開頁；island/profile 等需本地資料的頁不列
  const routes = ['', '/quiz/interest', '/quiz/ability', '/analysis', '/war-room', '/guilds', '/terms', '/privacy'];
  const baseEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));

  const roleListEntry: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/roles`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const roleDetailEntries: MetadataRoute.Sitemap = ROLE_IDS.map((id) => ({
    url: `${BASE}/roles/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...baseEntries, ...roleListEntry, ...roleDetailEntries];
}
