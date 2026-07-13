export interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/#about',
  },
  {
    id: 'process',
    label: 'How it works',
    href: '/#process',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    href: '/#roadmap',
  },
];
