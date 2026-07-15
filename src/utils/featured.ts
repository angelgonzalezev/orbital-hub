import type { Startup } from '@/interface/startup';

export const isCurrentlyFeatured = (startup: Pick<Startup, 'featuredUntil'>): boolean =>
  Boolean(startup.featuredUntil && new Date(startup.featuredUntil).getTime() > Date.now());
