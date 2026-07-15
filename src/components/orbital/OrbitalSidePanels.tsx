'use client';

import { Rocket, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import type { Startup } from '@/interface/startup';
import { resolveMediaUrl } from '@/services/mediaService';
import { isCurrentlyFeatured } from '@/utils/featured';

const MAX_FEATURED = 5;

interface OrbitalSidePanelsProps {
  startups: Startup[];
}

const OrbitalSidePanels: React.FC<OrbitalSidePanelsProps> = ({ startups }) => {
  const featured = useMemo(() => startups.filter(isCurrentlyFeatured).slice(0, MAX_FEATURED), [startups]);

  return (
    <>
      {/* Featured startups — left side */}
      {featured.length > 0 && (
        <aside className="absolute top-1/2 left-6 z-10 hidden w-[300px] -translate-y-1/2 flex-col gap-4 rounded-[30px] border border-white/5 bg-[#0A0A0A]/80 p-6 backdrop-blur-xl xl:flex">
          <div className="flex items-center gap-2">
            <Star aria-hidden="true" className="size-4 fill-[#fbbf24] text-[#fbbf24]" />
            <h2 className="text-sm font-semibold tracking-[0.15em] text-white/80 uppercase">Featured</h2>
          </div>
          <ul className="space-y-1">
            {featured.map((startup) => {
              const logoUrl = resolveMediaUrl(startup.logo);
              const location = [startup.city, startup.country].filter(Boolean).join(', ');
              return (
                <li key={startup.id}>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/5">
                    <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={startup.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/20">
                          {startup.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-primary-400">
                        {startup.name}
                      </p>
                      {location && <p className="truncate text-xs text-white/50">📍 {location}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* CTA — right side */}
      <aside className="absolute top-1/2 right-6 z-10 hidden w-[300px] -translate-y-1/2 flex-col gap-4 rounded-[30px] border border-white/5 bg-[#0A0A0A]/80 p-6 backdrop-blur-xl xl:flex">
        <div className="flex items-center gap-2">
          <Rocket aria-hidden="true" className="size-4 text-primary-500" />
          <h2 className="text-sm font-semibold tracking-[0.15em] text-white/80 uppercase">Join the orbit</h2>
        </div>
        <p className="text-sm leading-6 text-white/60">
          Put your startup on the map. Create your profile for free and get featured to stand out across the Solana
          ecosystem.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/startups/new" className="btn btn-primary btn-md w-full hover:btn-white">
            List your startup
          </Link>
          <Link
            href="/dashboard/startups"
            className="btn btn-white-dark btn-md flex w-full items-center justify-center gap-2 border border-white/10 hover:btn-primary">
            <Star aria-hidden="true" className="size-4 text-[#fbbf24]" />
            <span>Get featured</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default OrbitalSidePanels;
