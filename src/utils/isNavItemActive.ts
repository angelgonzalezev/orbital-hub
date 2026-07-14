export const isNavItemActive = (pathname: string, href: string): boolean => {
  // Exact match only, so /dashboard/startups doesn't also activate Dashboard.
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
};
