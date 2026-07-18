'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { StartupStageBadge, MarketSignalBadge, FeaturedBadge } from '../shared/Badges';
import { isCurrentlyFeatured } from '@/utils/featured';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import RevealAnimation from '../animation/RevealAnimation';
import { resolveMediaUrl } from '@/services/mediaService';

interface StartupCardProps {
  startup: Startup;
  index?: number;
}

// Compact marketplace card: the whole card is the link (no CTA button), with
// a sliding chevron as the affordance.
const StartupCard: React.FC<StartupCardProps> = ({ startup, index = 0 }) => {
  const logoUrl = resolveMediaUrl(startup.logo);
  const featured = isCurrentlyFeatured(startup);

  return (
    <RevealAnimation delay={0.1 * (index % 4)}>
      <Link
        href={`/startups/${startup.id}`}
        className={`group flex h-full flex-col rounded-3xl border p-5 transition-colors duration-300 ${
          featured
            ? 'border-amber-400/40 bg-gradient-to-b from-amber-400/[0.08] via-[#0A0A0A] to-[#0A0A0A] shadow-[0_0_35px_-12px_rgba(251,191,36,0.45)] hover:border-amber-400/70'
            : 'border-white/5 bg-[#0A0A0A] hover:border-primary-500/30'
        }`}>
        <div className="flex-grow space-y-3.5">
          {/* Header: logo, name, badges */}
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black transition-colors group-hover:border-primary-500/50">
              {logoUrl ? (
                <Image src={logoUrl} alt={startup.name} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/20">
                  {startup.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h3 className="break-words text-lg font-bold leading-6 text-white transition-colors group-hover:text-primary-400">
                {startup.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {featured && <FeaturedBadge />}
                <StartupStageBadge stage={startup.stage} />
                {startup.isRaising && <MarketSignalBadge type="raising" />}
                <MarketSignalBadge type="acquisition" status={startup.acquisitionStatus} />
              </div>
            </div>
          </div>

          {/* One-liner */}
          <p className="line-clamp-2 text-sm leading-6 text-white/70">{startup.oneLiner}</p>

          {/* Taxonomy */}
          <div className="flex flex-wrap gap-1.5">
            {startup.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase text-white/45">
                {cat}
              </span>
            ))}
            {startup.techStack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-primary-500/10 bg-primary-500/5 px-2 py-0.5 text-[10px] font-medium uppercase text-primary-400/70">
                {tech}
              </span>
            ))}
            {(startup.category.length > 2 || startup.techStack.length > 2) && (
              <span className="self-center text-xs text-white/20">…</span>
            )}
          </div>
        </div>

        {/* Footer: metric, location, affordance */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3.5">
          <p className="min-w-0 truncate text-xs text-white/40">
            {startup.showMrr && startup.mrr !== undefined ? (
              <span suppressHydrationWarning>
                <span className="font-bold text-white/80">${startup.mrr.toLocaleString()}</span> MRR
              </span>
            ) : (
              <span>
                <span className="font-bold text-white/80">{startup.teamSize}</span>{' '}
                {startup.teamSize === 1 ? 'member' : 'members'}
              </span>
            )}
            {startup.city && startup.country && (
              <span>
                {' '}
                · {startup.city}, {startup.country}
              </span>
            )}
          </p>
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-primary-400"
          />
        </div>
      </Link>
    </RevealAnimation>
  );
};

export default StartupCard;
