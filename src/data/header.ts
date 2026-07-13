export interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/startups',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
];
