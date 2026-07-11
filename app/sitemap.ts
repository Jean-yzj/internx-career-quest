import type { MetadataRoute } from 'next';
import { ROLES } from '@/lib/roles';

const SITE_URL = 'https://quest.lazybearlife.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    '',
    '/quick-start',
    '/roles',
    '/quiz/interest',
    '/quiz/ability',
    '/analysis',
    '/war-room',
    '/guilds',
    '/privacy',
    '/terms',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
    ...ROLES.map((role) => ({
      url: `${SITE_URL}/roles/${role.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
