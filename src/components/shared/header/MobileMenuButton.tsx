'use client';

import { useMobileMenuContext } from '@/context/MobileMenuContext';
import { Menu } from 'lucide-react';

const MobileMenuButton = () => {
  const { openMenu } = useMobileMenuContext();

  return (
    <div className="block lg:hidden">
      <button
        onClick={openMenu}
        className="nav-hamburger flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black text-white/80 transition-colors hover:border-white/25 hover:text-white"
        aria-label="Open mobile menu">
        <Menu aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
};

export default MobileMenuButton;
