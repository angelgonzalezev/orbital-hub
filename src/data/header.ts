import type { LucideIcon } from 'lucide-react';
import { CircleHelp, Info, LayoutDashboard, LayoutGrid, Rocket, Store, UserRound } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/#about',
    icon: Info,
  },
  {
    id: 'process',
    label: 'How it works',
    href: '/#process',
    icon: CircleHelp,
  },
  {
    id: 'features',
    label: 'Available now',
    href: '/#features',
    icon: LayoutGrid,
  },
];

export const platformNavigationItems: NavigationItem[] = [
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/startups',
    icon: Store,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'my-startups',
    label: 'My Startups',
    href: '/dashboard/startups',
    icon: Rocket,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/dashboard/profile',
    icon: UserRound,
  },
];
