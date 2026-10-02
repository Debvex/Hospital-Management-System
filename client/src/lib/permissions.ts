/**
 * Role-Based Access Control (RBAC) helpers for CarePulse HMS.
 *
 * Maps each application page to the set of user roles permitted to access it.
 * This is the single source of truth used by the Sidebar, Footer, Home page,
 * and the top-level App router to gate navigation and page rendering.
 */

import type { UserRole } from '../types';
import type { PageId } from '../components/layout/Sidebar';

/**
 * Page -> allowed roles mapping.
 *
 * A page that is omitted from this map (or has no `allowedRoles` entry) is
 * considered public and accessible to every authenticated role.
 */
export const PAGE_ACCESS: Record<PageId, UserRole[]> = {
  home: ['administrator', 'doctor', 'receptionist', 'patient'],
  dashboard: ['administrator', 'receptionist'],
  appointments: ['administrator', 'doctor', 'receptionist', 'patient'],
  patients: ['administrator', 'doctor', 'receptionist', 'patient'],
  doctors: ['administrator', 'receptionist', 'patient'],
  'medical-records': ['administrator', 'doctor', 'patient'],
  billing: ['administrator', 'receptionist', 'patient'],
  settings: ['administrator'],
};

/**
 * Determine whether a given role is allowed to access a page.
 *
 * Defaults to denying access for unknown pages so that newly added routes are
 * secure-by-default until they are explicitly mapped above.
 */
export function canAccessPage(role: UserRole, page: PageId): boolean {
  const allowedRoles = PAGE_ACCESS[page];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Convenience helper for filtering navigation items by the current role.
 */
export function filterPagesByRole(role: UserRole, pages: PageId[]): PageId[] {
  return pages.filter((page) => canAccessPage(role, page));
}

export default canAccessPage;
