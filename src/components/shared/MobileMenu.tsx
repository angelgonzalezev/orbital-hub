'use client';

import { useMobileMenuContext } from '@/context/MobileMenuContext';
import { navigationItems } from '@/data/header';
import { cn } from '@/utils/cn';
import logoDark from '@public/images/shared/logo-dark.svg';
import logo from '@public/images/shared/logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import WalletConnectButton from './WalletConnectButton';

const MobileMenu = () => {
  const { isOpen, closeMenu } = useMobileMenuContext();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={cn('fixed inset-0 z-[999] xl:hidden', !isOpen && 'pointer-events-none')} aria-hidden={!isOpen}>
      <button
        type="button"
        onClick={closeMenu}
        aria-label="Close mobile menu"
        tabIndex={isOpen ? 0 : -1}
        className={cn(
          'absolute inset-0 bg-black/60 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        tabIndex={-1}
        className={cn(
          'dark:bg-background-7 scroll-bar absolute top-0 right-0 h-dvh w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}>
        <div className="flex h-full flex-col gap-8 p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={closeMenu}>
              <span className="sr-only">Home</span>
              <figure className="max-w-[44px]">
                <Image src={logo} alt="Solana Startups Hub" className="block w-full dark:hidden" />
                <Image src={logoDark} alt="Solana Startups Hub" className="hidden w-full dark:block" />
              </figure>
            </Link>
            <button
              onClick={closeMenu}
              className="nav-hamburger-close bg-background-4 dark:bg-background-9 hover:bg-background-5 dark:hover:bg-background-8 group relative flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full transition-all duration-200 hover:scale-105"
              aria-label="Close mobile menu">
              <span className="sr-only">Close Menu</span>
              <span className="bg-stroke-9/60 dark:bg-stroke-1 absolute block h-0.5 w-4 rotate-45 transition-all duration-200 group-hover:bg-stroke-1"></span>
              <span className="bg-stroke-9/60 dark:bg-stroke-1 absolute block h-0.5 w-4 -rotate-45 transition-all duration-200 group-hover:bg-stroke-1"></span>
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex-1">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="dark:text-accent hover:bg-background-4 dark:hover:bg-background-8 flex min-h-14 items-center rounded-md px-4 text-lg font-medium text-secondary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div onClick={closeMenu}>
            <WalletConnectButton className="w-full" />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;
