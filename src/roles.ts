import type { Role } from './types';

export const ROLE_COLORS: Record<Role, string> = {
  S: '#8b5cf6', // setter — purple
  OH: '#14b8a6', // outside hitter — teal
  MB: '#f97316', // middle blocker — coral / orange
  OPP: '#3b82f6', // opposite / right-side — blue
  GEN: '#64748b', // generic (6-6) — slate
};

export const ROLE_NAMES: Record<Role, string> = {
  S: 'Setter',
  OH: 'Outside hitter',
  MB: 'Middle blocker',
  OPP: 'Opposite / right-side',
  GEN: 'Player',
};

export const LEGEND_ROLES: Role[] = ['S', 'OH', 'MB', 'OPP'];
